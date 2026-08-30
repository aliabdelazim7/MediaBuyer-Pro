<?php

namespace App\Services\Meta;

use App\Models\FacebookUserAccount;
use App\Models\BusinessPortfolio;
use App\Models\AdAccount;
use App\Models\Campaign;
use App\Models\AdSet;
use App\Models\SocialPage;
use App\Models\Conversation;
use App\Models\ChatMessage;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Exception;

class MetaGraphService
{
    protected Client $client;
    protected string $apiVersion = 'v21.0';
    protected string $baseUrl = 'https://graph.facebook.com';

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => "{$this->baseUrl}/{$this->apiVersion}/",
            'timeout'  => 25.0,
        ]);
    }

    /**
     * Resolves the active user access token from DB or config
     */
    public function getActiveToken(?string $overrideToken = null): ?string
    {
        if ($overrideToken) {
            return $overrideToken;
        }

        $user = FacebookUserAccount::where('status', 'ACTIVE')->latest()->first();
        return $user?->access_token ?? config('services.meta.access_token', env('META_ACCESS_TOKEN'));
    }

    /**
     * Connects user token, inspects /me and /me/businesses and discovers all portfolios & assets
     */
    public function discoverAndSyncAccount(string $accessToken): array
    {
        try {
            // 1. Get Me
            $res = $this->client->get('me', [
                'query' => [
                    'fields' => 'id,name,picture',
                    'access_token' => $accessToken,
                ],
            ]);
            $userData = json_decode($res->getBody()->getContents(), true);
            $userId = $userData['id'] ?? null;
            $userName = $userData['name'] ?? 'Facebook User';
            $avatar = $userData['picture']['data']['url'] ?? null;

            if (!$userId) {
                throw new Exception('Invalid user response from Meta');
            }

            $userAccount = FacebookUserAccount::updateOrCreate(
                ['fb_user_id' => $userId],
                [
                    'name' => $userName,
                    'access_token' => $accessToken,
                    'avatar_url' => $avatar,
                    'status' => 'ACTIVE',
                ]
            );

            // 2. Fetch Businesses (Portfolios)
            $bizRes = $this->client->get('me/businesses', [
                'query' => [
                    'fields' => 'id,name,verification_status,vertical',
                    'access_token' => $accessToken,
                ],
            ]);
            $bizData = json_decode($bizRes->getBody()->getContents(), true);
            $portfolios = $bizData['data'] ?? [];

            // 3. Fetch Ad Accounts
            $adAccRes = $this->client->get('me/adaccounts', [
                'query' => [
                    'fields' => 'id,name,account_id,currency,business,account_status',
                    'access_token' => $accessToken,
                ],
            ]);
            $adAccData = json_decode($adAccRes->getBody()->getContents(), true);
            $adAccounts = $adAccData['data'] ?? [];

            // 4. Fetch Pages
            $pagesRes = $this->client->get('me/accounts', [
                'query' => [
                    'fields' => 'id,name,access_token,category',
                    'access_token' => $accessToken,
                ],
            ]);
            $pagesData = json_decode($pagesRes->getBody()->getContents(), true);
            $pages = $pagesData['data'] ?? [];

            $savedPortfolios = [];

            // Persist Portfolios
            foreach ($portfolios as $biz) {
                $portfolio = BusinessPortfolio::updateOrCreate(
                    ['fb_business_id' => $biz['id']],
                    [
                        'name' => $biz['name'],
                        'user_account_id' => $userAccount->id,
                        'verification_status' => $biz['verification_status'] ?? 'VERIFIED',
                        'vertical' => $biz['vertical'] ?? 'ECOMMERCE',
                    ]
                );
                $savedPortfolios[$biz['id']] = $portfolio;
            }

            // Fallback portfolio if ad accounts have no BM
            $defaultPortfolio = null;
            if (empty($savedPortfolios)) {
                $defaultPortfolio = BusinessPortfolio::updateOrCreate(
                    ['fb_business_id' => 'bm_' . $userId],
                    [
                        'name' => "بورتفوليو {$userName}",
                        'user_account_id' => $userAccount->id,
                    ]
                );
            }

            // Persist Ad Accounts
            foreach ($adAccounts as $adAcc) {
                $bmId = $adAcc['business']['id'] ?? null;
                $portfolio = ($bmId && isset($savedPortfolios[$bmId])) ? $savedPortfolios[$bmId] : $defaultPortfolio;

                AdAccount::updateOrCreate(
                    ['account_id' => $adAcc['account_id'] ?? str_replace('act_', '', $adAcc['id'])],
                    [
                        'name' => $adAcc['name'] ?? 'Ad Account',
                        'currency' => $adAcc['currency'] ?? 'USD',
                        'user_account_id' => $userAccount->id,
                        'business_portfolio_id' => $portfolio?->id,
                        'status' => ($adAcc['account_status'] ?? 1) == 1 ? 'ACTIVE' : 'PAUSED',
                    ]
                );
            }

            // Persist Pages
            foreach ($pages as $p) {
                SocialPage::updateOrCreate(
                    ['page_id' => $p['id']],
                    [
                        'name' => $p['name'],
                        'access_token' => $p['access_token'] ?? null,
                        'business_portfolio_id' => $defaultPortfolio?->id,
                    ]
                );
            }

            return [
                'success' => true,
                'user' => $userAccount,
                'portfoliosCount' => count($savedPortfolios),
                'adAccountsCount' => count($adAccounts),
                'pagesCount' => count($pages),
            ];
        } catch (Exception $e) {
            Log::error('Meta discovery error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Syncs campaigns from Meta Graph API for all active ad accounts
     */
    public function syncCampaigns(?string $datePreset = 'maximum'): array
    {
        $token = $this->getActiveToken();
        if (!$token) {
            return ['success' => false, 'error' => 'No active Meta token'];
        }

        $adAccounts = AdAccount::where('status', 'ACTIVE')->get();
        $syncedCount = 0;

        foreach ($adAccounts as $account) {
            try {
                $actId = 'act_' . ltrim($account->account_id, 'act_');
                $fields = 'id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(' . $datePreset . '){spend,impressions,clicks,cpc,cpm,ctr,actions,action_values,cost_per_action_type}';

                $res = $this->client->get("{$actId}/campaigns", [
                    'query' => [
                        'fields' => $fields,
                        'access_token' => $token,
                        'limit' => 50,
                    ],
                ]);

                $data = json_decode($res->getBody()->getContents(), true);
                $campaignsData = $data['data'] ?? [];

                foreach ($campaignsData as $c) {
                    $insights = $c['insights']['data'][0] ?? [];
                    $spend = (float)($insights['spend'] ?? 0);
                    $impressions = (int)($insights['impressions'] ?? 0);
                    $clicks = (int)($insights['clicks'] ?? 0);
                    $ctr = (float)($insights['ctr'] ?? 0);
                    $cpc = (float)($insights['cpc'] ?? 0);
                    $cpm = (float)($insights['cpm'] ?? 0);

                    // Extract exact Meta Results Hierarchy
                    $conversions = 0;
                    $cpa = 0;
                    if (isset($insights['actions'])) {
                        foreach ($insights['actions'] as $act) {
                            if ($act['action_type'] === 'onsite_conversion.messaging_conversation_started_7d') {
                                $conversions = (int)$act['value'];
                                break;
                            } elseif (in_array($act['action_type'], ['purchase', 'omni_purchase', 'lead'])) {
                                $conversions = (int)$act['value'];
                            }
                        }
                    }

                    if ($conversions > 0) {
                        $cpa = round($spend / $conversions, 2);
                    }

                    $dailyBudget = isset($c['daily_budget']) ? (float)$c['daily_budget'] / 100 : 0;
                    $lifetimeBudget = isset($c['lifetime_budget']) ? (float)$c['lifetime_budget'] / 100 : 0;

                    Campaign::updateOrCreate(
                        ['platform_id' => $c['id']],
                        [
                            'name' => $c['name'],
                            'ad_account_id' => $account->id,
                            'status' => $c['status'],
                            'objective' => $c['objective'] ?? 'OUTCOME_SALES',
                            'daily_budget' => $dailyBudget,
                            'lifetime_budget' => $lifetimeBudget,
                            'spend' => $spend,
                            'impressions' => $impressions,
                            'clicks' => $clicks,
                            'ctr' => $ctr,
                            'cpc' => $cpc,
                            'cpm' => $cpm,
                            'conversions' => $conversions,
                            'cpa' => $cpa,
                            'roas' => ($spend > 0 && isset($insights['action_values'][0]['value'])) ? round((float)$insights['action_values'][0]['value'] / $spend, 2) : 0,
                            'last_synced_at' => now(),
                        ]
                    );

                    $syncedCount++;
                }
            } catch (Exception $e) {
                Log::warning("Error syncing ad account {$account->name}: " . $e->getMessage());
            }
        }

        return ['success' => true, 'syncedCount' => $syncedCount];
    }

    /**
     * Toggles Campaign Status (ACTIVE / PAUSED) on Meta Graph API
     */
    public function toggleCampaignStatus(string $platformId, string $newStatus): bool
    {
        $token = $this->getActiveToken();
        try {
            $this->client->post($platformId, [
                'form_params' => [
                    'status' => $newStatus,
                    'access_token' => $token,
                ],
            ]);
            return true;
        } catch (Exception $e) {
            Log::error("Failed to toggle campaign {$platformId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Updates Campaign Budget on Meta API (Supports both ABO adsets and CBO campaign)
     */
    public function updateBudget(string $platformId, float $newDailyBudget): bool
    {
        $token = $this->getActiveToken();
        $cents = (int)round($newDailyBudget * 100);

        try {
            // Check if ABO (has active adsets)
            $adSetsRes = $this->client->get("{$platformId}/adsets", [
                'query' => [
                    'fields' => 'id,status,daily_budget',
                    'access_token' => $token,
                ],
            ]);
            $adSetsData = json_decode($adSetsRes->getBody()->getContents(), true);
            $adSets = $adSetsData['data'] ?? [];

            $activeAdSets = array_filter($adSets, fn($a) => ($a['status'] ?? '') === 'ACTIVE');

            if (!empty($activeAdSets)) {
                $perAdSetCents = (int)round($cents / count($activeAdSets));
                foreach ($activeAdSets as $adSet) {
                    $this->client->post($adSet['id'], [
                        'form_params' => [
                            'daily_budget' => $perAdSetCents,
                            'access_token' => $token,
                        ],
                    ]);
                }
            } else {
                // CBO budget update
                $this->client->post($platformId, [
                    'form_params' => [
                        'daily_budget' => $cents,
                        'access_token' => $token,
                    ],
                ]);
            }

            return true;
        } catch (Exception $e) {
            Log::error("Failed to update budget for {$platformId}: " . $e->getMessage());
            return false;
        }
    }
}
