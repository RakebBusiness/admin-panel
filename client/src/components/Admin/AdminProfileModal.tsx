//import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const AdminProfileModal = ({ admin, onClose }: any) => {
  if (!admin) return null;

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Profil Administrateur</DialogTitle>
      <DialogContent dividers>
        <Typography><strong>Nom Complet:</strong> {admin.nomcomplet}</Typography>
        <Typography><strong>Email:</strong> {admin.email}</Typography>
        <Typography><strong>Téléphone:</strong> {admin.numtel}</Typography>
        <Typography><strong>Type:</strong> {admin.type}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminProfileModal;
