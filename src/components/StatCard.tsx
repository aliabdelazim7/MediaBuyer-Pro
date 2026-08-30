import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue',
}) => {
  const iconColorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#111622] border border-[#1e2638] hover:border-[#2b364e] transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#8b9bb4]">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold text-[#f1f5f9] mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${iconColorMap[colorScheme]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#1a2130]">
          {subtitle && <span className="text-[#64748b] text-[11px]">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
