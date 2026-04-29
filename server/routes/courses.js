const express = require("express");
const router = express.Router();
const { supabase } = require("../config/database");

// ➕ Ajouter une nouvelle course
router.post("/", async (req, res) => {
  try {
    const { idclient, idmotard, pointdepart, pointarrivee, dateheure, etat, prix, distancekm, dureeminutes } = req.body;
    const { data, error } = await supabase
      .from("course")
      .insert({ id_client: idclient, id_motard: idmotard, point_depart: pointdepart, point_arrivee: pointarrivee, date_heure: dateheure, etat, prix, distance_km: distancekm, duree_minutes: dureeminutes })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ message: "Course ajoutée avec succès", course: data });
  } catch (err) {
    console.error("Erreur ajout course :", err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la course" });
  }
});

// 📃 Obtenir toutes les courses
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("course")
      .select("*")
      .order("date_heure", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des courses" });
  }
});

// 📋 Historique des courses d'un motard
router.get("/motard/:numtel", async (req, res) => {
  try {
    const { numtel } = req.params;
    const { data, error } = await supabase
      .from("course")
      .select(
        "id, point_depart, point_arrivee, date_heure, heure_fin, etat, prix, distance_km, duree_minutes, client:id_client(num_tel, nom_complet)"
      )
      .eq("id_motard", numtel)
      .order("date_heure", { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
