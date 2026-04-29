import React from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

type ChartType = 'line' | 'area' | 'bar' | 'doughnut';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type: ChartType;
  data: object;
  loading?: boolean;
  empty?: boolean;
  height?: number;
}

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15,23,42,0.88)',
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 12, weight: 'bold' as const },
  bodyFont: { size: 12 },
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
};

const LEGEND_STYLE = {
  position: 'bottom' as const,
  labels: {
    usePointStyle: true,
    padding: 20,
    font: { size: 12 },
    color: '#64748b',
  },
};

const LINE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: { legend: LEGEND_STYLE, tooltip: TOOLTIP_STYLE },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#94a3b8' },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
      ticks: { font: { size: 11 }, color: '#94a3b8' },
      beginAtZero: true,
    },
  },
};

const BAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: { legend: LEGEND_STYLE, tooltip: TOOLTIP_STYLE },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#94a3b8' },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
      ticks: { font: { size: 11 }, color: '#94a3b8' },
      beginAtZero: true,
    },
  },
};

const DOUGHNUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: { legend: LEGEND_STYLE, tooltip: TOOLTIP_STYLE },
};

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  type,
  data,
  loading,
  empty,
  height = 250,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full">
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div style={{ height }} className="relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : empty ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
          Aucune donnée sur la période
        </div>
      ) : type === 'doughnut' ? (
        <Doughnut data={data as any} options={DOUGHNUT_OPTIONS} />
      ) : type === 'bar' ? (
        <Bar data={data as any} options={BAR_OPTIONS} />
      ) : (
        <Line data={data as any} options={LINE_OPTIONS} />
      )}
    </div>
  </div>
);

export default ChartCard;

