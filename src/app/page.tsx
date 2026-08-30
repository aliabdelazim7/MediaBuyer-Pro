'use client';

import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Target, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { CampaignTable, CampaignItem } from '@/components/CampaignTable';
import { MarketingAdvisorWidget } from '@/components/MarketingAdvisorWidget';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingRules, setEvaluatingRules] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activePortfolioId, setActivePortfolioId] = useState<string>('ALL');
  const [currentDatePreset, setCurrentDatePreset] = useState<string>('maximum');
  const [showAdvisorWidget, setShowAdvisorWidget] = useState<boolean>(false);

  const fetchDashboardData = async (
    portfolioId: string = activePortfolioId,
    preset: string = currentDatePreset,
    refreshLive: boolean = false
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (portfolioId && portfolioId !== 'ALL') params.append('portfolioId', portfolioId);
      if (preset) params.append('datePreset', preset);
      if (refreshLive) params.append('refresh', 'true');

      const queryString = params.toString() ? `?${params.toString()}` : '';

      const [statsRes, campsRes] = await Promise.all([
        fetch(`/api/stats${queryString}`),
        fetch(`/api/campaigns${queryString}`),
      ]);

      const statsData = await statsRes.json();
      const campsData = await campsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        setRecentLogs(statsData.recentLogs || []);
      }
      if (campsData.success) {
        setCampaigns(campsData.campaigns || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(activePortfolioId, currentDatePreset);

    // Listen to global portfolio changes from switcher
    const handlePortfolioChange = (e: any) => {
      const newPortfolioId = e.detail?.portfolioId || 'ALL';
      setActivePortfolioId(newPortfolioId);
      fetchDashboardData(newPortfolioId, currentDatePreset);
    };

    window.addEventListener('portfolioChanged', handlePortfolioChange);
    return () => window.removeEventListener('portfolioChanged', handlePortfolioChange);
  }, []);

  const handleDatePresetChange = (newPreset: string) => {
    setCurrentDatePreset(newPreset);
    fetchDashboardData(activePortfolioId, newPreset, true);
  };

  const handleRunRulesNow = async () => {
    setEvaluatingRules(true);
    setActionNotice(null);
    try {
      const res = await fetch('/api/rules/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const triggered = data.result?.triggeredCount || 0;
        setActionNotice(
          triggered > 0
            ? `⚡ تم تطبيق ${triggered} إجراء تلقائي على الحملات وإرسال إشعار تليجرام!`
            : '✅ جميع الحملات تعمل ضمن نطاق الأمان ولا توجد حملات تجاوزت الشروط.'
        );
        fetchDashboardData(activePortfolioId, currentDatePreset);
      }
    } catch (err) {
      setActionNotice('حدث خطأ أثناء فحص القواعد');
    } finally {
      setEvaluatingRules(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. COMPACT TOP HEADER & QUICK ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111622] border border-[#1e2638] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm">
            ⚡
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#f1f5f9] tracking-tight">
              مركز تحكم الميديا باير المباشر
            </h1>
            <p className="text-[11px] text-[#8b9bb4]">متابعة لحظية ومباشرة للأداء، فلاتر التاريخ، وتعديل الميزانيات</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvisorWidget(!showAdvisorWidget)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161c2b] hover:bg-[#1e2638] text-amber-400 border border-amber-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAdvisorWidget ? 'إخفاء المستشار' : 'تحليل الـ AI CMO'}</span>
            {showAdvisorWidget ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={handleRunRulesNow}
            disabled={evaluatingRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${evaluatingRules ? 'animate-bounce' : ''}`} />
            <span>{evaluatingRules ? 'جاري الفحص...' : 'فحص القواعد'}</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-[#64748b] hover:text-[#f1f5f9] text-xs">✕</button>
        </div>
      )}

      {/* Collapsible AI CMO Widget */}
      {showAdvisorWidget && (
        <div className="animate-fadeIn">
          <MarketingAdvisorWidget portfolioId={activePortfolioId} />
        </div>
      )}

      {/* 2. FOUR MAIN HERO STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="إجمالي الصرف"
          value={`${stats ? stats.totalSpend.toLocaleString() : '0.00'}`}
          subtitle={`${stats ? stats.activeCampaigns : 0} حملة نشطة`}
          icon={DollarSign}
          colorScheme="blue"
        />
        <StatCard
          title="النتائج والتحويلات"
          value={`${stats ? stats.totalConversions.toLocaleString() : 0}`}
          subtitle="رسائل وأوردرات"
          icon={ShoppingCart}
          colorScheme="emerald"
        />
        <StatCard
          title="تكلفة النتيجة (Avg CPA)"
          value={`${stats ? stats.avgCpa : '0.00'}`}
          subtitle="متوسط تكلفة الرسالة/الطلب"
          icon={Target}
          trend={{
            value: stats && stats.avgCpa <= 15 ? 'تكلفة رابحة' : 'متوسط',
            isPositive: stats ? stats.avgCpa <= 20 : true,
          }}
          colorScheme="amber"
        />
        <StatCard
          title="متوسط العائد (ROAS)"
          value={`${stats ? stats.avgRoas : '0.00'}x`}
          subtitle="العائد الإجمالي"
          icon={TrendingUp}
          trend={{
            value: stats && stats.avgRoas >= 3 ? 'ممتاز' : 'مستقر',
            isPositive: stats ? stats.avgRoas >= 2.5 : true,
          }}
          colorScheme="purple"
        />
      </div>

      {/* 3. CAMPAIGNS TABLE */}
      <CampaignTable 
        campaigns={campaigns} 
        currentDatePreset={currentDatePreset}
        onDatePresetChange={handleDatePresetChange}
        onRefresh={() => fetchDashboardData(activePortfolioId, currentDatePreset, true)} 
        isLoading={loading}
      />
    </div>
  );
}
