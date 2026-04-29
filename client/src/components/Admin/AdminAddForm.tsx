import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  SelectChangeEvent,
} from "@mui/material";

interface Props {
  onSuccess: () => void;
}

const AdminForm: React.FC<Props> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    nomcomplet: "",
    numtel: "",
    email: "",
    type: "admin",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Handler pour les TextField
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler spécifique pour le Select
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.nomcomplet ||
      !formData.numtel ||
      !formData.email ||
      !formData.password
    ) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    console.log("📤 Envoi des données:", {
      nomcomplet: formData.nomcomplet,
      numtel: formData.numtel,
      email: formData.email,
      type: formData.type,
      password: formData.password,
    });

    try {
      await axios.post("http://localhost:5000/api/admins", {
        nomcomplet: formData.nomcomplet,
        numtel: formData.numtel,
        email: formData.email,
        type: formData.type,
        password: formData.password,
      });
      onSuccess();
      setFormData({
        nomcomplet: "",
        numtel: "",
        email: "",
        type: "admin",
        password: "",
        confirmPassword: "",
      });
      alert("Admin ajouté avec succès");
      setError("");
    } catch (err) {
      console.error("Erreur lors de l'ajout", err);
      setError("Erreur lors de l'ajout de l'administrateur");
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        fullWidth
        margin="normal"
        label="Nom complet"
        name="nomcomplet"
        value={formData.nomcomplet}
        onChange={handleInputChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        label="Téléphone"
        name="numtel"
        value={formData.numtel}
        onChange={handleInputChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        required
      />
      <Select
        fullWidth
        margin="dense"
        name="type"
        value={formData.type}
        onChange={handleSelectChange}
        sx={{ mt: 2, mb: 2 }}
      >
        <MenuItem value="Admin">Admin</MenuItem>
        <MenuItem value="AdminGestion">AdminGestion</MenuItem>
        <MenuItem value="AdminChauffeur">AdminChauffeur</MenuItem>
      </Select>
      <TextField
        fullWidth
        margin="normal"
        label="Mot de passe"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        required
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        Ajouter
      </Button>
    </Box>
  );
};

export default AdminForm;
