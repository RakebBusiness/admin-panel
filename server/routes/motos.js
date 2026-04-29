const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper: ensure binary value is base64 string for response
const toBase64 = (val) => {
  if (!val) return null;
  if (Buffer.isBuffer(val)) return val.toString('base64');
  return val; // already a base64 string from Supabase
};

// Get all motos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('moto').select('matricule, modele, couleur, type, cartegrise:carte_grise, photomoto:photo_moto, created_at, updated_at').order('modele');
    if (error) throw error;

    const motos = data.map((moto) => ({
      ...moto,
      photomoto: toBase64(moto.photomoto),
      cartegrise: toBase64(moto.cartegrise),
    }));

    res.json(motos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get moto by matricule
router.get('/:matricule', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('moto')
      .select('matricule, modele, couleur, type, cartegrise:carte_grise, photomoto:photo_moto, created_at, updated_at')
      .eq('matricule', req.params.matricule)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Moto not found' });

    data.photomoto = toBase64(data.photomoto);
    data.cartegrise = toBase64(data.cartegrise);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create moto
router.post('/', upload.fields([
  { name: 'carteGrise', maxCount: 1 },
  { name: 'photoMoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const { matricule, modele, couleur, type } = req.body;
    const cartegrise = req.files?.carteGrise?.[0]?.buffer?.toString('base64') || null;
    const photomoto = req.files?.photoMoto?.[0]?.buffer?.toString('base64') || null;

    const { data, error } = await supabase
      .from('moto')
      .insert({ matricule, modele, couleur, type, carte_grise: cartegrise, photo_moto: photomoto })
      .select('matricule, modele, couleur, type, cartegrise:carte_grise, photomoto:photo_moto, created_at, updated_at')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update moto
router.put('/:matricule', upload.fields([
  { name: 'carteGrise', maxCount: 1 },
  { name: 'photoMoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const { modele, couleur, type } = req.body;
    const updateData = { modele, couleur, type };

    if (req.files?.carteGrise?.[0]) {
      updateData.carte_grise = req.files.carteGrise[0].buffer.toString('base64');
    }
    if (req.files?.photoMoto?.[0]) {
      updateData.photo_moto = req.files.photoMoto[0].buffer.toString('base64');
    }

    const { data, error } = await supabase
      .from('moto')
      .update(updateData)
      .eq('matricule', req.params.matricule)
      .select('matricule, modele, couleur, type, cartegrise:carte_grise, photomoto:photo_moto, created_at, updated_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Moto not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete moto
router.delete('/:matricule', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('moto')
      .delete()
      .eq('matricule', req.params.matricule)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Moto not found' });
    res.json({ message: 'Moto deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
