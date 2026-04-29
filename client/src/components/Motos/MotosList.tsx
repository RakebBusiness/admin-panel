import React, { useState, useEffect } from 'react';
import {
  Search,
  Bike,
  Phone,
  User,
  RefreshCw,
  Wifi,
  WifiOff,
  ShieldOff,
  ShieldCheck,
  Eye,
  CircleDot,
} from 'lucide-react';
import { motardsApi } from '../../services/api';
import MotardProfileModal from '../Motards/MotardProfileModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOUR_MAP: Record<string, string> = {
  rouge: '#ef4444', bleu: '#3b82f6', blanc: '#f3f4f6', noir: '#111827',
  vert: '#22c55e', jaune: '#eab308', gris: '#6b7280', orange: '#f97316',
  violet: '#a855f7', marron: '#92400e', silver: '#d1d5db', grise: '#6b7280',
};

function resolveCouleur(couleur?: string | null) {
  if (!couleur) return null;
  const key = couleur.toLowerCase().trim();
  return COLOUR_MAP[key] ?? couleur.toLowerCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; sub?: string; color: 'indigo' | 'emerald' | 'rose' }> = ({
  label, value, sub, color,
}) => {
  const bg = { indigo: 'bg-indigo-50', emerald: 'bg-emerald-50', rose: 'bg-rose-50' }[color];
  const text = { indigo: 'text-indigo-700', emerald: 'text-emerald-700', rose: 'text-rose-700' }[color];
  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${text}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-1.5 bg-gray-200 w-full" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-px bg-gray-100 my-2" />
      <div className="flex gap-2">
        <div className="w-9 h-9 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  </div>
);

interface MotoCardProps { motard: any; onView: () => void; }

const MotoCard: React.FC<MotoCardProps> = ({ motard, onView }) => {
  const moto = motard.moto;
  const couleurCss = resolveCouleur(moto?.couleur);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer"
      onClick={onView}
    >
      <div className="h-1.5 w-full flex-shrink-0" style={{ backgroundColor: couleurCss ?? '#e5e7eb' }} />
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Matricule + type */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
            {moto?.matricule ?? '—'}
          </span>
          {moto?.type && (
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {moto.type}
            </span>
          )}
        </div>
        {/* Model */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Modèle</p>
          <p className="text-base font-bold text-gray-800">{moto?.modele ?? '—'}</p>
        </div>
        {/* Colour */}
        <div className="flex items-center gap-2">
          {couleurCss ? (
            <span className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: couleurCss }} />
          ) : (
            <CircleDot className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
          )}
          <span className="text-sm text-gray-500">{moto?.couleur ?? 'Couleur non renseignée'}</span>
        </div>
        {/* Divider */}
        <div className="border-t border-gray-100" />
        {/* Rider */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
            {motard.nomcomplet?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{motard.nomcomplet}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Phone className="w-3 h-3" />
              <span className="font-mono">{motard.numtel}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {motard.is_online ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" /> En ligne
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" /> Hors ligne
              </span>
            )}
            {motard.statutbloque ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                <ShieldOff className="w-3 h-3" /> Bloqué
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Actif
              </span>
            )}
          </div>
        </div>
        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); onView(); }}
          className="w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
        >
          <Eye className="w-4 h-4" /> Voir le chauffeur
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MotosList: React.FC = () => {
  const [motards, setMotards] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewNumtel, setViewNumtel] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await motardsApi.getAll();
      setMotards(Array.isArray(data) ? data.filter((m: any) => m.moto) : []);
    } catch {
      setMotards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = motards.filter(m => {
    const q = search.toLowerCase();
    return (
      (m.moto?.matricule ?? '').toLowerCase().includes(q) ||
      (m.moto?.modele ?? '').toLowerCase().includes(q) ||
      (m.moto?.couleur ?? '').toLowerCase().includes(q) ||
      (m.nomcomplet ?? '').toLowerCase().includes(q) ||
      (m.numtel ?? '').includes(q)
    );
  });

  const stats = {
    total: motards.length,
    online: motards.filter(m => m.is_online).length,
    bloque: motards.filter(m => m.statutbloque).length,
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Bike className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Parc Moto</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-11">Flotte des motos assignées aux chauffeurs</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total motos" value={stats.total} color="indigo" />
        <StatCard
          label="Chauffeurs en ligne"
          value={stats.online}
          sub={`${stats.total ? Math.round((stats.online / stats.total) * 100) : 0}% de la flotte`}
          color="emerald"
        />
        <StatCard label="Chauffeurs bloqués" value={stats.bloque} color="rose" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Matricule, modèle, couleur, chauffeur..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
        />
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>
          Les motos sont gérées depuis la section <strong>Chauffeurs</strong>. Cliquez sur une carte pour voir le profil complet du chauffeur et son historique de courses.
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Bike className="w-12 h-12 mb-3 text-gray-200" />
          <p className="text-sm font-semibold">
            {search ? 'Aucune moto ne correspond à la recherche' : 'Aucune moto assignée'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-indigo-500 mt-2 hover:underline">
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(m => (
            <MotoCard key={m.numtel} motard={m} onView={() => setViewNumtel(m.numtel)} />
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {viewNumtel && (
        <MotardProfileModal
          numtel={viewNumtel}
          onClose={() => setViewNumtel(null)}
          onEdit={() => setViewNumtel(null)}
          onToggleDone={() => load()}
        />
      )}
    </div>
  );
};

export default MotosList;