import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  phone: string;
  onSuccess: () => void;
}

const AdminDeleteForm: React.FC<Props> = ({ phone, onSuccess }) => {
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const { admin } = useAuth();

  const fetchAdminInfo = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admins/${phone}`);
      setAdminInfo(res.data);
    } catch (err) {
      setError("Admin introuvable");
    }
  };

  useEffect(() => {
    if (phone) fetchAdminInfo();
  }, [phone]);

  const handleDelete = async () => {
    if (admin?.numtel === phone) {
      setError("Vous ne pouvez pas vous supprimer vous-même !");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admins/${phone}`);
      alert("Admin supprimé avec succès");
      onSuccess();
    } catch (err) {
      console.error("Erreur suppression admin", err);
      setError("Erreur lors de la suppression");
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : adminInfo ? (
        <>
          <Typography variant="h6" gutterBottom>
            Confirmer la suppression
          </Typography>
          <Typography paragraph>
            Êtes-vous sûr de vouloir supprimer l'administrateur {adminInfo.nomcomplet} ({adminInfo.email}) ?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              sx={{ mr: 2 }}
              disabled={admin?.numtel === phone}
            >
              Confirmer la suppression
            </Button>
            <Button variant="outlined" onClick={onSuccess}>
              Annuler
            </Button>
          </Box>
        </>
      ) : (
        <Typography>Chargement des informations...</Typography>
      )}
    </Box>
  );
};

export default AdminDeleteForm;
