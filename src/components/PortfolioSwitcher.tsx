'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, ChevronDown, Check, Globe, Layers, Plus } from 'lucide-react';
import Link from 'next/link';

export interface PortfolioOption {
  id: string;
  name: string;
  fbBusinessId: string;
  owner: string;
  ownerAvatar?: string;
  adAccountsCount: number;
  pagesCount: number;
  totalSpend: number;
  adAccounts: Array<{
    id: string;
    name: string;
    accountId: string;
    currency: string;
  }>;
}

interface PortfolioSwitcherProps {
  selectedPortfolioId?: string;
  onSelectPortfolio?: (portfolioId: string) => void;
}

export const PortfolioSwitcher: React.FC<PortfolioSwitcherProps> = ({
  selectedPortfolioId = 'ALL',
  onSelectPortfolio,
}) => {
  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentId, setCurrentId] = useState(selectedPortfolioId);

  useEffect(() => {
    fetch('/api/portfolios')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.portfolios) {
          setPortfolios(data.portfolios);
        }
      })
      .catch((err) => console.error('Error fetching portfolios:', err));
  }, []);

  const handleSelect = (id: string) => {
    setCurrentId(id);
    setIsOpen(false);
    if (onSelectPortfolio) {
      onSelectPortfolio(id);
    } else {
      // Dispatches custom event so all open components can re-filter
      const event = new CustomEvent('portfolioChanged', { detail: { portfolioId: id } });
      window.dispatchEvent(event);
    }
  };

  const selectedPortfolio = portfolios.find((p) => p.id === currentId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#161c2b] border border-[#242e42] hover:border-[#334155] text-xs font-semibold text-[#e2e8f0] transition active:scale-95 shadow-sm max-w-[160px] xs:max-w-[200px] sm:max-w-[260px]"
      >
        <div className="w-5 h-5 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
          {currentId === 'ALL' ? <Globe className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
        </div>
        <span className="truncate text-right">
          {currentId === 'ALL' ? 'كافة البيزنس بورتفوليو' : selectedPortfolio?.name || 'اختر بورتفوليو'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] sm:bg-transparent" onClick={() => setIsOpen(false)} />
          <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 rounded-2xl bg-[#111622] border border-[#1e2638] shadow-2xl z-50 p-2 space-y-1 text-xs animate-fadeIn max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-3 py-2 text-[10px] font-bold text-[#8b9bb4] uppercase tracking-wider border-b border-[#1e2638] flex items-center justify-between shrink-0">
              <span>البيزنس بورتفوليو المتصلة</span>
              <Link
                href="/accounts"
                onClick={() => setIsOpen(false)}
                className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>ربط حساب</span>
              </Link>
            </div>

            {/* All Portfolios Aggregated Option */}
            <button
              onClick={() => handleSelect('ALL')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition shrink-0 ${
                currentId === 'ALL'
                  ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20'
                  : 'text-[#cbd5e1] hover:bg-[#161c2b]'
              }`}
            >
              <div className="flex items-center gap-2 text-right">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="leading-tight">عرض شامل مجمع (All)</p>
                  <span className="text-[10px] text-[#64748b]">كافة الحسابات والحملات</span>
                </div>
              </div>
              {currentId === 'ALL' && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
            </button>

            {/* List of Specific Business Portfolios */}
            <div className="overflow-y-auto space-y-1 pt-1 flex-1 max-h-64 sm:max-h-72">
              {portfolios.map((p) => {
                const isSelected = currentId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-right ${
                      isSelected
                        ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20'
                        : 'text-[#cbd5e1] hover:bg-[#161c2b]'
                    }`}
                  >
                    <div className="flex items-center gap-2 max-w-[85%]">
                      <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="truncate text-right">
                        <p className="truncate font-semibold">{p.name}</p>
                        <span className="text-[10px] text-[#64748b] font-mono block">
                          {p.owner} • {p.adAccountsCount} حسابات
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#1e2638] shrink-0">
              <Link
                href="/accounts"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#0b0e14] hover:bg-[#161c2b] text-[#94a3b8] font-bold text-[11px] transition"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>إدارة جميع الحسابات والبورتفوليو</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
