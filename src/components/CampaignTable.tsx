'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  Search, 
  Edit2, 
  Check, 
  Eye, 
  Layers, 
  Sparkles, 
  X, 
  Calendar, 
  RefreshCw, 
  Award, 
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  Zap
} from 'lucide-react';

export interface AdSetItem {
  id: string;
  name: string;
  platformId: string;
  status: string;
  dailyBudget: number;
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
}

export interface CampaignItem {
  id: string;
  name: string;
  platformId: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  objective: string;
  dailyBudget: number;
  lifetimeBudget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  roas: number;
  ctr: number;
  cpm: number;
  cpc: number;
  conversionValue: number;
  lastSyncedAt: string;
  adAccount?: {
    id?: string;
    name: string;
    currency: string;
    businessPortfolio?: {
      id?: string;
      name: string;
      verificationStatus?: string;
      vertical?: string;
    };
  };
  adSets?: AdSetItem[];
}

interface CampaignTableProps {
  campaigns: CampaignItem[];
  currentDatePreset: string;
  onDatePresetChange: (preset: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({ 
  campaigns, 
  currentDatePreset,
  onDatePresetChange,
  onRefresh,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [performanceFilter, setPerformanceFilter] = useState<'ALL' | 'WINNERS' | 'BLEEDERS'>('ALL');
  const [selectedPortfolioTab, setSelectedPortfolioTab] = useState<string>('ALL');
  const [collapsedPortfolios, setCollapsedPortfolios] = useState<Record<string, boolean>>({});
  
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);

  const datePresets = [
    { id: 'today', label: 'اليوم' },
    { id: 'yesterday', label: 'أمس' },
    { id: 'last_7d', label: 'آخر 7 أيام' },
    { id: 'last_30d', label: 'آخر 30 يوم' },
    { id: 'this_month', label: 'هذا الشهر' },
    { id: 'maximum', label: 'كل الأوقات' },
  ];

  // Optimistic Quick Toggle
  const handleToggleStatus = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLoadingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/campaigns/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onRefresh();
        if (selectedCampaign && selectedCampaign.id === id) {
          setSelectedCampaign((prev) => prev ? { ...prev, status: prev.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : null);
        }
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Optimistic Quick Budget Scale
  const handleQuickBudgetScale = async (id: string, currentBudget: number, percentage: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newBudget = Math.max(5, Math.round(currentBudget * (1 + percentage / 100)));
    setLoadingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/campaigns/${id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyBudget: newBudget }),
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
        if (selectedCampaign && selectedCampaign.id === id) {
          setSelectedCampaign((prev) => prev ? { ...prev, dailyBudget: newBudget } : null);
        }
      }
    } catch (err) {
      console.error('Failed to scale budget:', err);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSaveCustomBudget = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const val = parseFloat(tempBudget);
    if (isNaN(val) || val <= 0) return;

    setLoadingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/campaigns/${id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyBudget: val }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingBudgetId(null);
        onRefresh();
        if (selectedCampaign && selectedCampaign.id === id) {
          setSelectedCampaign((prev) => prev ? { ...prev, dailyBudget: val } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update custom budget:', err);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleCollapsePortfolio = (portfolioName: string) => {
    setCollapsedPortfolios((prev) => ({
      ...prev,
      [portfolioName]: !prev[portfolioName],
    }));
  };

  // Group campaigns by Business Portfolio
  const portfolioGroupsMap = new Map<string, {
    portfolioName: string;
    verificationStatus: string;
    currency: string;
    adAccountName: string;
    campaigns: CampaignItem[];
  }>();

  // Extract unique portfolio list for quick tabs
  const uniquePortfolios = Array.from(
    new Set(campaigns.map((c) => c.adAccount?.businessPortfolio?.name || 'حسابات أخرى'))
  );

  campaigns.forEach((camp) => {
    const pName = camp.adAccount?.businessPortfolio?.name || 'حسابات أخرى';
    const vStatus = camp.adAccount?.businessPortfolio?.verificationStatus || 'verified';
    const currency = camp.adAccount?.currency || 'EGP';
    const adAccName = camp.adAccount?.name || 'حساب إعلاني';

    if (!portfolioGroupsMap.has(pName)) {
      portfolioGroupsMap.set(pName, {
        portfolioName: pName,
        verificationStatus: vStatus,
        currency,
        adAccountName: adAccName,
        campaigns: [],
      });
    }

    portfolioGroupsMap.get(pName)!.campaigns.push(camp);
  });

  const portfolioGroups = Array.from(portfolioGroupsMap.values());

  return (
    <div className="space-y-4">
      {/* 1. TOP INTERACTIVE CONTROLS & DATE PRESETS BAR */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Date Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 w-full lg:w-auto shrink-0">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0 ml-1" />
            {datePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onDatePresetChange(preset.id)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 shrink-0 ${
                  currentDatePreset === preset.id
                    ? 'bg-[#1d4ed8] text-white shadow-sm font-bold'
                    : 'bg-[#0b0e14] text-[#8b9bb4] hover:text-[#f1f5f9] hover:bg-[#161c2b] border border-[#1e2638]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Quick Search & Status Chips */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto">
            <div className="relative w-full sm:w-56 min-w-[140px]">
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث بالاسم أو البورتفوليو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              <div className="flex bg-[#0b0e14] p-0.5 rounded-xl border border-[#1e2638] text-xs shrink-0">
                {(['ALL', 'ACTIVE', 'PAUSED'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition text-[11px] whitespace-nowrap ${
                      statusFilter === s ? 'bg-[#1e293b] text-blue-400 font-bold' : 'text-[#8b9bb4]'
                    }`}
                  >
                    {s === 'ALL' ? 'الكل' : s === 'ACTIVE' ? 'النشطة' : 'المتوقفة'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPerformanceFilter(performanceFilter === 'WINNERS' ? 'ALL' : 'WINNERS')}
                className={`px-2.5 py-1 rounded-xl font-medium transition text-[11px] border flex items-center gap-1 shrink-0 whitespace-nowrap ${
                  performanceFilter === 'WINNERS'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold'
                    : 'bg-[#0b0e14] border-[#1e2638] text-[#8b9bb4] hover:text-[#cbd5e1]'
                }`}
              >
                <Award className="w-3 h-3 text-emerald-400" />
                <span>الرابحة 🏆</span>
              </button>

              <button
                onClick={() => setPerformanceFilter(performanceFilter === 'BLEEDERS' ? 'ALL' : 'BLEEDERS')}
                className={`px-2.5 py-1 rounded-xl font-medium transition text-[11px] border flex items-center gap-1 shrink-0 whitespace-nowrap ${
                  performanceFilter === 'BLEEDERS'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold'
                    : 'bg-[#0b0e14] border-[#1e2638] text-[#8b9bb4] hover:text-[#cbd5e1]'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>نزيف ⚠️</span>
              </button>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 rounded-xl bg-[#0b0e14] hover:bg-[#161c2b] text-blue-400 border border-[#1e2638] transition disabled:opacity-50 shrink-0"
                title="تحديث مباشر"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Quick Filter Tabs */}
        {uniquePortfolios.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#1e2638]">
            <span className="text-[11px] text-[#64748b] font-semibold shrink-0">تصفية البورتفوليو:</span>
            <button
              onClick={() => setSelectedPortfolioTab('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedPortfolioTab === 'ALL'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-[#8b9bb4] hover:text-white'
              }`}
            >
              كافة البورتفوليو ({campaigns.length})
            </button>
            {uniquePortfolios.map((pName) => (
              <button
                key={pName}
                onClick={() => setSelectedPortfolioTab(pName)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedPortfolioTab === pName
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-[#8b9bb4] hover:text-white'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>{pName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. GROUPED PORTFOLIOS SECTIONS */}
      <div className="space-y-5">
        {portfolioGroups
          .filter((group) => selectedPortfolioTab === 'ALL' || group.portfolioName === selectedPortfolioTab)
          .map((group) => {
            // Filter campaigns within this group
            const filteredGroupCampaigns = group.campaigns
              .filter((c) => {
                const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      group.portfolioName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
                let matchesPerf = true;
                if (performanceFilter === 'WINNERS') matchesPerf = c.conversions >= 5 || c.roas >= 3.0;
                if (performanceFilter === 'BLEEDERS') matchesPerf = (c.spend >= 50 && c.conversions === 0) || (c.cpa > 30 && c.status === 'ACTIVE');

                return matchesSearch && matchesStatus && matchesPerf;
              });

            if (filteredGroupCampaigns.length === 0 && (searchTerm || statusFilter !== 'ALL' || performanceFilter !== 'ALL')) {
              return null;
            }

            const totalGroupSpend = filteredGroupCampaigns.reduce((sum, c) => sum + c.spend, 0);
            const totalGroupConversions = filteredGroupCampaigns.reduce((sum, c) => sum + c.conversions, 0);
            const activeGroupCampaigns = filteredGroupCampaigns.filter((c) => c.status === 'ACTIVE').length;
            const avgGroupCpa = totalGroupConversions > 0 ? (totalGroupSpend / totalGroupConversions).toFixed(2) : '0.00';
            
            // Warnings & Health calculation
            const isUnverified = group.verificationStatus === 'not_verified';
            const hasBleederCampaigns = filteredGroupCampaigns.some((c) => (c.spend >= 50 && c.conversions === 0) || (c.cpa > 35 && c.status === 'ACTIVE'));
            const isCollapsed = collapsedPortfolios[group.portfolioName] || false;

            return (
              <div
                key={group.portfolioName}
                className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-sm transition hover:border-[#28344c]"
              >
                {/* DISTINCT BUSINESS PORTFOLIO HEADER DIVIDER */}
                <div
                  onClick={() => toggleCollapsePortfolio(group.portfolioName)}
                  className="p-4 bg-gradient-to-r from-[#0d121c] via-[#111622] to-[#0d121c] border-b border-[#1e2638] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#f1f5f9] tracking-tight">{group.portfolioName}</h3>
                        
                        {/* Currency & Ad Account Badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#1e293b] text-[#cbd5e1] border border-[#334155]/60">
                          {group.adAccountName} ({group.currency})
                        </span>

                        {/* Health & Verification Warnings Badges */}
                        {isUnverified ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>غير موثق (Unverified BM)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>موثق ونشط</span>
                          </span>
                        )}

                        {hasBleederCampaigns && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>⚠️ نزيف ميزانية يتطلب تدخل</span>
                          </span>
                        )}
                      </div>

                      {/* Mobile Metrics Row */}
                      <div className="flex md:hidden items-center gap-2 text-[10px] text-[#8b9bb4] pt-1 font-mono flex-wrap">
                        <span>الصرف: <b className="text-white">{totalGroupSpend.toLocaleString()} {group.currency}</b></span>
                        <span>•</span>
                        <span>النتائج: <b className="text-emerald-400">{totalGroupConversions}</b></span>
                        <span>•</span>
                        <span>CPA: <b className="text-blue-400">{avgGroupCpa}</b></span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{activeGroupCampaigns} نشطة</span>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Quick Performance Metrics & Collapse Trigger */}
                  <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono shrink-0">
                    <div className="hidden md:flex items-center gap-3">
                      <span className="text-[#8b9bb4]">
                        الصرف: <b className="text-white">{totalGroupSpend.toLocaleString()} {group.currency}</b>
                      </span>
                      <span className="text-[#8b9bb4]">•</span>
                      <span className="text-[#8b9bb4]">
                        النتائج: <b className="text-emerald-400">{totalGroupConversions}</b>
                      </span>
                      <span className="text-[#8b9bb4]">•</span>
                      <span className="text-[#8b9bb4]">
                        CPA: <b className="text-blue-400">{avgGroupCpa} {group.currency}</b>
                      </span>
                      <span className="text-[#8b9bb4]">•</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                        {activeGroupCampaigns} نشطة
                      </span>
                    </div>

                    <button className="p-1.5 rounded-lg bg-[#161c2b] text-[#8b9bb4] hover:text-white">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CAMPAIGNS TABLE UNDER THIS BUSINESS PORTFOLIO */}
                {!isCollapsed && (
                  <div className="overflow-x-auto animate-fadeIn">
                    <table className="w-full text-right border-collapse text-xs min-w-[760px]">
                      <thead>
                        <tr className="bg-[#0b0e14] border-b border-[#1e2638] text-[#8b9bb4] font-semibold">
                          <th className="py-2.5 px-4 w-20">الحالة</th>
                          <th className="py-2.5 px-4">اسم الحملة الإعلانية</th>
                          <th className="py-2.5 px-4">الميزانية</th>
                          <th className="py-2.5 px-4">الصرف (Spend)</th>
                          <th className="py-2.5 px-4">النتائج / التحويلات</th>
                          <th className="py-2.5 px-4">تكلفة النتيجة (CPA)</th>
                          <th className="py-2.5 px-4">العائد (ROAS)</th>
                          <th className="py-2.5 px-4">النقرات / CTR</th>
                          <th className="py-2.5 px-4 text-center w-28">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a2130]">
                        {filteredGroupCampaigns.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-[#64748b]">
                              لا توجد حملات نشطة في هذا البورتفوليو تطابق الفلترة
                            </td>
                          </tr>
                        ) : (
                          filteredGroupCampaigns.map((c) => {
                            const isActive = c.status === 'ACTIVE';
                            const isOperating = loadingIds[c.id];

                            return (
                              <tr
                                key={c.id}
                                onClick={() => setSelectedCampaign(c)}
                                className="hover:bg-[#161c2b] transition-colors cursor-pointer group"
                              >
                                {/* Status Toggle */}
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <button
                                    onClick={(e) => handleToggleStatus(c.id, e)}
                                    disabled={isOperating}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition active:scale-95 disabled:opacity-50 ${
                                      isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                        : 'bg-[#161c2b] text-[#94a3b8] border border-[#242e42] hover:bg-[#1e2638]'
                                    }`}
                                    title="تبديل حالة الحملة مباشرة"
                                  >
                                    {isActive ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-[#94a3b8]" />}
                                    <span>{isActive ? 'شغالة' : 'موقوفة'}</span>
                                  </button>
                                </td>

                                {/* Campaign Name */}
                                <td className="py-2.5 px-4 font-medium text-[#f1f5f9] max-w-sm truncate">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-[#f1f5f9] truncate group-hover:text-blue-400 transition flex items-center gap-1.5">
                                      <span>{c.name}</span>
                                      <Eye className="w-3 h-3 text-[#64748b] opacity-0 group-hover:opacity-100 transition shrink-0" />
                                    </span>
                                    <span className="text-[10px] text-[#64748b] font-mono mt-0.5">
                                      {c.objective.replace('OUTCOME_', '')}
                                    </span>
                                  </div>
                                </td>

                                {/* Daily Budget */}
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  {editingBudgetId === c.id ? (
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="number"
                                        value={tempBudget}
                                        onChange={(e) => setTempBudget(e.target.value)}
                                        className="w-16 py-0.5 px-1.5 bg-[#0b0e14] border border-blue-500/60 rounded text-xs text-white font-mono"
                                        autoFocus
                                      />
                                      <button
                                        onClick={(e) => handleSaveCustomBudget(c.id, e)}
                                        className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                      <span className="font-bold text-[#cbd5e1] font-mono">
                                        {c.dailyBudget > 0 ? `${c.dailyBudget.toFixed(0)} ${group.currency}` : (c.lifetimeBudget ? `${c.lifetimeBudget} (إجمالي)` : 'ABO')}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingBudgetId(c.id);
                                          setTempBudget(String(c.dailyBudget));
                                        }}
                                        className="text-[#64748b] hover:text-[#cbd5e1] p-0.5 opacity-0 group-hover:opacity-100 transition"
                                        title="تعديل الميزانية"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* Spend */}
                                <td className="py-2.5 px-4 whitespace-nowrap font-bold text-[#e2e8f0] font-mono">
                                  {c.spend.toFixed(2)} {group.currency}
                                </td>

                                {/* Conversions / Results */}
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <span className="font-bold text-emerald-400 font-mono text-sm">{c.conversions}</span>
                                  <span className="text-[#64748b] text-[11px] mr-1">نتيجة</span>
                                </td>

                                {/* CPA */}
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded-md font-semibold text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {c.cpa > 0 ? `${c.cpa.toFixed(2)} ${group.currency}` : '0.00'}
                                  </span>
                                </td>

                                {/* ROAS */}
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-[#1e2638] text-[#cbd5e1]">
                                    {c.roas > 0 ? `${c.roas.toFixed(2)}x` : '-'}
                                  </span>
                                </td>

                                {/* CTR */}
                                <td className="py-2.5 px-4 whitespace-nowrap text-[#94a3b8]">
                                  <div className="font-mono">{c.ctr.toFixed(2)}% CTR</div>
                                  <div className="text-[10px] text-[#64748b] font-mono">{c.clicks.toLocaleString()} نقرة</div>
                                </td>

                                {/* Quick Actions */}
                                <td className="py-2.5 px-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={(e) => handleQuickBudgetScale(c.id, c.dailyBudget, 20, e)}
                                      disabled={isOperating || c.dailyBudget <= 0}
                                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition disabled:opacity-30"
                                      title="توسيع الميزانية +20%"
                                    >
                                      <TrendingUp className="w-3 h-3" />
                                      <span>+20%</span>
                                    </button>
                                    <button
                                      onClick={() => setSelectedCampaign(c)}
                                      className="p-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 border border-blue-500/20 transition"
                                      title="عرض تفاصيل المجموعات الإعلانية (AdSets)"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* 3. CAMPAIGN DEEP DETAILS MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#111622] border border-[#1e2638] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1e2638] flex items-start justify-between gap-4 shrink-0 bg-[#0e121b]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedCampaign.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-[#1e2638] text-[#94a3b8]'
                    }`}
                  >
                    {selectedCampaign.status === 'ACTIVE' ? 'نشطة حالياً' : 'متوقفة'}
                  </span>
                  <h3 className="text-base font-bold text-[#f1f5f9]">{selectedCampaign.name}</h3>
                </div>
                <p className="text-xs text-[#8b9bb4] font-mono">
                  ID: {selectedCampaign.platformId} • الحساب: {selectedCampaign.adAccount?.name} ({selectedCampaign.adAccount?.currency}) • الهدف: {selectedCampaign.objective}
                </p>
              </div>

              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 rounded-xl bg-[#161c2b] text-[#8b9bb4] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2638]">
                  <span className="text-[11px] text-[#8b9bb4]">الصرف (Spend):</span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {selectedCampaign.spend.toLocaleString()} {selectedCampaign.adAccount?.currency || 'EGP'}
                  </p>
                  <span className="text-[10px] text-[#64748b]">
                    الميزانية: {selectedCampaign.dailyBudget > 0 ? `${selectedCampaign.dailyBudget} يومياً` : 'ABO ديناميكي'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2638]">
                  <span className="text-[11px] text-[#8b9bb4]">النتائج / التحويلات:</span>
                  <p className="text-base font-bold text-emerald-400 font-mono text-lg mt-0.5">
                    {selectedCampaign.conversions}
                  </p>
                  <span className="text-[10px] text-[#64748b]">رسائل / ليدز / أوردرات</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2638]">
                  <span className="text-[11px] text-[#8b9bb4]">تكلفة النتيجة (CPA):</span>
                  <p className="text-base font-bold text-blue-400 font-mono text-lg mt-0.5">
                    {selectedCampaign.cpa.toFixed(2)} {selectedCampaign.adAccount?.currency || 'EGP'}
                  </p>
                  <span className="text-[10px] text-[#64748b]">تكلفة الرسالة / التحويل</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2638]">
                  <span className="text-[11px] text-[#8b9bb4]">نسبة النقر (CTR):</span>
                  <p className={`text-base font-bold font-mono text-lg mt-0.5 ${selectedCampaign.ctr >= 2.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedCampaign.ctr.toFixed(2)}%
                  </p>
                  <span className="text-[10px] text-[#64748b]">
                    {selectedCampaign.clicks.toLocaleString()} نقرة • CPM: {selectedCampaign.cpm.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* AI Strategic Analysis for this specific Campaign */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border border-blue-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>تحليل المستشار الذكي (AI CMO Verdict) لهذه الحملة:</span>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  {selectedCampaign.conversions > 10 && selectedCampaign.ctr >= 2.0 ? (
                    `🔥 أداء رائع جداً! الحملة تحقق ${selectedCampaign.conversions} تحويل بتكلفة تحويل ممتازة (${selectedCampaign.cpa.toFixed(2)} ${selectedCampaign.adAccount?.currency}) ومعدل نقر عالي (${selectedCampaign.ctr.toFixed(2)}%). التوصية: زيادة الميزانية اليومية بنسبة 20% فوراً وتكرار أفضل إعلان في جمهور موازٍ (Scaling).`
                  ) : selectedCampaign.ctr < 1.5 && selectedCampaign.spend > 100 ? (
                    `⚠️ تنبيه إجهاد إعلاني (Ad Fatigue): نسبة النقر (${selectedCampaign.ctr.toFixed(2)}%) منخفضة، مما يعني أن الجمهور الحالي بدأ يمل من الكرييتف. يُنصح بتغيير هوك أول 3 ثواني في الفيديو أو تنزيل إعلان UGC جديد.`
                  ) : (
                    `الحملة تعمل بشكل مستقر. تم تسجيل ${selectedCampaign.conversions} تحويل بمعدل صرف إجمالي ${selectedCampaign.spend.toFixed(2)} ${selectedCampaign.adAccount?.currency}. راقب نسبة الـ CPA ومعدل التفاعل.`
                  )}
                </p>
              </div>

              {/* Underlying Ad Sets Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#f1f5f9] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>المجموعات الإعلانية التابعة للحملة ({selectedCampaign.adSets?.length || 0} AdSets):</span>
                </h4>

                {!selectedCampaign.adSets || selectedCampaign.adSets.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#0b0e14] border border-[#1e2638] text-center text-[#64748b]">
                    لا توجد مجموعات إعلانية مسجلة تحت هذه الحملة حالياً.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCampaign.adSets.map((adset) => (
                      <div
                        key={adset.id}
                        className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#f1f5f9]">{adset.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                adset.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#1e2638] text-[#94a3b8]'
                              }`}
                            >
                              {adset.status === 'ACTIVE' ? 'نشط' : 'متوقف'}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#64748b] font-mono">
                            الميزانية: {adset.dailyBudget > 0 ? `${adset.dailyBudget} ${selectedCampaign.adAccount?.currency}/يوم` : 'ميزانية الحملة'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div className="text-right">
                            <span className="text-[#64748b] text-[10px] block">الصرف</span>
                            <span className="font-bold text-[#cbd5e1]">{adset.spend.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[#64748b] text-[10px] block">التحويلات</span>
                            <span className="font-bold text-emerald-400">{adset.conversions}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-[#1e2638] bg-[#0e121b] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(selectedCampaign.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCampaign.status === 'ACTIVE'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
                >
                  {selectedCampaign.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{selectedCampaign.status === 'ACTIVE' ? 'إيقاف الحملة' : 'تشغيل الحملة'}</span>
                </button>

                <button
                  onClick={() => handleQuickBudgetScale(selectedCampaign.id, selectedCampaign.dailyBudget, 20)}
                  disabled={selectedCampaign.dailyBudget <= 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white transition disabled:opacity-30"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>توسيع الميزانية (+20%)</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 rounded-xl bg-[#161c2b] text-[#94a3b8] hover:text-white font-medium text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
