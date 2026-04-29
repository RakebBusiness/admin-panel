import React, { useState, useEffect } from 'react';
import {
  X,
  Bike,
  Phone,
  Calendar,
  Wallet,
  Wifi,
  WifiOff,
  ShieldOff,
  ShieldCheck,
  Edit,
  Loader2,
  ImageOff,
  History,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { motardsApi, coursesApi } from '../../services/api';

interface MotardProfileModalProps {
  numtel: string;
  onClose: () => void;
  onEdit: () => void;
  onToggleDone: (updated: any) => void;
}

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const fmtDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const ETAT_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  réservée:   { label: 'Réservée',   icon: <Clock className="w-3 h-3" />,         cls: 'bg-amber-100 text-amber-700' },
  en_cours:   { label: 'En cours',   icon: <AlertCircle className="w-3 h-3" />,   cls: 'bg-blue-100 text-blue-700' },
  completée:  { label: 'Completée',  icon: <CheckCircle2 className="w-3 h-3" />,  cls: 'bg-emerald-100 text-emerald-700' },
  annulée:    { label: 'Annulée',    icon: <XCircle className="w-3 h-3" />,        cls: 'bg-rose-100 text-rose-700' },
};

const EtatBadge: React.FC<{ etat: string }> = ({ etat }) => {
  const cfg = ETAT_CONFIG[etat] ?? { label: etat, icon: null, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const Base64Img: React.FC<{ b64?: string | null; alt: string; className?: string }> = ({
  b64,
  alt,
  className = '',
}) => {
  if (!b64) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}>
        <ImageOff className="w-8 h-8 text-gray-300" />
      </div>
    );
  }
  const src = b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`;
  return <img src={src} alt={alt} className={`object-cover rounded-xl ${className}`} />;
};

const MotardProfileModal: React.FC<MotardProfileModalProps> = ({
  numtel,
  onClose,
  onEdit,
  onToggleDone,
}) => {
  const [motard, setMotard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    motardsApi.getById(numtel).then(data => {
      // Guard: if the API returned an error object, treat as not found
      if (data?.error || data?.message) {
        setMotard(null);
      } else {
        setMotard(data);
        // Fetch ride history once motard is found
        setCoursesLoading(true);
        coursesApi.getByMotard(numtel)
          .then(c => setCourses(Array.isArray(c) ? c : []))
          .catch(() => setCourses([]))
          .finally(() => setCoursesLoading(false));
      }
      setLoading(false);
    }).catch(() => {
      setMotard(null);
      setLoading(false);
    });
  }, [numtel]);

  const handleToggle = async (field: 'statut_bloque' | 'is_online') => {
    if (!motard) return;
    setToggling(field);
    try {
      const updated = await motardsApi.toggle(numtel, field);
      if (!updated?.error) {
        setMotard((prev: any) => ({ ...prev, ...updated }));
        onToggleDone({ ...motard, ...updated });
      }
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">Profil Chauffeur</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Modifier
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : !motard ? (
            <p className="text-center py-20 text-gray-400">Chauffeur introuvable</p>
          ) : (
            <div className="space-y-6">

              {/* ── Identity card ───────────────────────────────────────── */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-indigo-600">
                  {motard.nomcomplet?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">{motard.nomcomplet}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-mono">{motard.numtel}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{fmtDate(motard.datenaiss)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <Wallet className="w-4 h-4" />
                    {Number(motard.wallet_balance ?? 0).toLocaleString('fr-DZ')} DZD
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Portefeuille</p>
                </div>
              </div>

              {/* ── Status toggles ──────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleToggle('is_online')}
                  disabled={toggling !== null}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    motard.is_online
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Disponibilité
                    </p>
                    <div className={`flex items-center gap-1.5 font-bold ${motard.is_online ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {motard.is_online ? (
                        <Wifi className="w-4 h-4" />
                      ) : (
                        <WifiOff className="w-4 h-4" />
                      )}
                      {motard.is_online ? 'En ligne' : 'Hors ligne'}
                    </div>
                  </div>
                  {toggling === 'is_online' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${motard.is_online ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${motard.is_online ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleToggle('statut_bloque')}
                  disabled={toggling !== null}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    motard.statutbloque
                      ? 'border-rose-200 bg-rose-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Accès
                    </p>
                    <div className={`flex items-center gap-1.5 font-bold ${motard.statutbloque ? 'text-rose-700' : 'text-gray-700'}`}>
                      {motard.statutbloque ? (
                        <ShieldOff className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      {motard.statutbloque ? 'Bloqué' : 'Actif'}
                    </div>
                  </div>
                  {toggling === 'statut_bloque' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${motard.statutbloque ? 'bg-rose-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${motard.statutbloque ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  )}
                </button>
              </div>

              {/* ── Permis de conduire ──────────────────────────────────── */}
              {motard.permiscond && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Permis de conduire
                  </p>
                  <Base64Img
                    b64={motard.permiscond}
                    alt="Permis de conduire"
                    className="w-full max-h-48"
                  />
                </div>
              )}

              {/* ── Moto section ────────────────────────────────────────── */}
              {motard.moto && (
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <Bike className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-gray-800">Moto assignée</span>
                    <span className="ml-auto font-mono text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-lg">
                      {motard.moto.matricule}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Modèle</p>
                        <p className="font-semibold text-gray-800">{motard.moto.modele || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Type</p>
                        <p className="font-semibold text-gray-800">{motard.moto.type || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Couleur</p>
                        <p className="font-semibold text-gray-800">{motard.moto.couleur || '—'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Photo moto</p>
                        <Base64Img
                          b64={motard.moto.photo_moto}
                          alt="Photo moto"
                          className="w-full h-36"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Carte grise</p>
                        <Base64Img
                          b64={motard.moto.carte_grise}
                          alt="Carte grise"
                          className="w-full h-36"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Meta ─────────────────────────────────────────────────── */}
              <div className="text-xs text-gray-400 text-right">
                Inscrit le {fmtDate(motard.created_at)}
              </div>

              {/* ── Historique des courses ────────────────────────────────── */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <History className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-bold text-gray-800">Historique des courses</span>
                  {courses.length > 0 && (
                    <span className="ml-auto text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {courses.length}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {coursesLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-5 h-5 text-indigo-300 animate-spin" />
                    </div>
                  ) : courses.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-4">Aucune course effectuée</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {courses.map(c => (
                        <div key={c.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">
                                {c.point_depart} → {c.point_arrivee}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Client : <span className="font-medium">{c.client?.nom_complet ?? c.client?.num_tel ?? '—'}</span>
                              </p>
                              <p className="text-xs text-gray-400">{fmtDateTime(c.date_heure)}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-bold text-emerald-700">
                                {Number(c.prix ?? 0).toLocaleString('fr-DZ')} DZD
                              </p>
                              {c.distance_km && (
                                <p className="text-xs text-gray-400">{Number(c.distance_km).toFixed(1)} km</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2">
                            <EtatBadge etat={c.etat} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotardProfileModal;
