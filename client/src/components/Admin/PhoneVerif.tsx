// components/Admin/PhoneVerif.tsx
import React, { useState } from "react";
import { TextField, Button } from "@mui/material";

interface Props {
  onVerify: (phone: string) => void;
  onCancel: () => void;
}

const PhoneVerif: React.FC<Props> = ({ onVerify, onCancel }) => {
  const [phone, setPhone] = useState("");

  return (
    <div className="flex flex-col space-y-4">
      <TextField
        label="Numéro de téléphone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Annuler</Button>
        <Button
          variant="contained"
          onClick={() => {
            if (!phone) return alert("Veuillez entrer un numéro.");
            onVerify(phone);
          }}
        >
          Confirmer
        </Button>
      </div>
    </div>
  );
};

export default PhoneVerif;
