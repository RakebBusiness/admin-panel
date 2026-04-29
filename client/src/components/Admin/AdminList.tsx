import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminForm from "./AdminAddForm";
import AdminEditForm from "./AdminEditForm";
import AdminDeleteForm from "./AdminDeleteForm";
import PhoneVerif from './PhoneVerif';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface Admin {
  numtel: string;
  nomcomplet: string;
  email: string;
  type: string;
}

const AdminsList: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false);
  const [actionType, setActionType] = useState<"edit" | "delete" | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const results = admins.filter(
      (admin) =>
        admin.nomcomplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.numtel.includes(searchTerm) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(results);
  }, [searchTerm, admins]);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get<Admin[]>(
        "http://localhost:5000/api/admins"
      );
      setAdmins(response.data);
      setFilteredAdmins(response.data);
    } catch (err) {
      console.error("Erreur chargement admins", err);
    }
  };

  const handleEditClick = () => {
    setActionType("edit");
    setOpenPhoneDialog(true);
  };

  const handleDeleteClick = () => {
    setActionType("delete");
    setOpenPhoneDialog(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handlePhoneVerified = (phone: string) => {
    if (actionType === "edit") {
      setSelectedPhone(phone);
      setShowEditForm(true);
    } else if (actionType === "delete") {
      setSelectedPhone(phone);
      setShowDeleteForm(true);
    }
    setOpenPhoneDialog(false);
    setActionType(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Liste des Administrateurs
      </h2>

      {/* Barre de recherche */}
      <div className="mb-6">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom, téléphone ou email..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Ajouter un Admin
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEditClick}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
          >
            Modifier
          </button>
          <button
            onClick={handleDeleteClick}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            Supprimer
          </button>
        </div>
      </div>
      <Dialog
        open={openPhoneDialog}
        onClose={() => setOpenPhoneDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Vérification du numéro</DialogTitle>
        <DialogContent>
          <PhoneVerif
            onVerify={handlePhoneVerified}
            onCancel={() => {
              setOpenPhoneDialog(false);
              setActionType(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Formulaire d'ajout */}
      <Dialog
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ajouter un nouvel administrateur</DialogTitle>
        <DialogContent>
          <AdminForm
            onSuccess={() => {
              fetchAdmins();
              setShowAddForm(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddForm(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire de modification */}
      <Dialog
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Modifier l'administrateur</DialogTitle>
        <DialogContent>
          <AdminEditForm
            phone={selectedPhone}
            onSuccess={() => {
              fetchAdmins();
              setShowEditForm(false);
              setSelectedPhone("");
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditForm(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire de suppression */}
      <Dialog
        open={showDeleteForm}
        onClose={() => setShowDeleteForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Supprimer l'administrateur</DialogTitle>
        <DialogContent>
          <AdminDeleteForm
            phone={selectedPhone}
            onSuccess={() => {
              fetchAdmins();
              setShowDeleteForm(false);
              setSelectedPhone("");
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteForm(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom complet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <tr key={admin.numtel} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {admin.nomcomplet}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.numtel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {admin.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminsList;
