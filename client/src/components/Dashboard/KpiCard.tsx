import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type KpiColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';

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

const colorMap: Record<KpiColor, { bg: string; icon: string; ring: string }> = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-100' },
  sky: { bg: 'bg-sky-50', icon: 'text-sky-600', ring: 'ring-sky-100' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-100' },
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-4" />
        <div className="h-7 bg-gray-200 rounded-full w-1/2 mb-3" />
        <div className="h-3 bg-gray-200 rounded-full w-2/5" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 truncate">
            {prefix && (
              <span className="text-base font-medium text-gray-400 mr-1">{prefix}</span>
            )}
            {display}
            {suffix && (
              <span className="text-base font-medium text-gray-400 ml-1">{suffix}</span>
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
              <span className="text-xs text-gray-400">vs préc.</span>
            </div>
          )}
        </div>
        <div className={`${c.bg} ring-1 ${c.ring} p-2.5 rounded-xl flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
