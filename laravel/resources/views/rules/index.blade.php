@extends('layouts.app')

@section('title', 'قواعد الأمان وقاطع النزيف - MediaBuyer Pro')

@section('content')
<div class="space-y-6" x-data="rulesManager()">
    <!-- Top Header -->
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2">
                <i data-lucide="zap" class="w-5 h-5 text-blue-400"></i>
                <span>قواعد الأمان وقاطع النزيف (Auto-Pilot Rules & Kill Switches)</span>
            </h1>
            <p class="text-xs text-[#8b9bb4] mt-0.5">
                إيقاف الحملات الخاسرة فوراً، توسيع ميزانيات الحملات الرابحة، وتنبيهات تليجرام المباشرة
            </p>
        </div>

        <button @click="runEvaluation()" class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white shadow-sm transition">
            <i data-lucide="play" class="w-3.5 h-3.5"></i>
            <span>فحص وتطبيق القواعد الآن</span>
        </button>
    </div>

    <!-- Active Rules List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @forelse($rules as $rule)
            <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 space-y-3 shadow-sm hover:border-[#28344c] transition">
                <div class="flex items-start justify-between">
                    <h3 class="text-xs font-bold text-[#f1f5f9]">{{ $rule->name }}</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {{ $rule->action }}
                    </span>
                </div>

                <div class="space-y-1.5 text-xs text-[#8b9bb4]">
                    <div class="flex justify-between font-mono text-[11px]">
                        <span>المقياس:</span>
                        <span class="font-bold text-[#cbd5e1]">{{ $rule->metric }} {{ $rule->operator }} {{ $rule->threshold }}</span>
                    </div>
                    <div class="flex justify-between font-mono text-[11px]">
                        <span>الحد الأدنى للصرف:</span>
                        <span class="text-[#cbd5e1]">{{ $rule->min_spend_condition ?? 0 }} $</span>
                    </div>
                </div>

                <div class="pt-2 border-t border-[#1e2638] flex items-center justify-between text-[10px] text-[#64748b]">
                    <span>تليجرام: {{ $rule->notify_telegram ? 'مفعل 🟢' : 'معطل' }}</span>
                    <button @click="deleteRule('{{ $rule->id }}')" class="text-rose-400 hover:text-rose-300">حذف</button>
                </div>
            </div>
        @empty
            <div class="col-span-full bg-[#111622] border border-[#1e2638] rounded-2xl p-10 text-center text-xs text-[#64748b]">
                لا توجد قواعد أمان مفعلة حالياً.
            </div>
        @endforelse
    </div>
</div>

<script>
function rulesManager() {
    return {
        async runEvaluation() {
            const res = await fetch('/api/rules/run', { method: 'POST' });
            const data = await res.json();
            alert(`تم فحص القواعد بنجاح! تم تشغيل ${data.triggeredCount} إجراءات.`);
        },
        async deleteRule(id) {
            if (!confirm('هل تريد حذف هذه القاعدة؟')) return;
            const res = await fetch(`/api/rules/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) location.reload();
        }
    }
}
</script>
@endsection
