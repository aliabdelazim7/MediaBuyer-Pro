@extends('layouts.app')

@section('title', 'مسار تحويل العملاء والـ CRM - MediaBuyer Pro')

@section('content')
<div class="space-y-6" x-data="leadPipeline()">
    <!-- Top Header -->
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2">
                <i data-lucide="users" class="w-5 h-5 text-blue-400"></i>
                <span>مسار تحويل العملاء ومتابعة الصفقات (Sales CRM Pipeline)</span>
            </h1>
            <p class="text-xs text-[#8b9bb4] mt-0.5">
                إدارة العملاء المحولين من الإعلانات والشاتات، متابعة مراحل الصفقات، وفتح محادثات الواتساب مباشرة
            </p>
        </div>

        <!-- Metric Badges -->
        <div class="flex items-center gap-3 font-mono text-xs">
            <div class="bg-[#0b0e14] px-3.5 py-1.5 rounded-xl border border-[#1e2638]">
                <span class="text-[#64748b] text-[10px] block">إجمالي العملاء</span>
                <span class="font-bold text-[#f1f5f9]">{{ $leads->count() }}</span>
            </div>
            <div class="bg-[#0b0e14] px-3.5 py-1.5 rounded-xl border border-[#1e2638]">
                <span class="text-[#64748b] text-[10px] block">قيمة الـ Pipeline</span>
                <span class="font-bold text-emerald-400">{{ number_format($leads->sum('deal_value'), 2) }} EGP</span>
            </div>
        </div>
    </div>

    <!-- 6-Stage Kanban Board -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[500px]">
        @php
            $stages = [
                'NEW' => ['title' => 'عملاء جدد', 'color' => 'border-sky-500/40 text-sky-400 bg-sky-500/10'],
                'CONTACTED' => ['title' => 'تم التواصل', 'color' => 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10'],
                'QUALIFIED' => ['title' => 'مؤهل للشراء', 'color' => 'border-amber-500/40 text-amber-400 bg-amber-500/10'],
                'NEGOTIATING' => ['title' => 'جاري التفاوض', 'color' => 'border-purple-500/40 text-purple-400 bg-purple-500/10'],
                'WON' => ['title' => 'تم البيع 🏆', 'color' => 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'],
                'LOST' => ['title' => 'ملغي', 'color' => 'border-rose-500/40 text-rose-400 bg-rose-500/10'],
            ];
        @endphp

        @foreach($stages as $stageKey => $meta)
            @php $stageLeads = $leads->where('stage', $stageKey); @endphp
            <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-3 flex flex-col space-y-3">
                <!-- Column Header -->
                <div class="flex items-center justify-between pb-2 border-b border-[#1e2638]">
                    <span class="text-xs font-bold px-2 py-0.5 rounded-lg border {{ $meta['color'] }}">
                        {{ $meta['title'] }}
                    </span>
                    <span class="text-[11px] font-mono text-[#64748b]">{{ $stageLeads->count() }}</span>
                </div>

                <!-- Cards List -->
                <div class="flex-1 space-y-2.5 overflow-y-auto">
                    @forelse($stageLeads as $lead)
                        <div class="p-3 bg-[#0b0e14] border border-[#1e2638] rounded-xl space-y-2 hover:border-[#28344c] transition shadow-sm">
                            <div class="flex items-start justify-between">
                                <h4 class="text-xs font-bold text-[#f1f5f9]">{{ $lead->name }}</h4>
                                <span class="text-[10px] font-mono text-emerald-400 font-semibold">{{ $lead->deal_value }} {{ $lead->currency }}</span>
                            </div>

                            @if($lead->notes)
                                <p class="text-[10px] text-[#8b9bb4] line-clamp-2 leading-relaxed">{{ $lead->notes }}</p>
                            @endif

                            <div class="text-[10px] text-[#64748b] font-mono">
                                {{ $lead->source }}
                            </div>

                            <!-- WhatsApp Action Button -->
                            @if($lead->phone)
                                <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $lead->phone) }}" target="_blank" class="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold transition">
                                    <i data-lucide="message-square" class="w-3 h-3"></i>
                                    <span>محادثة واتساب</span>
                                </a>
                            @endif
                        </div>
                    @empty
                        <div class="text-center py-6 text-[10px] text-[#64748b]">لا يوجد عملاء</div>
                    @endforelse
                </div>
            </div>
        @endforeach
    </div>
</div>

<script>
function leadPipeline() {
    return {}
}
</script>
@endsection
