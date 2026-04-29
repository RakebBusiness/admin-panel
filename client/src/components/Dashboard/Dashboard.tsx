import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Bike,
  CheckCircle,
  DollarSign,
  Star,
  XCircle,
  Users,
  UserCheck,
  Wifi,
  Clock,
  Route,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  MessageCircle,
} from 'lucide-react';
import KpiCard from './KpiCard';
import ChartCard from './ChartCard';
import { useDashboard } from '../../hooks/useDashboard';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ETAT_LABELS: Record<string, string> = {
  completée: 'Terminée',
  réservée: 'Réservée',
  en_cours: 'En Cours',
  annulée: 'Annulée',
};
const ETAT_COLORS: Record<string, string> = {
  completée: '#10B981',
  réservée: '#4F46E5',
  en_cours: '#0EA5E9',
  annulée: '#F43F5E',
};
const STATUS_BADGE: Record<string, string> = {
  completée: 'bg-emerald-100 text-emerald-700',
  réservée: 'bg-indigo-100 text-indigo-700',
  en_cours: 'bg-sky-100 text-sky-700',
  annulée: 'bg-rose-100 text-rose-700',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

// ─── Component ────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [range, setRange] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 864e5),
    new Date(),
  ]);

  const {
    stats,
    courseData,
    revenueTimeline,
    registrations,
    reclamations,
    recentCourses,
    loading,
    refresh,
  } = useDashboard(range);

  const cancellationRate =
    stats && stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0;

  // ── Chart data ─────────────────────────────────────────────────────────────
  const courseChartData = {
    labels: courseData.map(d => ETAT_LABELS[d.etat] || d.etat),
    datasets: [
      {
        data: courseData.map(d => Number(d.count)),
        backgroundColor: courseData.map(d => ETAT_COLORS[d.etat] || '#94A3B8'),
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const revenueChartData = {
    labels: revenueTimeline.map(d => fmtDate(d.date)),
    datasets: [
      {
        label: 'Revenus (DZD)',
        data: revenueTimeline.map(d => d.revenue),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#4F46E5',
        tension: 0.45,
        fill: true,
      },
    ],
  };

  const registrationsChartData = {
    labels: registrations.map(d => fmtDate(d.date)),
    datasets: [
      {
        label: 'Clients',
        data: registrations.map(d => d.clients),
        backgroundColor: '#10B981',
        borderRadius: 5,
        barPercentage: 0.65,
      },
      {
        label: 'Chauffeurs',
        data: registrations.map(d => d.motards),
        backgroundColor: '#4F46E5',
        borderRadius: 5,
        barPercentage: 0.65,
      },
    ],
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Vue d'ensemble de votre plateforme VTC
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm text-sm font-medium text-gray-700">
            <DatePicker
              selected={range[0]}
              onChange={d => d && setRange([d, range[1]])}
              selectsStart
              startDate={range[0]}
              endDate={range[1]}
              dateFormat="dd/MM/yyyy"
              className="w-24 outline-none cursor-pointer bg-transparent"
            />
            <span className="text-gray-300">→</span>
            <DatePicker
              selected={range[1]}
              onChange={d => d && setRange([range[0], d])}
              selectsEnd
              startDate={range[0]}
              endDate={range[1]}
              minDate={range[0]}
              dateFormat="dd/MM/yyyy"
              className="w-24 outline-none cursor-pointer bg-transparent"
            />
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* ── KPI Row 1 – Primary ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Courses Totales"
          value={stats?.total ?? 0}
          icon={Bike}
          color="indigo"
          loading={loading}
        />
        <KpiCard
          title="Revenus Totaux"
          value={stats?.revenue ?? 0}
          icon={DollarSign}
          color="emerald"
          suffix=" DZD"
          loading={loading}
        />
        <KpiCard
          title="Note Moyenne"
          value={stats?.avgRating ?? 0}
          icon={Star}
          color="amber"
          suffix=" / 5"
          decimals={1}
          loading={loading}
        />
        <KpiCard
          title="Taux d'Annulation"
          value={cancellationRate}
          icon={XCircle}
          color="rose"
          suffix="%"
          decimals={1}
          loading={loading}
        />
      </div>

      {/* ── KPI Row 2 – Fleet & Operations ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Clients Totaux"
          value={stats?.totalClients ?? 0}
          icon={Users}
          color="sky"
          loading={loading}
        />
        <KpiCard
          title="Chauffeurs"
          value={stats?.totalMotards ?? 0}
          icon={UserCheck}
          color="violet"
          loading={loading}
        />
        <KpiCard
          title="En Ligne"
          value={stats?.onlineMotards ?? 0}
          icon={Wifi}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          title="Durée Moy."
          value={stats?.avgDuration ?? 0}
          icon={Clock}
          color="amber"
          suffix=" min"
          loading={loading}
        />
        <KpiCard
          title="Distance Moy."
          value={stats?.avgDistance ?? 0}
          icon={Route}
          color="indigo"
          suffix=" km"
          decimals={1}
          loading={loading}
        />
      </div>

      {/* ── Charts Row 1: Revenue timeline + Course donut ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Évolution des Revenus"
            subtitle="Courses complétées sur la période sélectionnée"
            type="area"
            data={revenueChartData}
            loading={loading}
            empty={revenueTimeline.length === 0}
            height={260}
          />
        </div>
        <ChartCard
          title="Répartition des Courses"
          subtitle="Par statut sur la période"
          type="doughnut"
          data={courseChartData}
          loading={loading}
          empty={courseData.length === 0}
          height={260}
        />
      </div>

      {/* ── Charts Row 2: Registrations + Alerts panel ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Nouvelles Inscriptions"
            subtitle="Clients et chauffeurs inscrits par jour"
            type="bar"
            data={registrationsChartData}
            loading={loading}
            empty={registrations.length === 0}
            height={250}
          />
        </div>

        {/* Alerts + Fleet panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Alertes Système</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Éléments nécessitant attention
              </p>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-rose-800">Clients bloqués</p>
                <p className="text-xs text-rose-400 mt-0.5">Accès restreint</p>
              </div>
            </div>
            <span className="text-lg font-bold text-rose-600">{stats?.blockedClients ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Chauffeurs bloqués</p>
                <p className="text-xs text-amber-400 mt-0.5">Suspendus</p>
              </div>
            </div>
            <span className="text-lg font-bold text-amber-600">{stats?.blockedMotards ?? '—'}</span>
          </div>

          {reclamations && (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-800">Réclamations ouvertes</p>
                    <p className="text-xs text-orange-400 mt-0.5">À traiter</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-600">{reclamations.open}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-100">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-sky-800">En cours de traitement</p>
                    <p className="text-xs text-sky-400 mt-0.5">Assignées</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-sky-600">{reclamations.inProgress}</span>
              </div>
            </>
          )}

          {/* Fleet progress bar */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Flotte en ligne
              </p>
              <span className="text-xs font-bold text-gray-700">
                {stats?.onlineMotards ?? 0} / {stats?.totalMotards ?? 0}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width:
                    stats?.totalMotards
                      ? `${Math.min((stats.onlineMotards / stats.totalMotards) * 100, 100)}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Courses Table ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Courses Récentes</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Les 10 dernières courses enregistrées
            </p>
          </div>
          <CheckCircle className="w-4 h-4 text-indigo-400" />
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-10 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : recentCourses.length === 0 ? (
          <div className="py-14 text-center text-sm text-gray-400">
            Aucune course enregistrée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-400 bg-gray-50/70">
                  <th className="px-5 py-3 text-left font-semibold">Client</th>
                  <th className="px-5 py-3 text-left font-semibold">Départ</th>
                  <th className="px-5 py-3 text-left font-semibold">Arrivée</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3 text-left font-semibold">Prix</th>
                  <th className="px-5 py-3 text-left font-semibold">Dist.</th>
                  <th className="px-5 py-3 text-left font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 tabular-nums whitespace-nowrap">
                      {course.id_client}
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-[160px] truncate">
                      {course.point_depart}
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-[160px] truncate">
                      {course.point_arrivee}
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {fmtDateTime(course.date_heure)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                      {course.prix.toLocaleString('fr-DZ')} DZD
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap tabular-nums">
                      {course.distance_km != null ? `${course.distance_km} km` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                          STATUS_BADGE[course.etat] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ETAT_LABELS[course.etat] ?? course.etat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

