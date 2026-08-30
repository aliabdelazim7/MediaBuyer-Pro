'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Zap, 
  MessageSquare, 
  Users, 
  Settings, 
  RefreshCw, 
  ShieldCheck,
  Send,
  Building2,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { PortfolioSwitcher } from './PortfolioSwitcher';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleQuickSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/campaigns', { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`تمت المزامنة بنجاح (${data.result?.syncedCount || 0} حملات)`);
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      setSyncMessage('فشلت المزامنة');
    } finally {
      setSyncing(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'الإعلانات', icon: BarChart3 },
    { href: '/inbox', label: 'صندوق الرسايل', icon: MessageSquare, highlight: true },
    { href: '/advisor', label: 'المستشار الذكي CMO', icon: Sparkles },
    { href: '/accounts', label: 'البورتفوليو', icon: Building2 },
    { href: '/rules', label: 'قواعد الأمان', icon: Zap },
    { href: '/moderation', label: 'الموديريشن', icon: MessageSquare },
    { href: '/leads', label: 'العملاء CRM', icon: Users },
    { href: '/settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2638] bg-[#0b0e14]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Right Section: Brand & Portfolio Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="hidden xl:inline text-sm font-bold tracking-tight text-[#f1f5f9]">
                MediaBuyer Pro
              </span>
            </Link>

            <div className="hidden sm:block h-5 w-[1px] bg-[#1e2638]" />

            {/* Global Portfolio Switcher */}
            <PortfolioSwitcher />
          </div>

          {/* Center Section: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#111622] p-1 rounded-2xl border border-[#1e2638]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60 shadow-sm'
                      : link.highlight
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-[#161c2b]'
                      : 'text-[#8b9bb4] hover:text-[#f1f5f9] hover:bg-[#161c2b]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : link.highlight ? 'text-amber-400' : 'text-[#64748b]'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Left Section: Action Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleQuickSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161c2b] hover:bg-[#1e2638] text-[#cbd5e1] border border-[#242e42] transition active:scale-95 disabled:opacity-50"
              title="مزامنة فورية مع Meta Graph API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-400' : 'text-[#94a3b8]'}`} />
              <span className="hidden md:inline">{syncing ? 'جاري المزامنة...' : 'مزامنة'}</span>
            </button>

            <Link
              href="https://t.me"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/15 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>تليجرام</span>
            </Link>

            {/* Mobile / Tablet Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#161c2b] border border-[#242e42] text-[#94a3b8] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1e2638] bg-[#0b0e14] px-4 py-3 space-y-1 animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#1e293b] text-blue-400 border border-[#334155]/60'
                    : 'text-[#8b9bb4] hover:text-[#f1f5f9] hover:bg-[#111622]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-[#64748b]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {syncMessage && (
        <div className="bg-emerald-500/10 border-t border-emerald-500/20 text-emerald-400 text-xs py-1 text-center font-semibold">
          {syncMessage}
        </div>
      )}
    </header>
  );
};
