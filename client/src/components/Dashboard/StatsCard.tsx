import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value?: number; // <- valeur rendue optionnelle pour éviter erreur
  icon: typeof LucideIcon;
  color: string;
  change?: string;
  trend?: 'up' | 'down';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, change, trend }) => {
  if (value === undefined) return null; // <- sécurité pour éviter crash

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
