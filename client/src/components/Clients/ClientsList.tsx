import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  ShieldOff,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Users,
  Loader2,
} from 'lucide-react';
import { clientsApi } from '../../services/api';
import ClientDetailModal from './ClientDetailModal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Client {
  numtel: string;
  nomcomplet: string;
  statusbloque: boolean;
  created_at: string;
}

type Filter = 'all' | 'actifs' | 'bloques';
type SortKey = 'nomcomplet' | 'created_at';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 12;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// ─── Component ────────────────────────────────────────────────────────────────
const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('nomcomplet');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    clientsApi
      .getAll()
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: clients.length,
    actifs: clients.filter((c) => !c.statusbloque).length,
    bloques: clients.filter((c) => c.statusbloque).length,
  }), [clients]);

  // ── Filter + Search + Sort ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return clients
      .filter((c) => {
        if (filter === 'actifs') return !c.statusbloque;
        if (filter === 'bloques') return c.statusbloque;
        return true;
      })
      .filter((c) =>
        !q ||
        c.nomcomplet?.toLowerCase().includes(q) ||
        c.numtel?.includes(q)
      )
      .sort((a, b) => {
        const va = a[sortKey] ?? '';
        const vb = b[sortKey] ?? '';
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [clients, search, filter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filter, sortKey, sortDir]);

  // ── Sort toggle ──────────────────────────────────────────────────────────
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
    );

  // ── Toggle block ─────────────────────────────────────────────────────────
  const handleToggle = async (client: Client) => {
    setTogglingId(client.numtel);
    try {
      const updated = await clientsApi.toggle(client.numtel);
      if (updated && !updated.error) {
        const newVal = updated.statusbloque ?? !client.statusbloque;
        setClients((prev) =>
          prev.map((c) => (c.numtel === client.numtel ? { ...c, statusbloque: newVal } : c))
        );
        if (selectedClient?.numtel === client.numtel) {
          setSelectedClient((prev) => prev ? { ...prev, statusbloque: newVal } : prev);
        }
      }
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  };

  // ── Sync modal toggle back to list ───────────────────────────────────────
  const handleModalToggle = (updated: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.numtel === updated.numtel ? updated : c))
    );
    setSelectedClient(updated);
  };

  // ── Initials avatar ──────────────────────────────────────────────────────
  const initials = (name: string) =>
    name
      ?.split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  // ── Pagination pages ─────────────────────────────────────────────────────
  const pageNumbers = (): (number | '…')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (safePage > 3) pages.push('…');
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Gestion des Clients</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'all',     label: 'Total',   value: stats.total,   color: 'text-gray-700',    bg: 'bg-gray-50',    Icon: Users },
          { key: 'actifs',  label: 'Actifs',  value: stats.actifs,  color: 'text-emerald-700', bg: 'bg-emerald-50', Icon: ShieldCheck },
          { key: 'bloques', label: 'Bloqués', value: stats.bloques, color: 'text-rose-700',    bg: 'bg-rose-50',    Icon: ShieldOff },
        ] as const).map(({ key, label, value, color, bg, Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`${bg} rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
              filter === key ? 'ring-2 ring-brand ring-offset-2' : 'hover:opacity-80'
            }`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/60">
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-left">
              <p className={`text-lg font-bold leading-none ${color}`}>
                {loading ? <span className="inline-block w-6 h-4 bg-white/60 rounded animate-pulse" /> : value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou téléphone…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
          />
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3 text-left font-semibold w-12" />
                  <th className="px-5 py-3 text-left font-semibold">
                    <button
                      onClick={() => toggleSort('nomcomplet')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Nom <SortIcon k="nomcomplet" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Téléphone</th>
                  <th className="px-5 py-3 text-left font-semibold">
                    <button
                      onClick={() => toggleSort('created_at')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Inscrit le <SortIcon k="created_at" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Statut</th>
                  <th className="px-5 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((client) => {
                  const isToggling = togglingId === client.numtel;
                  return (
                    <tr key={client.numtel} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold">
                          {initials(client.nomcomplet)}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {client.nomcomplet || '—'}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {client.numtel}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {client.created_at ? fmtDate(client.created_at) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {client.statusbloque ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            <ShieldOff className="w-3 h-3" /> Bloqué
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <ShieldCheck className="w-3 h-3" /> Actif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/8 transition-all"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(client)}
                            disabled={isToggling}
                            className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
                              client.statusbloque
                                ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                                : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={client.statusbloque ? 'Débloquer' : 'Bloquer'}
                          >
                            {isToggling ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : client.statusbloque ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <ShieldOff className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 text-xs">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} — page {safePage} / {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers().map((p, i) =>
              p === '…' ? (
                <span key={`dots-${i}`} className="px-1 text-gray-300">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    safePage === p
                      ? 'bg-brand text-white shadow-brand'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Detail Modal ────────────────────────────────────────────────── */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onToggle={handleModalToggle}
        />
      )}
    </div>
  );
};

export default ClientsList;
