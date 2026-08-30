@extends('layouts.app')

@section('title', 'إدارة الحسابات والبورتفوليو - MediaBuyer Pro')

@section('content')
<div class="space-y-6" x-data="accountsManager()">
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2">
                <i data-lucide="building-2" class="w-5 h-5 text-blue-400"></i>
                <span>إدارة الحسابات والبيزنس بورتفوليو (Multi-Portfolio Hub)</span>
            </h1>
            <p class="text-xs text-[#8b9bb4] mt-0.5">
                ربط حسابات فيسبوك متعددة وسحب كافة الـ Business Managers والحسابات الإعلانية والصفحات التابعة لها تلقائياً
            </p>
        </div>

        <button @click="connectModalOpen = true" class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white shadow-sm transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>ربط حساب فيسبوك جديد</span>
        </button>
    </div>

    <!-- Accounts Hierarchy List -->
    <div class="space-y-6">
        @foreach($accounts as $acc)
            <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                            {{ mb_substr($acc->name, 0, 2) }}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-sm font-bold text-[#f1f5f9]">{{ $acc->name }}</h3>
                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">متصل بنشاط</span>
                            </div>
                            <p class="text-[11px] text-[#64748b] font-mono mt-0.5">FB User ID: {{ $acc->fb_user_id }} • {{ $acc->portfolios->count() }} بورتفوليو مكتشف</p>
                        </div>
                    </div>
                </div>

                <!-- Portfolios Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @foreach($acc->portfolios as $portfolio)
                        <div class="bg-[#0b0e14] border border-[#1e2638] rounded-2xl p-4 space-y-3">
                            <div class="flex items-start justify-between border-b border-[#1e2638] pb-2">
                                <div>
                                    <h5 class="font-bold text-xs text-[#f1f5f9]">💼 {{ $portfolio->name }}</h5>
                                    <span class="text-[10px] text-[#64748b] font-mono">BM ID: {{ $portfolio->fb_business_id }}</span>
                                </div>
                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">{{ $portfolio->verification_status }}</span>
                            </div>

                            <!-- Ad Accounts -->
                            <div class="space-y-1.5 text-xs">
                                <span class="text-[#8b9bb4] text-[11px] block">الحسابات الإعلانية ({{ $portfolio->adAccounts->count() }}):</span>
                                @foreach($portfolio->adAccounts as $adAcc)
                                    <div class="p-2 rounded-xl bg-[#111622] border border-[#1e2638] flex justify-between">
                                        <span class="font-semibold text-[#cbd5e1]">{{ $adAcc->name }} ({{ $adAcc->currency }})</span>
                                        <span class="text-emerald-400 font-mono font-semibold">{{ $adAcc->campaigns->count() }} حملات</span>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endforeach
    </div>

    <!-- Connect Modal -->
    <div x-show="connectModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" style="display: none;">
        <div class="bg-[#111622] border border-[#1e2638] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 class="text-sm font-bold text-[#f1f5f9]">ربط حساب فيسبوك واكتشاف البورتفوليو</h3>
            <textarea rows="4" x-model="newToken" placeholder="EAAB..." class="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-white font-mono"></textarea>
            <div class="flex justify-end gap-2">
                <button @click="connectModalOpen = false" class="px-4 py-2 rounded-xl bg-[#161c2b] text-[#94a3b8] text-xs">إلغاء</button>
                <button @click="connectAccount()" class="px-4 py-2 rounded-xl bg-[#1d4ed8] text-white font-bold text-xs">بدء الربط والاكتشاف</button>
            </div>
        </div>
    </div>
</div>

<script>
function accountsManager() {
    return {
        connectModalOpen: false,
        newToken: '',
        async connectAccount() {
            if (!this.newToken) return;
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: this.newToken })
            });
            const data = await res.json();
            if (data.success) {
                location.reload();
            } else {
                alert('خطأ: ' + data.error);
            }
        }
    }
}
</script>
@endsection
