@extends('layouts.app')

@section('title', 'إدارة الحملات الإعلانية - MediaBuyer Pro')

@section('content')
<div class="space-y-6" x-data="campaignManager()">
    <!-- Top Filter Bar -->
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="w-5 h-5 text-blue-400"></i>
                <span>لوحة التحكم في الإعلانات (Media Buyer Command Center)</span>
            </h1>
            <p class="text-xs text-[#8b9bb4] mt-0.5">
                متابعة وإدارة كافة الحملات الإعلانية لجميع البيزنس بورتفوليو مع التوسيع المباشر وتعديل الميزانيات
            </p>
        </div>

        <!-- Date Range Presets -->
        <div class="flex items-center gap-1.5 bg-[#0b0e14] p-1 rounded-xl border border-[#1e2638] text-xs">
            <button @click="changeDate('maximum')" :class="datePreset === 'maximum' ? 'bg-[#1d4ed8] text-white font-bold' : 'text-[#8b9bb4] hover:text-white'" class="px-3 py-1.5 rounded-lg transition">أقصى مدة</button>
            <button @click="changeDate('today')" :class="datePreset === 'today' ? 'bg-[#1d4ed8] text-white font-bold' : 'text-[#8b9bb4] hover:text-white'" class="px-3 py-1.5 rounded-lg transition">اليوم</button>
            <button @click="changeDate('yesterday')" :class="datePreset === 'yesterday' ? 'bg-[#1d4ed8] text-white font-bold' : 'text-[#8b9bb4] hover:text-white'" class="px-3 py-1.5 rounded-lg transition">أمس</button>
            <button @click="changeDate('last_7d')" :class="datePreset === 'last_7d' ? 'bg-[#1d4ed8] text-white font-bold' : 'text-[#8b9bb4] hover:text-white'" class="px-3 py-1.5 rounded-lg transition">آخر 7 أيام</button>
        </div>
    </div>

    <!-- Campaigns Grouped by Business Portfolio -->
    <div class="space-y-6">
        @foreach($portfolios as $portfolio)
            @php
                $allCampaigns = collect($portfolio->adAccounts)->flatMap->campaigns;
                $portfolioSpend = $allCampaigns->sum('spend');
                $portfolioConversions = $allCampaigns->sum('conversions');
                $currency = $portfolio->adAccounts->first()?->currency ?? 'EGP';
                $avgCpa = $portfolioConversions > 0 ? round($portfolioSpend / $portfolioConversions, 2) : 0;
            @endphp

            @if($allCampaigns->count() > 0)
                <div class="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-sm">
                    <!-- Portfolio Header Banner -->
                    <div class="bg-[#0e131d] px-5 py-3.5 border-b border-[#1e2638] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                                {{ mb_substr($portfolio->name, 0, 2) }}
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-[#f1f5f9] flex items-center gap-2">
                                    <span>{{ $portfolio->name }}</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {{ $portfolio->verification_status }}
                                    </span>
                                </h3>
                                <p class="text-[11px] text-[#64748b] font-mono">BM ID: {{ $portfolio->fb_business_id }} • {{ $allCampaigns->count() }} حملات</p>
                            </div>
                        </div>

                        <!-- Portfolio Quick Metrics -->
                        <div class="flex items-center gap-4 text-xs font-mono">
                            <div class="bg-[#0b0e14] px-3 py-1.5 rounded-xl border border-[#1e2638]">
                                <span class="text-[#64748b] text-[10px] block">إجمالي الصرف</span>
                                <span class="font-bold text-[#f1f5f9]">{{ number_format($portfolioSpend, 2) }} {{ $currency }}</span>
                            </div>
                            <div class="bg-[#0b0e14] px-3 py-1.5 rounded-xl border border-[#1e2638]">
                                <span class="text-[#64748b] text-[10px] block">النتائج والرسائل</span>
                                <span class="font-bold text-emerald-400">{{ $portfolioConversions }}</span>
                            </div>
                            <div class="bg-[#0b0e14] px-3 py-1.5 rounded-xl border border-[#1e2638]">
                                <span class="text-[#64748b] text-[10px] block">متوسط CPA</span>
                                <span class="font-bold text-blue-400">{{ $avgCpa }} {{ $currency }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Campaigns Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-right text-xs">
                            <thead class="bg-[#0b0e14] text-[#8b9bb4] border-b border-[#1e2638] text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">الحالة</th>
                                    <th class="py-3 px-4">اسم الحملة الإعلانية</th>
                                    <th class="py-3 px-4">الميزانية اليومية</th>
                                    <th class="py-3 px-4">النتائج (Conversions)</th>
                                    <th class="py-3 px-4">تكلفة النتيجة (CPA)</th>
                                    <th class="py-3 px-4">الصرف (Spend)</th>
                                    <th class="py-3 px-4">CTR %</th>
                                    <th class="py-3 px-4 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#1e2638]/60 text-[#cbd5e1]">
                                @foreach($allCampaigns as $camp)
                                    <tr class="hover:bg-[#161c2b]/50 transition">
                                        <td class="py-3.5 px-4">
                                            <button @click="toggleCampaign('{{ $camp->id }}')" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors {{ $camp->status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-700' }}">
                                                <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform {{ $camp->status === 'ACTIVE' ? '-translate-x-4' : '-translate-x-1' }}"></span>
                                            </button>
                                        </td>
                                        <td class="py-3.5 px-4">
                                            <div class="font-bold text-[#f1f5f9]">{{ $camp->name }}</div>
                                            <div class="text-[10px] text-[#64748b] font-mono">ID: {{ $camp->platform_id }}</div>
                                        </td>
                                        <td class="py-3.5 px-4 font-mono font-semibold">
                                            {{ number_format($camp->daily_budget, 2) }} {{ $currency }}
                                        </td>
                                        <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">
                                            {{ $camp->conversions }}
                                        </td>
                                        <td class="py-3.5 px-4 font-mono font-semibold">
                                            {{ number_format($camp->cpa, 2) }} {{ $currency }}
                                        </td>
                                        <td class="py-3.5 px-4 font-mono font-semibold">
                                            {{ number_format($camp->spend, 2) }} {{ $currency }}
                                        </td>
                                        <td class="py-3.5 px-4 font-mono">
                                            {{ number_format($camp->ctr, 2) }}%
                                        </td>
                                        <td class="py-3.5 px-4 text-center">
                                            <button @click="openBudgetModal('{{ $camp->id }}', '{{ $camp->name }}', {{ $camp->daily_budget }})" class="px-2.5 py-1 rounded-lg bg-[#161c2b] hover:bg-[#1e2638] text-blue-400 border border-blue-500/20 text-[11px] font-semibold transition">
                                                تعديل الميزانية
                                            </button>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif
        @endforeach
    </div>

    <!-- Budget Adjustment Modal -->
    <div x-show="budgetModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" style="display: none;">
        <div class="bg-[#111622] border border-[#1e2638] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 class="text-sm font-bold text-[#f1f5f9]">تعديل ميزانية الحملة ومزامنتها مع ميتا</h3>
            <p class="text-xs text-[#8b9bb4]" x-text="targetCampaignName"></p>
            <div>
                <label class="block text-xs text-[#cbd5e1] mb-1">الميزانية اليومية الجديدة</label>
                <input type="number" step="0.5" x-model="targetDailyBudget" class="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-white font-mono">
            </div>
            <div class="flex items-center justify-end gap-2 pt-2">
                <button @click="budgetModalOpen = false" class="px-4 py-2 rounded-xl bg-[#161c2b] text-[#94a3b8] text-xs">إلغاء</button>
                <button @click="saveBudget()" class="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold text-xs">حفظ وتطبيق على فيسبوك</button>
            </div>
        </div>
    </div>
</div>

<script>
function campaignManager() {
    return {
        datePreset: '{{ $datePreset }}',
        budgetModalOpen: false,
        targetCampaignId: '',
        targetCampaignName: '',
        targetDailyBudget: 0,
        changeDate(preset) {
            window.location.href = `/?datePreset=${preset}`;
        },
        async toggleCampaign(id) {
            const res = await fetch(`/api/campaigns/${id}/toggle`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                location.reload();
            }
        },
        openBudgetModal(id, name, currentBudget) {
            this.targetCampaignId = id;
            this.targetCampaignName = name;
            this.targetDailyBudget = currentBudget;
            this.budgetModalOpen = true;
        },
        async saveBudget() {
            const res = await fetch(`/api/campaigns/${this.targetCampaignId}/budget`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dailyBudget: this.targetDailyBudget })
            });
            const data = await res.json();
            if (data.success) {
                this.budgetModalOpen = false;
                location.reload();
            }
        }
    }
}
</script>
@endsection
