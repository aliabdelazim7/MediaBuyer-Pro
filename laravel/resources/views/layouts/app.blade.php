<!DOCTYPE html>
<html lang="ar" dir="rtl" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'MediaBuyer Pro - Laravel CRM')</title>

    <!-- Tailwind CSS & Google Fonts -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            dark: '#0b0e14',
                            card: '#111622',
                            border: '#1e2638',
                            hover: '#161c2b',
                            blue: '#1d4ed8',
                        }
                    }
                }
            }
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    
    <!-- Alpine.js & Lucide Icons -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #0b0e14;
            color: #f1f5f9;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0b0e14;
        }
        ::-webkit-scrollbar-thumb {
            background: #1e2638;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #2b364e;
        }
    </style>
</head>
<body class="min-h-screen bg-[#0b0e14] text-[#f1f5f9] antialiased">
    <!-- Top Navigation Bar -->
    <header class="sticky top-0 z-50 border-b border-[#1e2638] bg-[#0b0e14]/95 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 gap-4">
                
                <!-- Logo & Brand -->
                <div class="flex items-center gap-3">
                    <a href="{{ route('campaigns.index') }}" class="flex items-center gap-2 group">
                        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition">
                            <i data-lucide="shield-check" class="w-4 h-4 text-white"></i>
                        </div>
                        <span class="text-sm font-bold tracking-tight text-[#f1f5f9]">
                            MediaBuyer <span class="text-blue-500">Pro</span>
                        </span>
                    </a>
                </div>

                <!-- Navigation Links -->
                <nav class="hidden lg:flex items-center gap-1 bg-[#111622] p-1 rounded-2xl border border-[#1e2638]">
                    <a href="{{ route('campaigns.index') }}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold {{ request()->routeIs('campaigns.index') ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60' : 'text-[#8b9bb4] hover:text-[#f1f5f9]' }}">
                        <i data-lucide="bar-chart-3" class="w-3.5 h-3.5"></i>
                        <span>الإعلانات</span>
                    </a>
                    <a href="{{ route('inbox.index') }}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold {{ request()->routeIs('inbox.index') ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60' : 'text-amber-400 hover:text-amber-300' }}">
                        <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                        <span>صندوق الرسايل</span>
                    </a>
                    <a href="{{ route('advisor.index') }}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold {{ request()->routeIs('advisor.index') ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60' : 'text-[#8b9bb4] hover:text-[#f1f5f9]' }}">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                        <span>المستشار الذكي CMO</span>
                    </a>
                    <a href="{{ route('accounts.index') }}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold {{ request()->routeIs('accounts.index') ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60' : 'text-[#8b9bb4] hover:text-[#f1f5f9]' }}">
                        <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
                        <span>البورتفوليو</span>
                    </a>
                    <a href="{{ route('rules.index') }}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold {{ request()->routeIs('rules.index') ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60' : 'text-[#8b9bb4] hover:text-[#f1f5f9]' }}">
                        <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                        <span>قواعد الأمان</span>
                    </a>
                    <a href="{{ route('moderation.index') }}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold {{ request()->routeIs('moderation.index') ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60' : 'text-[#8b9bb4] hover:text-[#f1f5f9]' }}">
                        <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                        <span>الموديريشن</span>
                    </a>
                    <a href="{{ route('leads.index') }}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold {{ request()->routeIs('leads.index') ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60' : 'text-[#8b9bb4] hover:text-[#f1f5f9]' }}">
                        <i data-lucide="users" class="w-3.5 h-3.5"></i>
                        <span>العملاء CRM</span>
                    </a>
                    <a href="{{ route('settings.index') }}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold {{ request()->routeIs('settings.index') ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60' : 'text-[#8b9bb4] hover:text-[#f1f5f9]' }}">
                        <i data-lucide="settings" class="w-3.5 h-3.5"></i>
                        <span>الإعدادات</span>
                    </a>
                </nav>

                <!-- Quick Actions -->
                <div class="flex items-center gap-2">
                    <button onclick="fetch('/api/campaigns/sync', {method:'POST'}).then(r=>r.json()).then(d=>location.reload())" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161c2b] hover:bg-[#1e2638] text-[#cbd5e1] border border-[#242e42] transition">
                        <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-blue-400"></i>
                        <span class="hidden sm:inline">مزامنة ميتا</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        @yield('content')
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
        });
    </script>
</body>
</html>
