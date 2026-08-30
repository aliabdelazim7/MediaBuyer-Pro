'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight, 
  Lightbulb,
  Zap
} from 'lucide-react';
import { AdvisoryDiagnosis } from '@/domain/services/MarketingAdvisorEngine';

interface MarketingAdvisorWidgetProps {
  portfolioId?: string;
}

export const MarketingAdvisorWidget: React.FC<MarketingAdvisorWidgetProps> = ({ portfolioId = 'ALL' }) => {
  const [diagnosis, setDiagnosis] = useState<AdvisoryDiagnosis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = portfolioId && portfolioId !== 'ALL' ? `?portfolioId=${portfolioId}` : '';
    fetch(`/api/advisor${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.diagnosis) {
          setDiagnosis(data.diagnosis);
        }
      })
      .catch((err) => console.error('Error fetching advisor diagnosis:', err))
      .finally(() => setLoading(false));
  }, [portfolioId]);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-[#111622] border border-[#1e2638] animate-pulse space-y-3">
        <div className="h-4 bg-[#1e2638] rounded w-1/3"></div>
        <div className="h-10 bg-[#0b0e14] rounded-xl"></div>
      </div>
    );
  }

  if (!diagnosis) return null;

  const scoreColor =
    diagnosis.overallHealthScore >= 80
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : diagnosis.overallHealthScore >= 60
      ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <div className="p-5 rounded-2xl bg-[#111622] border border-[#1e2638] hover:border-[#2b364e] transition space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f1f5f9]">المستشار التسويقي واستراتيجي النمو الذكي (AI CMO)</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${scoreColor}`}>
                مؤشر الصحة: {diagnosis.overallHealthScore}/100
              </span>
            </div>
            <p className="text-xs text-[#8b9bb4] mt-0.5">{diagnosis.summaryVerdictArabic}</p>
          </div>
        </div>

        <Link
          href="/advisor"
          className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
        >
          <span>فتح غرفة الاستراتيجية والـ Copywriting</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Actionable Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
        {/* Scaling Opportunities */}
        <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>فرص التوسع ومضاعفة الميزانية (Scaling):</span>
          </div>
          {diagnosis.scalingOpportunities.length === 0 ? (
            <p className="text-[#64748b] text-[11px]">لا توجد حملات مؤهلة للـ Scaling حالياً. ركز على تحسين الكرييتف ومعدل التحويل.</p>
          ) : (
            <ul className="space-y-1.5 text-[#cbd5e1]">
              {diagnosis.scalingOpportunities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                  <span className="text-emerald-400 shrink-0">🚀</span>
                  <div>
                    <strong className="text-white">{item.campaignName}:</strong> {item.reason}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Critical Alerts & Bleeders */}
        <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] space-y-2">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>تنبيهات خفض التكاليف وإيقاف الخسائر (Kill-Switch):</span>
          </div>
          {diagnosis.criticalAlerts.length === 0 ? (
            <p className="text-[#64748b] text-[11px]">ممتاز! لا توجد أي حملات تستنزف ميزانية خارج حدود الأمان.</p>
          ) : (
            <ul className="space-y-1.5 text-[#cbd5e1]">
              {diagnosis.criticalAlerts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                  <span className="text-rose-400 shrink-0">🛑</span>
                  <div>
                    <strong className="text-white">{item.campaignName}:</strong> {item.reason}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* CMO Tactical Advice Snippet */}
      {diagnosis.cmoTacticalRecommendations.length > 0 && (
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-2.5 text-xs text-[#cbd5e1]">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 text-[11px]">نصيحة اليوم من خبير الميديا باينج (Media Buyer Playbook):</span>
            <p className="text-[11px] leading-relaxed text-[#94a3b8]">{diagnosis.cmoTacticalRecommendations[0]}</p>
          </div>
        </div>
      )}
    </div>
  );
};
