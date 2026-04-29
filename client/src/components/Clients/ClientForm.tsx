import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { clientsApi } from '../../services/api';

interface ClientFormProps {
  client?: any;
  onClose: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onClose }) => {
  const [formData, setFormData] = useState({
    numtel: '',
    nomcomplet: '',
    statusbloque: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        numtel: client.numtel || '',
        nomcomplet: client.nomcomplet || '',
        statusbloque: client.statusbloque || false
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (client) {
        await clientsApi.update(client.numtel, formData);
      } else {
        await clientsApi.create(formData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {client ? 'Modifier le Client' : 'Ajouter un Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              name="numtel"
              value={formData.numtel}
              onChange={handleInputChange}
              required
              maxLength={13}
              disabled={!!client}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              name="nomcomplet"
              value={formData.nomcomplet}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="statusbloque"
              checked={formData.statusbloque}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Client bloqué
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : (client ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;