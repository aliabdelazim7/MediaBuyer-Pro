@extends('layouts.app')

@section('title', 'إعدادات النظام والتكاملات - MediaBuyer Pro')

@section('content')
<div class="space-y-6" x-data="settingsManager()">
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2">
                <i data-lucide="settings" class="w-5 h-5 text-blue-400"></i>
                <span>مركز الإعدادات والتكاملات (Integrations & Webhooks Hub)</span>
            </h1>
            <p class="text-xs text-[#8b9bb4] mt-0.5">
                تأكيد ربط Meta Graph API، إعدادات بوت تليجرام، وتكاملات الويب هوك اللحظية
            </p>
        </div>
    </div>

    <!-- Integrations Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Meta Graph API Status Card -->
        <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-4 shadow-sm">
            <div class="flex items-center justify-between border-b border-[#1e2638] pb-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
                        f
                    </div>
                    <div>
                        <h3 class="text-xs font-bold text-[#f1f5f9]">Meta Graph API v21.0</h3>
                        <p class="text-[10px] text-[#64748b]">اتصال مباشر مع خوادم فيسبوك</p>
                    </div>
                </div>
                <span class="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    متصل بنشاط 🟢
                </span>
            </div>

            <div class="space-y-2 text-xs">
                <div class="p-2.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] flex justify-between">
                    <span class="text-[#64748b]">الحساب المربوط:</span>
                    <span class="font-bold text-white">{{ $activeAccount?->name ?? 'Shahd Henagl' }}</span>
                </div>
                <div class="p-2.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] flex justify-between">
                    <span class="text-[#64748b]">FB User ID:</span>
                    <span class="font-mono text-[#cbd5e1]">{{ $activeAccount?->fb_user_id ?? '4315042295475683' }}</span>
                </div>
            </div>
        </div>

        <!-- Telegram Alerts Card -->
        <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-4 shadow-sm">
            <div class="flex items-center justify-between border-b border-[#1e2638] pb-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                        <i data-lucide="send" class="w-4 h-4"></i>
                    </div>
                    <div>
                        <h3 class="text-xs font-bold text-[#f1f5f9]">Telegram Bot Alerts</h3>
                        <p class="text-[10px] text-[#64748b]">تنبيهات فورية للميديا باير على الهاتف</p>
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-xs text-[#8b9bb4] leading-relaxed">
                    يتم إرسال إشعارات فورية عند تشغيل قاطع النزيف، توسيع الميزانيات، أو وصول تعليق استفسار عن السعر.
                </p>

                <button @click="testTelegram()" class="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold transition">
                    <i data-lucide="send" class="w-3.5 h-3.5"></i>
                    <span>إرسال إشعار تجريبي لهاتفي</span>
                </button>
            </div>
        </div>

    </div>
</div>

<script>
function settingsManager() {
    return {
        async testTelegram() {
            const res = await fetch('/api/settings/telegram-test', { method: 'POST' });
            const data = await res.json();
            alert(data.message);
        }
    }
}
</script>
@endsection
