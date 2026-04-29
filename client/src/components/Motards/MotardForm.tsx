import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Bike, User } from 'lucide-react';
import { motardsApi } from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MotardFormProps {
  motard?: any; // null = create mode
  onClose: () => void;
}

type FormErrors = Record<string, string>;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PHONE_RE = /^(0[5-7][0-9]{8}|\+213[5-7][0-9]{8})$/;

function FileInput({
  id,
  label,
  file,
  onChange,
  error,
  hint,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed text-sm transition-colors ${
          error
            ? 'border-rose-300 bg-rose-50 text-rose-700'
            : file
            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50'
        }`}
      >
        {file ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-indigo-500" />
        ) : (
          <Upload className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="truncate">{file ? file.name : hint || 'Cliquez pour uploader'}</span>
      </button>
      <input
        ref={ref}
        type="file"
        id={id}
        accept="image/*,application/pdf"
        className="hidden"
        onChange={e => onChange(e.target.files?.[0] ?? null)}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 ${
    err
      ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
      : 'border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-indigo-100 focus:bg-white'
  }`;

// ─── Component ────────────────────────────────────────────────────────────────
const MotardForm: React.FC<MotardFormProps> = ({ motard, onClose }) => {
  const isEdit = !!motard;

  // Motard fields
  const [numtel, setNumtel] = useState(motard?.numtel ?? '');
  const [nomcomplet, setNomcomplet] = useState(motard?.nomcomplet ?? '');
  const [datenaiss, setDatenaiss] = useState(
    motard?.datenaiss ? motard.datenaiss.split('T')[0] : ''
  );
  const [statutbloque, setStatutbloque] = useState<boolean>(motard?.statutbloque ?? false);

  // Moto fields (used in create AND edit mode)
  const [matricule, setMatricule] = useState(motard?.moto?.matricule ?? '');
  const [modele, setModele] = useState(motard?.moto?.modele ?? '');
  const [couleur, setCouleur] = useState(motard?.moto?.couleur ?? '');
  const [motoType, setMotoType] = useState(motard?.moto?.type ?? '');

  // File uploads
  const [permisCond, setPermisCond] = useState<File | null>(null);
  const [carteGrise, setCarteGrise] = useState<File | null>(null);
  const [photoMoto, setPhotoMoto] = useState<File | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!numtel.trim()) e.numtel = 'Numéro de téléphone requis';
    else if (!PHONE_RE.test(numtel.trim())) e.numtel = 'Format invalide (ex: 0612345678 ou +213612345678)';
    if (!nomcomplet.trim()) e.nomcomplet = 'Nom complet requis';
    if (!isEdit) {
      if (!matricule.trim()) e.matricule = 'Matricule moto requis';
      if (!modele.trim()) e.modele = 'Modèle moto requis';
      if (!motoType.trim()) e.motoType = 'Type moto requis';
      if (!permisCond) e.permisCond = 'Photo du permis requise';
      if (!carteGrise) e.carteGrise = 'Carte grise requise';
      if (!photoMoto) e.photoMoto = 'Photo de la moto requise';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('numtel', numtel.trim());
      fd.append('nomcomplet', nomcomplet.trim());
      if (datenaiss) fd.append('datenaiss', datenaiss);
      if (isEdit) fd.append('statutbloque', String(statutbloque));
      fd.append('modele', modele.trim());
      fd.append('couleur', couleur.trim());
      fd.append('motoType', motoType.trim());
      if (!isEdit) {
        fd.append('matricule', matricule.trim().toUpperCase());
      }
      if (permisCond) fd.append('permisCond', permisCond);
      if (carteGrise) fd.append('carteGrise', carteGrise);
      if (photoMoto) fd.append('photoMoto', photoMoto);

      let result: any;
      if (isEdit) {
        result = await motardsApi.update(motard.numtel, fd);
      } else {
        result = await motardsApi.create(fd);
      }

      // Handle server-side validation errors
      if (result?.errors) {
        setErrors(result.errors);
        return;
      }
      if (result?.error) {
        setGlobalError(result.error);
        return;
      }

      onClose();
    } catch {
      setGlobalError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Bike className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isEdit ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
              </h2>
              <p className="text-xs text-gray-400">
                {isEdit ? 'Modifiez les informations ci-dessous' : 'Chauffeur + moto créés simultanément'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {globalError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {globalError}
            </div>
          )}

          {/* ── Section 1: Chauffeur ──────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Informations Chauffeur
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Numéro de téléphone" error={errors.numtel}>
                <input
                  type="tel"
                  value={numtel}
                  onChange={e => setNumtel(e.target.value)}
                  placeholder="0612345678 ou +213612345678"
                  maxLength={13}
                  disabled={isEdit}
                  className={inputCls(errors.numtel) + (isEdit ? ' opacity-60 cursor-not-allowed' : '')}
                />
              </Field>

              <Field label="Nom complet" error={errors.nomcomplet}>
                <input
                  type="text"
                  value={nomcomplet}
                  readOnly={isEdit}
                  onChange={isEdit ? undefined : e => setNomcomplet(e.target.value)}
                  placeholder="Prénom Nom"
                  className={inputCls(errors.nomcomplet) + (isEdit ? ' opacity-60 cursor-not-allowed' : '')}
                />
              </Field>

              <Field label="Date de naissance">
                <input
                  type="date"
                  value={datenaiss}
                  readOnly={isEdit}
                  onChange={isEdit ? undefined : e => setDatenaiss(e.target.value)}
                  className={inputCls() + (isEdit ? ' opacity-60 cursor-not-allowed' : '')}
                />
              </Field>

              {isEdit && (
                <Field label="Accès">
                  <button
                    type="button"
                    onClick={() => setStatutbloque(v => !v)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all ${
                      statutbloque
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`w-9 h-5 rounded-full relative transition-colors ${
                      statutbloque ? 'bg-rose-500' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        statutbloque ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </div>
                    <span className={`text-sm font-semibold ${
                      statutbloque ? 'text-rose-700' : 'text-gray-600'
                    }`}>
                      {statutbloque ? 'Bloqué' : 'Actif'}
                    </span>
                  </button>
                </Field>
              )}

              <FileInput
                id="permisCond"
                label="Permis de conduire"
                file={permisCond}
                onChange={setPermisCond}
                error={errors.permisCond}
                hint={isEdit ? 'Uploader pour remplacer' : 'Photo du permis (requis)'}
              />
            </div>
          </div>

          {/* ── Section 2: Moto ───────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bike className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Informations Moto
              </h3>
              {isEdit && motard?.moto?.matricule && (
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                  {motard.moto.matricule}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isEdit && (
                <Field label="Matricule" error={errors.matricule}>
                  <input
                    type="text"
                    value={matricule}
                    onChange={e => setMatricule(e.target.value.toUpperCase())}
                    placeholder="12345-678-09"
                    className={inputCls(errors.matricule) + ' font-mono tracking-widest'}
                  />
                </Field>
              )}

              <Field label="Modèle" error={errors.modele}>
                <input
                  type="text"
                  value={modele}
                  onChange={e => setModele(e.target.value)}
                  placeholder="Honda CB125F"
                  className={inputCls(errors.modele)}
                />
              </Field>

              <Field label="Type" error={errors.motoType}>
                <select
                  value={motoType}
                  onChange={e => setMotoType(e.target.value)}
                  className={inputCls(errors.motoType)}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Moto">Moto</option>
                  <option value="Tricycle">Tricycle</option>
                </select>
              </Field>

              <Field label="Couleur">
                <input
                  type="text"
                  value={couleur}
                  onChange={e => setCouleur(e.target.value)}
                  placeholder="Noir, Blanc, Rouge…"
                  className={inputCls()}
                />
              </Field>

              <FileInput
                id="carteGrise"
                label="Carte grise"
                file={carteGrise}
                onChange={setCarteGrise}
                error={errors.carteGrise}
                hint={isEdit ? 'Uploader pour remplacer' : 'Photo de la carte grise (requis)'}
              />

              <FileInput
                id="photoMoto"
                label="Photo de la moto"
                file={photoMoto}
                onChange={setPhotoMoto}
                error={errors.photoMoto}
                hint={isEdit ? 'Uploader pour remplacer' : 'Photo de la moto (requis)'}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le chauffeur'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotardForm;