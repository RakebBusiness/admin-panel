import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type KpiColor = 'brand' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: KpiColor;
  suffix?: string;
  prefix?: string;
  change?: number;
  loading?: boolean;
  decimals?: number;
}

const colorMap: Record<KpiColor, { bg: string; icon: string; border: string }> = {
  brand:   { bg: 'bg-brand/8',    icon: 'text-brand',       border: 'border-brand/15' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-500',   border: 'border-amber-100' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-500',    border: 'border-rose-100' },
  sky:     { bg: 'bg-sky-50',     icon: 'text-sky-600',     border: 'border-sky-100' },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  border: 'border-violet-100' },
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  suffix,
  prefix,
  change,
  loading,
  decimals = 0,
}) => {
  const c = colorMap[color];
  const display = decimals > 0 ? value.toFixed(decimals) : value.toLocaleString('fr-DZ');

  if (loading) {
    return (
      <div className="bg-white rounded-card border border-gray-100 shadow-card p-5 animate-pulse">
        <div className="h-3 bg-gray-100 rounded-full w-3/4 mb-4" />
        <div className="h-7 bg-gray-100 rounded-full w-1/2 mb-3" />
        <div className="h-3 bg-gray-100 rounded-full w-2/5" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card border border-gray-100 shadow-card p-5 hover:shadow-card-hover transition-shadow duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 truncate leading-tight">
            {prefix && (
              <span className="text-sm font-medium text-gray-400 mr-1">{prefix}</span>
            )}
            {display}
            {suffix && (
              <span className="text-sm font-medium text-gray-400 ml-1">{suffix}</span>
            )}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">+{change.toFixed(1)}%</span>
                </>
              ) : change < 0 ? (
                <>
                  <TrendingDown className="w-3 h-3 text-rose-500" />
                  <span className="text-xs font-semibold text-rose-600">{change.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <Minus className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">0%</span>
                </>
              )}
              <span className="text-xs text-gray-400 ml-0.5">vs préc.</span>
            </div>
          )}
        </div>
        <div className={`${c.bg} border ${c.border} p-2.5 rounded-xl flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
