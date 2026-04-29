import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Select, MenuItem, Button, Box, Typography, SelectChangeEvent } from '@mui/material';

interface Props {
  phone: string;
  onSuccess: () => void;
}

interface AdminData {
  numtel: string;
  nomcomplet: string;
  email: string;
  type: string;
}

const AdminEditForm: React.FC<Props> = ({ phone, onSuccess }) => {
  const [formData, setFormData] = useState({
    numtel: '',
    nomcomplet: '',
    email: '',
    type: 'admin',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (phone) {
      setFormData(prev => ({ ...prev, numtel: phone }));
      verifyAdmin();
    }
  }, [phone]);

  const verifyAdmin = async () => {
    try {
      const res = await axios.get<AdminData>(`http://localhost:5000/api/admins/${phone}`);
      if (res.data) {
        setFormData({
          numtel: res.data.numtel,
          nomcomplet: res.data.nomcomplet,
          email: res.data.email,
          type: res.data.type,
          password: '',
          confirmPassword: ''
        });
        setStep(2);
        setError('');
      }
    } catch (err) {
      setError('Administrateur non trouvé');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const updateData: any = {
        nomcomplet: formData.nomcomplet,
        email: formData.email,
        type: formData.type,
      };
      
      if (formData.password) updateData.password = formData.password;

      await axios.put(`http://localhost:5000/api/admins/${formData.numtel}`, updateData);
      alert('Admin modifié avec succès');
      onSuccess();
    } catch (err) {
      console.error('Erreur modification admin', err);
      setError('Erreur lors de la modification');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {step === 1 ? (
        <Typography>Vérification en cours...</Typography>
      ) : (
        <>
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
            label="Email"
            name="email"
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
            label="Nouveau mot de passe (optionnel)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Enregistrer les modifications
          </Button>
        </>
      )}
    </Box>
  );
};

export default AdminEditForm;