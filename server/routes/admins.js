const express = require("express");
const router = express.Router();
const { supabase } = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Get all admins
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("admin")
      .select("numtel:num_tel, nomcomplet:nom_complet, email, type")
      .order("nom_complet");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET admin by phone number
router.get("/:numtel", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("admin")
      .select("numtel:num_tel, nomcomplet:nom_complet, email, type")
      .eq("num_tel", req.params.numtel)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Admin not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: admin, error } = await supabase
      .from("admin")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.mdp);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.num_tel, type: admin.type },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      admin: {
        numtel: admin.num_tel,
        nomcomplet: admin.nom_complet,
        email: admin.email,
        type: admin.type,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create admin
router.post("/", async (req, res) => {
  try {
    const { numtel, nomcomplet, email, password, type } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("admin")
      .insert({ num_tel: numtel, nom_complet: nomcomplet, email, mdp: hashedPassword, type })
      .select("numtel:num_tel, nomcomplet:nom_complet, email, type")
      .single();
    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'admin :", error);
    res.status(500).json({ error: error.message });
  }
});

// Update admin
router.put("/:numtel", async (req, res) => {
  try {
    const { nomcomplet, email, type, password } = req.body;
    const updateData = { nom_complet: nomcomplet, email, type };

    if (password) {
      updateData.mdp = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from("admin")
      .update(updateData)
      .eq("num_tel", req.params.numtel)
      .select("numtel:num_tel, nomcomplet:nom_complet, email, type")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Admin not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete admin
router.delete("/:numtel", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("admin")
      .delete()
      .eq("num_tel", req.params.numtel)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

