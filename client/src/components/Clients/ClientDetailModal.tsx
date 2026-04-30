import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  User,
  Calendar,
  ShieldOff,
  ShieldCheck,
  Loader2,
  Route,
  CheckCircle2,
  XCircle,
  Clock,
  Bike,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { clientsApi } from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Client {
  numtel: string;
  nomcomplet: string;
  statusbloque: boolean;
  created_at: string;
}

interface Course {
  id: string;
  point_depart: string;
  point_arrivee: string;
  date_heure: string;
  heure_fin?: string;
  etat: 'completée' | 'annulée' | 'en_cours' | 'réservée';
  prix: number;
  distance_km?: number;
  duree_minutes?: number;
  motard?: { numtel: string; nomcomplet: string } | null;
}

interface Props {
  client: Client;
  onClose: () => void;
  onToggle: (updated: Client) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ETAT_CONFIG: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  completée:  { label: 'Terminée',  badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 className="w-3 h-3" /> },
  annulée:    { label: 'Annulée',   badge: 'bg-rose-50 text-rose-700 border-rose-100',          icon: <XCircle className="w-3 h-3" /> },
  en_cours:   { label: 'En cours',  badge: 'bg-sky-50 text-sky-700 border-sky-100',             icon: <Clock className="w-3 h-3" /> },
  réservée:   { label: 'Réservée',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',    icon: <Calendar className="w-3 h-3" /> },
};

// ─── Component ────────────────────────────────────────────────────────────────
const ClientDetailModal: React.FC<Props> = ({ client, onClose, onToggle }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoadingCourses(true);
    setError('');
    clientsApi.getCourses(client.numtel)
      .then((data: Course[] | { error: string }) => {
        if (cancelled) return;
        if (!Array.isArray(data)) {
          setError('Erreur lors du chargement des courses.');
          setCourses([]);
        } else {
          setCourses(data);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger l\'historique.');
      })
      .finally(() => {
        if (!cancelled) setLoadingCourses(false);
      });
    return () => { cancelled = true; };
  }, [client.numtel]);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const completed  = courses.filter(c => c.etat === 'completée');
  const cancelled  = courses.filter(c => c.etat === 'annulée');
  const totalSpent = completed.reduce((sum, c) => sum + Number(c.prix), 0);

  // ── Toggle block ────────────────────────────────────────────────────────────
  const handleToggle = async () => {
    setToggling(true);
    try {
      const updated = await clientsApi.toggle(client.numtel);
      if (updated && updated.numtel) onToggle(updated);
    } finally {
      setToggling(false);
    }
  };

  const isBlocked = client.statusbloque;
  const initials  = client.nomcomplet
    ? client.nomcomplet.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Modal header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${
              isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-brand/10 text-brand'
            }`}>
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {client.nomcomplet || '—'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500 font-mono">{client.numtel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Block / Unblock */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                isBlocked
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              {toggling
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : isBlocked
                  ? <ShieldCheck className="w-3.5 h-3.5" />
                  : <ShieldOff className="w-3.5 h-3.5" />
              }
              {isBlocked ? 'Débloquer' : 'Bloquer'}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Client info ────────────────────────────────────────────────── */}
          <div className="px-6 pt-5 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <InfoTile icon={<User className="w-4 h-4" />} label="Nom complet" value={client.nomcomplet || '—'} />
            <InfoTile icon={<Phone className="w-4 h-4" />} label="Téléphone" value={client.numtel} mono />
            <InfoTile
              icon={<Calendar className="w-4 h-4" />}
              label="Inscrit le"
              value={client.created_at ? fmtDate(client.created_at) : '—'}
            />
          </div>

          {/* Status badge */}
          <div className="px-6 pb-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              isBlocked
                ? 'bg-rose-50 text-rose-700 border-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
              {isBlocked ? <ShieldOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              {isBlocked ? 'Compte bloqué' : 'Compte actif'}
            </span>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-gray-100" />

          {/* ── Ride stats ─────────────────────────────────────────────────── */}
          <div className="px-6 pt-4 pb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Résumé des courses
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile
                label="Total courses"
                value={courses.length}
                color="text-brand"
                bg="bg-brand/8"
                icon={<Route className="w-4 h-4" />}
                loading={loadingCourses}
              />
              <StatTile
                label="Terminées"
                value={completed.length}
                color="text-emerald-600"
                bg="bg-emerald-50"
                icon={<CheckCircle2 className="w-4 h-4" />}
                loading={loadingCourses}
              />
              <StatTile
                label="Annulées"
                value={cancelled.length}
                color="text-rose-600"
                bg="bg-rose-50"
                icon={<XCircle className="w-4 h-4" />}
                loading={loadingCourses}
              />
              <StatTile
                label="Total dépensé"
                value={`${totalSpent.toLocaleString('fr-DZ')} DZD`}
                color="text-indigo-600"
                bg="bg-indigo-50"
                icon={<TrendingUp className="w-4 h-4" />}
                loading={loadingCourses}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-gray-100" />

          {/* ── Ride history ───────────────────────────────────────────────── */}
          <div className="px-6 pt-4 pb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Historique des courses
            </h3>

            {error && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-rose-700 mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {loadingCourses ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="py-10 text-center">
                <Bike className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucune course enregistrée</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-2.5 text-left">Date</th>
                      <th className="px-4 py-2.5 text-left">Trajet</th>
                      <th className="px-4 py-2.5 text-left">Chauffeur</th>
                      <th className="px-4 py-2.5 text-right">Prix</th>
                      <th className="px-4 py-2.5 text-left">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {courses.map(course => {
                      const cfg = ETAT_CONFIG[course.etat] ?? {
                        label: course.etat,
                        badge: 'bg-gray-100 text-gray-600 border-gray-200',
                        icon: null,
                      };
                      return (
                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                            {fmtDateTime(course.date_heure)}
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <p className="text-gray-900 font-medium truncate text-xs">{course.point_depart}</p>
                            <p className="text-gray-400 truncate text-xs">→ {course.point_arrivee}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                            {course.motard?.nomcomplet ?? <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap tabular-nums text-xs">
                            {Number(course.prix).toLocaleString('fr-DZ')} DZD
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${cfg.badge}`}>
                              {cfg.icon}
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Small sub-components ─────────────────────────────────────────────────────
const InfoTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}> = ({ icon, label, value, mono }) => (
  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
      {icon}
      <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-sm font-semibold text-gray-900 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
  </div>
);

const StatTile: React.FC<{
  label: string;
  value: number | string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  loading?: boolean;
}> = ({ label, value, color, bg, icon, loading }) => (
  <div className={`${bg} rounded-xl px-3 py-2.5`}>
    <div className={`${color} mb-1`}>{icon}</div>
    {loading
      ? <div className="h-5 w-10 bg-white/60 animate-pulse rounded" />
      : <p className={`text-lg font-bold ${color} leading-tight`}>{value}</p>
    }
    <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
  </div>
);

export default ClientDetailModal;
