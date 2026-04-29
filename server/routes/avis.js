const express = require("express");
const router = express.Router();
const { supabase } = require("../config/database");

// GET all avis
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("avis").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new avis
router.post("/", async (req, res) => {
  try {
    const { idclient, idmotard, idcourse, note, avistextuel } = req.body;
    const { data, error } = await supabase
      .from("avis")
      .insert({ id_client: idclient, id_motard: idmotard, id_course: idcourse, note, avis_textuel: avistextuel })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
