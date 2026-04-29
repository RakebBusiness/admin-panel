const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// Get all clients
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('client')
      .select('numtel:num_tel, nomcomplet:nom_complet, statusbloque:status_bloque, created_at, updated_at, user_id, fcm_token')
      .order('nom_complet');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client by NumTel
router.get('/:numtel', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('client')
      .select('numtel:num_tel, nomcomplet:nom_complet, statusbloque:status_bloque, created_at, updated_at, user_id, fcm_token')
      .eq('num_tel', req.params.numtel)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Client not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
router.post('/', async (req, res) => {
  try {
    const { numtel, nomcomplet } = req.body;
    const { data, error } = await supabase
      .from('client')
      .insert({ num_tel: numtel, nom_complet: nomcomplet })
      .select('numtel:num_tel, nomcomplet:nom_complet, statusbloque:status_bloque, created_at, updated_at, user_id, fcm_token')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.put('/:numtel', async (req, res) => {
  try {
    const { nomcomplet, statusbloque } = req.body;
    const { data, error } = await supabase
      .from('client')
      .update({ nom_complet: nomcomplet, status_bloque: statusbloque })
      .eq('num_tel', req.params.numtel)
      .select('numtel:num_tel, nomcomplet:nom_complet, statusbloque:status_bloque, created_at, updated_at, user_id, fcm_token')
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Client not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
router.delete('/:numtel', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('client')
      .delete()
      .eq('num_tel', req.params.numtel)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;