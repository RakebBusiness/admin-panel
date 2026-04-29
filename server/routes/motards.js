const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

const uploadFields = upload.fields([
  { name: 'permisCond', maxCount: 1 },
  { name: 'carteGrise', maxCount: 1 },
  { name: 'photoMoto', maxCount: 1 },
]);

// Algerian mobile numbers: 05x, 06x, 07x
const PHONE_RE = /^(0[5-7][0-9]{8}|\+213[5-7][0-9]{8})$/;

const SEL_MOTARD =
  'numtel:num_tel, nomcomplet:nom_complet, statutbloque:statut_bloque, ' +
  'matriculemoto:matricule_moto, datenaiss:date_naiss, permiscond:permis_cond, ' +
  'is_online, created_at, updated_at, wallet_balance';
const SEL_MOTO_LIST = 'matricule, modele, couleur, type';
const SEL_MOTO_FULL = 'matricule, modele, couleur, type, carte_grise, photo_moto';

// ── GET all motards (moto nested, no base64 images for perf) ─────────────────
router.get('/', async (req, res) => {
  try {
    const [{ data: motards, error: e1 }, { data: motos, error: e2 }] = await Promise.all([
      supabase.from('motard').select(SEL_MOTARD).order('nom_complet'),
      supabase.from('moto').select(SEL_MOTO_LIST),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;

    const result = motards.map(m => ({
      ...m,
      moto: motos.find(mo => mo.matricule === m.matriculemoto) || null,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET single motard (full moto with images) ─────────────────────────────────
router.get('/:numtel', async (req, res) => {
  try {
    const { data: motard, error: e1 } = await supabase
      .from('motard')
      .select(SEL_MOTARD)
      .eq('num_tel', req.params.numtel)
      .maybeSingle();
    if (e1) throw e1;
    if (!motard) return res.status(404).json({ message: 'Motard introuvable' });

    let moto = null;
    if (motard.matriculemoto) {
      const { data, error: e2 } = await supabase
        .from('moto')
        .select(SEL_MOTO_FULL)
        .eq('matricule', motard.matriculemoto)
        .maybeSingle();
      if (!e2) moto = data;
    }
    res.json({ ...motard, moto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST create motard + auto-create linked moto ──────────────────────────────
router.post('/', uploadFields, async (req, res) => {
  const { numtel, nomcomplet, datenaiss, matricule, modele, couleur, motoType } = req.body;
  const files = req.files || {};

  // Validation
  const errors = {};
  if (!numtel?.trim()) errors.numtel = 'Numéro de téléphone requis';
  else if (!PHONE_RE.test(numtel.trim())) errors.numtel = 'Format invalide (ex: 0612345678 ou +213612345678)';
  if (!nomcomplet?.trim()) errors.nomcomplet = 'Nom complet requis';
  if (!matricule?.trim()) errors.matricule = 'Matricule moto requis';
  if (!modele?.trim()) errors.modele = 'Modèle moto requis';
  if (!motoType?.trim()) errors.motoType = 'Type moto requis';
  if (!files.permisCond?.length) errors.permisCond = 'Photo du permis requise';
  if (!files.carteGrise?.length) errors.carteGrise = 'Carte grise requise';
  if (!files.photoMoto?.length) errors.photoMoto = 'Photo de la moto requise';
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  try {
    const mat = matricule.trim().toUpperCase();

    // Uniqueness checks
    const [{ data: existM }, { data: existMoto }] = await Promise.all([
      supabase.from('motard').select('num_tel').eq('num_tel', numtel.trim()).maybeSingle(),
      supabase.from('moto').select('matricule').eq('matricule', mat).maybeSingle(),
    ]);
    if (existM) return res.status(409).json({ errors: { numtel: 'Ce numéro est déjà enregistré' } });
    if (existMoto) return res.status(409).json({ errors: { matricule: 'Ce matricule est déjà utilisé' } });

    // Create moto first
    const { data: newMoto, error: motoErr } = await supabase
      .from('moto')
      .insert({
        matricule: mat,
        modele: modele.trim(),
        couleur: couleur?.trim() || null,
        type: motoType.trim(),
        carte_grise: files.carteGrise[0].buffer.toString('base64'),
        photo_moto: files.photoMoto[0].buffer.toString('base64'),
      })
      .select(SEL_MOTO_FULL)
      .single();
    if (motoErr) throw motoErr;

    // Create motard linked to the new moto
    const { data: newMotard, error: motardErr } = await supabase
      .from('motard')
      .insert({
        num_tel: numtel.trim(),
        nom_complet: nomcomplet.trim(),
        matricule_moto: mat,
        date_naiss: datenaiss || null,
        permis_cond: files.permisCond[0].buffer.toString('base64'),
      })
      .select(SEL_MOTARD)
      .single();
    if (motardErr) {
      // Rollback: remove the moto we just created
      await supabase.from('moto').delete().eq('matricule', mat);
      throw motardErr;
    }

    res.status(201).json({ ...newMotard, moto: newMoto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT update motard + linked moto ──────────────────────────────────────────
router.put('/:numtel', uploadFields, async (req, res) => {
  try {
    const { nomcomplet, datenaiss, statutbloque, modele, couleur, motoType } = req.body;
    const files = req.files || {};

    const { data: existing, error: findErr } = await supabase
      .from('motard')
      .select('numtel:num_tel, matriculemoto:matricule_moto')
      .eq('num_tel', req.params.numtel)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!existing) return res.status(404).json({ message: 'Motard introuvable' });

    // Build motard patch
    const motardPatch = {};
    if (nomcomplet !== undefined) motardPatch.nom_complet = nomcomplet.trim();
    if (datenaiss !== undefined) motardPatch.date_naiss = datenaiss || null;
    if (statutbloque !== undefined)
      motardPatch.statut_bloque = statutbloque === 'true' || statutbloque === true;
    if (files.permisCond?.length)
      motardPatch.permis_cond = files.permisCond[0].buffer.toString('base64');

    const { data: updatedMotard, error: motardErr } = await supabase
      .from('motard')
      .update(motardPatch)
      .eq('num_tel', req.params.numtel)
      .select(SEL_MOTARD)
      .maybeSingle();
    if (motardErr) throw motardErr;

    // Build moto patch
    let moto = null;
    if (existing.matriculemoto) {
      const motoPatch = {};
      if (modele !== undefined) motoPatch.modele = modele.trim();
      if (couleur !== undefined) motoPatch.couleur = couleur.trim() || null;
      if (motoType !== undefined) motoPatch.type = motoType.trim();
      if (files.carteGrise?.length)
        motoPatch.carte_grise = files.carteGrise[0].buffer.toString('base64');
      if (files.photoMoto?.length)
        motoPatch.photo_moto = files.photoMoto[0].buffer.toString('base64');

      if (Object.keys(motoPatch).length > 0) {
        const { data: updatedMoto } = await supabase
          .from('moto')
          .update(motoPatch)
          .eq('matricule', existing.matriculemoto)
          .select(SEL_MOTO_FULL)
          .maybeSingle();
        moto = updatedMoto;
      } else {
        const { data: existMoto } = await supabase
          .from('moto')
          .select(SEL_MOTO_LIST)
          .eq('matricule', existing.matriculemoto)
          .maybeSingle();
        moto = existMoto;
      }
    }

    res.json({ ...updatedMotard, moto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH toggle statut_bloque or is_online ───────────────────────────────────
router.patch('/:numtel/toggle', async (req, res) => {
  const { field } = req.body;
  if (!['statut_bloque', 'is_online'].includes(field))
    return res.status(400).json({ message: 'Champ invalide' });

  try {
    const { data: current, error: findErr } = await supabase
      .from('motard')
      .select(field)
      .eq('num_tel', req.params.numtel)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!current) return res.status(404).json({ message: 'Motard introuvable' });

    const { data, error } = await supabase
      .from('motard')
      .update({ [field]: !current[field] })
      .eq('num_tel', req.params.numtel)
      .select(SEL_MOTARD)
      .maybeSingle();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE motard + linked moto ───────────────────────────────────────────────
router.delete('/:numtel', async (req, res) => {
  try {
    const { data: motard, error: findErr } = await supabase
      .from('motard')
      .select('num_tel, matricule_moto')
      .eq('num_tel', req.params.numtel)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!motard) return res.status(404).json({ message: 'Motard introuvable' });

    const { error: delErr } = await supabase
      .from('motard')
      .delete()
      .eq('num_tel', req.params.numtel);
    if (delErr) throw delErr;

    // Delete linked moto after motard FK is gone
    if (motard.matricule_moto) {
      await supabase.from('moto').delete().eq('matricule', motard.matricule_moto);
    }

    res.json({ message: 'Motard et sa moto supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;