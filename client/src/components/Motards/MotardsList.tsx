import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  ShieldOff,
  ShieldCheck,
  Bike,
  Users,
  X,
} from 'lucide-react';
import { motardsApi } from '../../services/api';
import MotardForm from './MotardForm';
import MotardProfileModal from './MotardProfileModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = 'nomcomplet' | 'created_at';
type SortDir = 'asc' | 'desc';
type FilterOnline = 'all' | 'online' | 'offline';
type FilterBloque = 'all' | 'actif' | 'bloque';

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

// ─── Component ────────────────────────────────────────────────────────────────
const MotardsList: React.FC = () => {
  const [motards, setMotards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [search, setSearch] = useState('');
  const [filterOnline, setFilterOnline] = useState<FilterOnline>('all');
  const [filterBloque, setFilterBloque] = useState<FilterBloque>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortField, setSortField] = useState<SortField>('nomcomplet');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingMotard, setEditingMotard] = useState<any>(null);
  const [profileNumtel, setProfileNumtel] = useState<string | null>(null);

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMotards();
  }, []);

  const fetchMotards = async () => {
    setLoading(true);
    try {
      const data = await motardsApi.getAll();
      setMotards(Array.isArray(data) ? data : []);
    } catch {
      setMotards([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return motards
      .filter(m => {
        if (q) {
          const inName = (m.nomcomplet ?? '').toLowerCase().includes(q);
          const inPhone = (m.numtel ?? '').includes(q);
          const inPlate = (m.moto?.matricule ?? '').toLowerCase().includes(q);
          const inModel = (m.moto?.modele ?? '').toLowerCase().includes(q);
          if (!inName && !inPhone && !inPlate && !inModel) return false;
        }
        if (filterOnline === 'online' && !m.is_online) return false;
        if (filterOnline === 'offline' && m.is_online) return false;
        if (filterBloque === 'actif' && m.statutbloque) return false;
        if (filterBloque === 'bloque' && !m.statutbloque) return false;
        return true;
      })
      .sort((a, b) => {
        const av = sortField === 'nomcomplet' ? (a.nomcomplet ?? '') : (a.created_at ?? '');
        const bv = sortField === 'nomcomplet' ? (b.nomcomplet ?? '') : (b.created_at ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [motards, search, filterOnline, filterBloque, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleDelete = async (numtel: string) => {
    if (!window.confirm('Supprimer ce chauffeur et sa moto ?')) return;
    await motardsApi.delete(numtel);
    setMotards(prev => prev.filter(m => m.numtel !== numtel));
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMotard(null);
    fetchMotards();
  };

  const handleEdit = (m: any) => {
    setEditingMotard(m);
    setProfileNumtel(null);
    setShowForm(true);
  };

  const handleToggleDone = (updated: any) => {
    setMotards(prev => prev.map(m => (m.numtel === updated.numtel ? { ...m, ...updated } : m)));
  };

  // ── Sort icon helper ─────────────────────────────────────────────────────────
  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === 'asc' ? (
        <ChevronUp className="w-3.5 h-3.5" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5" />
      )
    ) : (
      <ChevronDown className="w-3.5 h-3.5 opacity-30" />
    );

  // ── Stats bar ────────────────────────────────────────────────────────────────
  const totalOnline = motards.filter(m => m.is_online).length;
  const totalBlocked = motards.filter(m => m.statutbloque).length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chauffeurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {motards.length} chauffeur{motards.length !== 1 ? 's' : ''} enregistré{motards.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-brand transition-all duration-150 disabled:opacity-60 active:scale-95"
          >
          <Plus className="w-4 h-4" />
          Nouveau motard
        </button>
      </div>

      {/* ── Stats mini cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: motards.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Users },
          { label: 'En ligne', value: totalOnline, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Wifi },
          { label: 'Hors ligne', value: motards.length - totalOnline, color: 'text-gray-600', bg: 'bg-gray-100', icon: WifiOff },
          { label: 'Bloqués', value: totalBlocked, color: 'text-rose-600', bg: 'bg-rose-50', icon: ShieldOff },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 flex items-center gap-3`}>
            <s.icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filters ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nom, téléphone, matricule, modèle…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-9 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
              showFilters || filterOnline !== 'all' || filterBloque !== 'all'
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Filtres
            {(filterOnline !== 'all' || filterBloque !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-100">
            {/* Online filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Disponibilité :</span>
              {(['all', 'online', 'offline'] as FilterOnline[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setFilterOnline(v); setPage(1); }}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    filterOnline === v
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {v === 'all' ? 'Tous' : v === 'online' ? 'En ligne' : 'Hors ligne'}
                </button>
              ))}
            </div>
            {/* Blocked filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Accès :</span>
              {(['all', 'actif', 'bloque'] as FilterBloque[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setFilterBloque(v); setPage(1); }}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    filterBloque === v
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {v === 'all' ? 'Tous' : v === 'actif' ? 'Actif' : 'Bloqué'}
                </button>
              ))}
            </div>
            {(filterOnline !== 'all' || filterBloque !== 'all') && (
              <button
                onClick={() => { setFilterOnline('all'); setFilterBloque('all'); setPage(1); }}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="py-20 text-center">
            <Bike className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">Aucun chauffeur trouvé</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-2 text-xs text-indigo-500 hover:underline"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-400 bg-gray-50/70 border-b border-gray-100">
                  <th className="px-5 py-3 text-left">
                    <button
                      onClick={() => handleSort('nomcomplet')}
                      className="flex items-center gap-1 font-semibold hover:text-gray-700 transition-colors"
                    >
                      Chauffeur <SortIcon field="nomcomplet" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Téléphone</th>
                  <th className="px-5 py-3 text-left font-semibold">Moto</th>
                  <th className="px-5 py-3 text-left">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 font-semibold hover:text-gray-700 transition-colors"
                    >
                      Inscrit le <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">En ligne</th>
                  <th className="px-5 py-3 text-left font-semibold">Accès</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageItems.map(m => (
                  <tr key={m.numtel} className="hover:bg-gray-50/50 transition-colors">
                    {/* Chauffeur */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 flex-shrink-0">
                          {(m.nomcomplet ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 whitespace-nowrap">{m.nomcomplet}</p>
                        </div>
                      </div>
                    </td>

                    {/* Téléphone */}
                    <td className="px-5 py-3.5 font-mono text-gray-700 whitespace-nowrap">
                      {m.numtel}
                    </td>

                    {/* Moto */}
                    <td className="px-5 py-3.5">
                      {m.moto ? (
                        <div>
                          <p className="font-semibold text-gray-800 whitespace-nowrap">
                            {m.moto.modele}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{m.moto.matricule}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Non assigné</span>
                      )}
                    </td>

                    {/* Inscrit le */}
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                      {fmtDate(m.created_at)}
                    </td>

                    {/* En ligne badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          m.is_online
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {m.is_online ? (
                          <Wifi className="w-3 h-3" />
                        ) : (
                          <WifiOff className="w-3 h-3" />
                        )}
                        {m.is_online ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </td>

                    {/* Accès badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          m.statutbloque
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {m.statutbloque ? (
                          <ShieldOff className="w-3 h-3" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        {m.statutbloque ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setProfileNumtel(m.numtel)}
                          title="Voir le profil"
                          className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(m)}
                          title="Modifier"
                          className="p-2 rounded-xl text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.numtel)}
                          title="Supprimer"
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} sur{' '}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-300">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                        safePage === p
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Profile Modal ─────────────────────────────────────────────────────── */}
      {profileNumtel && (
        <MotardProfileModal
          numtel={profileNumtel}
          onClose={() => setProfileNumtel(null)}
          onEdit={() => {
            const m = motards.find(x => x.numtel === profileNumtel);
            setProfileNumtel(null);
            handleEdit(m);
          }}
          onToggleDone={handleToggleDone}
        />
      )}

      {/* ── Form Modal ───────────────────────────────────────────────────────── */}
      {showForm && (
        <MotardForm motard={editingMotard} onClose={handleFormClose} />
      )}
    </div>
  );
};

export default MotardsList;