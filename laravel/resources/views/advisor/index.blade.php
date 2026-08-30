@extends('layouts.app')

@section('title', 'المستشار الذكي CMO - MediaBuyer Pro')

@section('content')
<div class="space-y-6">
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2">
                <i data-lucide="sparkles" class="w-5 h-5 text-amber-400"></i>
                <span>المستشار الاستراتيجي الذكي (AI CMO Growth Lab)</span>
            </h1>
            <p class="text-xs text-[#8b9bb4] mt-0.5">
                تحليل اقتصاديات الوحدة (Unit Economics)، تشخيص الاختناقات الإعلانية، وتوليد سكريبتات UGC عالية التحويل
            </p>
        </div>
    </div>

    <!-- Hooks & Scripts 3-Column Generator -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @foreach($strategy['ugcHooks'] ?? [] as $hook)
            <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-4 shadow-sm">
                <div class="flex items-center justify-between border-b border-[#1e2638] pb-2">
                    <span class="text-xs font-bold text-blue-400">{{ $hook['framework'] }}</span>
                </div>

                <div class="space-y-3 text-xs leading-relaxed">
                    <div class="p-3 bg-[#0b0e14] border border-[#1e2638] rounded-xl">
                        <span class="text-[10px] text-amber-400 font-bold block mb-1">🎯 الخطاف البيعي (Hook):</span>
                        <p class="text-[#f1f5f9]">{{ $hook['hook'] }}</p>
                    </div>

                    <div class="p-3 bg-[#0b0e14] border border-[#1e2638] rounded-xl">
                        <span class="text-[10px] text-indigo-400 font-bold block mb-1">📦 محتوى العرض (Body):</span>
                        <p class="text-[#cbd5e1]">{{ $hook['body'] }}</p>
                    </div>

                    <div class="p-3 bg-[#0b0e14] border border-[#1e2638] rounded-xl">
                        <span class="text-[10px] text-emerald-400 font-bold block mb-1">🚀 الدعوة لاتخاذ إجراء (CTA):</span>
                        <p class="text-emerald-300">{{ $hook['cta'] }}</p>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</div>
@endsection
