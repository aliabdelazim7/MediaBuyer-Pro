<?php

namespace App\Services\AI;

use App\Models\Campaign;

class CMOAdvisorService
{
    public function generateStrategy(?string $portfolioName = null): array
    {
        $campaigns = Campaign::all();
        $totalSpend = $campaigns->sum('spend');
        $totalConversions = $campaigns->sum('conversions');
        $avgCpa = $totalConversions > 0 ? round($totalSpend / $totalConversions, 2) : 0;
        $avgRoas = $campaigns->avg('roas') ?? 0;

        $bottlenecks = [];
        if ($avgCpa > 25) {
            $bottlenecks[] = [
                'type' => 'HIGH_CPA',
                'title' => 'ارتفاع تكلفة الاستحواذ (High CPA Bleed)',
                'advice' => 'اختبر زوايا تسويقية جديدة عبر فيديوهات UGC وركز على إبراز عرض لا يُقاوم (Irresistible Offer).',
            ];
        }

        $hooks = [
            [
                'framework' => 'The Curiosity Gap (فجوة الفضول)',
                'hook' => 'ليه 80% من التجار في مصر بيخسروا فلوسهم في البضاعة؟ السر مش في التسعير!',
                'body' => 'استعراض جودة الفرز الأول وكيف تضمن أعلى هامش ربح في الشكارة بدون هدر.',
                'cta' => 'اطلب كتالوج الشتاء الآن عبر الواتساب واستفد من خصم الجملة.',
            ],
            [
                'framework' => 'Before & After Transformation (التحول قبل وبعد)',
                'hook' => 'شوف شكل الفيلا قبل وبعد تركيب مصعد البانوراما الإيطالي!',
                'body' => 'هيدروليك بدون غرفة محرك، أمان كامل للأطفال وكبار السن، وضمان 10 سنوات شامل.',
                'cta' => 'احجز معاينة مهندس الموقع المجانية اليوم في الرياض وجدة.',
            ],
            [
                'framework' => 'Social Proof & Authority (الإثبات الاجتماعي)',
                'hook' => 'أكتر من 500 مزرعة في الدلتا اختاروا مواتير الحوت! ليه؟',
                'body' => 'عزم جبار، توفير بنزين 40%، وقطع غيار أصلية متوفرة في كل المحافظات مع ضمان الاستبدال الفوري.',
                'cta' => 'اتصل الآن واسأل عن عرض التقسيط بدون فوائد.',
            ],
        ];

        return [
            'metrics' => [
                'totalSpend' => $totalSpend,
                'totalConversions' => $totalConversions,
                'avgCpa' => $avgCpa,
                'avgRoas' => round($avgRoas, 2),
            ],
            'bottlenecks' => $bottlenecks,
            'ugcHooks' => $hooks,
        ];
    }
}
