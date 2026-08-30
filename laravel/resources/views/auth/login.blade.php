<!DOCTYPE html>
<html lang="ar" dir="rtl" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول - MediaBuyer Pro</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { font-family: 'Cairo', sans-serif; background-color: #07090e; color: #f1f5f9; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Ambient Glows -->
    <div class="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md bg-[#111622] border border-[#1e2638] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        <!-- Logo -->
        <div class="text-center space-y-2">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/30">
                <i data-lucide="shield-check" class="w-7 h-7 text-white"></i>
            </div>
            <h1 class="text-xl font-bold text-[#f1f5f9] tracking-tight">
                MediaBuyer <span class="text-blue-500">Pro</span>
            </h1>
            <p class="text-xs text-[#8b9bb4]">منظومة إدارة الإعلانات وحماية الميزانيات والـ CRM</p>
        </div>

        @if($errors->any())
            <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {{ $errors->first() }}
            </div>
        @endif

        <form action="{{ route('login.submit') }}" method="POST" class="space-y-4 text-xs">
            @csrf
            <div class="space-y-1.5">
                <label class="block text-[#cbd5e1] font-semibold">البريد الإلكتروني</label>
                <div class="relative">
                    <i data-lucide="mail" class="w-4 h-4 text-[#64748b] absolute right-3.5 top-3"></i>
                    <input type="email" name="email" required value="{{ old('email', 'admin@mediabuyer.pro') }}" class="w-full pl-4 pr-10 py-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#f1f5f9] font-mono focus:outline-none focus:border-blue-500/60">
                </div>
            </div>

            <div class="space-y-1.5">
                <label class="block text-[#cbd5e1] font-semibold">كلمة المرور</label>
                <div class="relative">
                    <i data-lucide="lock" class="w-4 h-4 text-[#64748b] absolute right-3.5 top-3"></i>
                    <input type="password" name="password" required value="Admin@2026" class="w-full pl-10 pr-10 py-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#f1f5f9] font-mono focus:outline-none focus:border-blue-500/60">
                </div>
            </div>

            <div class="p-3 bg-[#0b0e14] border border-[#1e2638] rounded-2xl text-[11px] text-[#8b9bb4] space-y-1">
                <div class="flex justify-between">
                    <span>البريد الافتراضي:</span>
                    <span class="font-mono text-blue-400 font-bold">admin@mediabuyer.pro</span>
                </div>
                <div class="flex justify-between">
                    <span>كلمة المرور:</span>
                    <span class="font-mono text-blue-400 font-bold">Admin@2026</span>
                </div>
            </div>

            <button type="submit" class="w-full py-3 rounded-2xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2">
                <i data-lucide="log-in" class="w-4 h-4"></i>
                <span>تسجيل الدخول للمنظومة</span>
            </button>
        </form>

        <div class="text-center pt-2 border-t border-[#1e2638]">
            <span class="text-[11px] text-[#64748b]">نظام آمن ومحمي بأعلى معايير التشفير والصلاحيات</span>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
        });
    </script>
</body>
</html>
