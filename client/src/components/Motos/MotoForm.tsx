import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { motosApi } from '../../services/api';

interface MotoFormProps {
  moto?: any;
  onClose: () => void;
}

const MotoForm: React.FC<MotoFormProps> = ({ moto, onClose }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    modele: '',
    couleur: '',
    type: ''
  });
  const [carteGrise, setCarteGrise] = useState<File | null>(null);
  const [photoMoto, setPhotoMoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moto) {
      setFormData({
        matricule: moto.matricule || '',
        modele: moto.modele || '',
        couleur: moto.couleur || '',
        type: moto.type || ''
      });
    }
  }, [moto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('matricule', formData.matricule);
      formDataToSend.append('modele', formData.modele);
      formDataToSend.append('couleur', formData.couleur);
      formDataToSend.append('type', formData.type);

      if (carteGrise) {
        formDataToSend.append('carteGrise', carteGrise);
      }

      if (photoMoto) {
        formDataToSend.append('photoMoto', photoMoto);
      }

      if (moto) {
        await motosApi.update(moto.matricule, formDataToSend);
      } else {
        await motosApi.create(formDataToSend);
      }

      onClose();
    } catch (error) {
      console.error('Error saving moto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const motoTypes = [
    'Scooter',
    'Moto Sport',
    'Moto Touring',
    'Moto Cross',
    'Moto Custom',
    'Moto Électrique'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {moto ? 'Modifier la Moto' : 'Ajouter une Moto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matricule
              </label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleInputChange}
                required
                disabled={!!moto}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modèle
              </label>
              <input
                type="text"
                name="modele"
                value={formData.modele}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <input
                type="text"
                name="couleur"
                value={formData.couleur}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un type</option>
                {motoTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carte Grise
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCarteGrise(e.target.files?.[0] || null)}
                  className="hidden"
                  id="carteGrise"
                />
                <label
                  htmlFor="carteGrise"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {carteGrise ? carteGrise.name : 'Carte Grise'}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo de la Moto
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoMoto(e.target.files?.[0] || null)}
                  className="hidden"
                  id="photoMoto"
                />
                <label
                  htmlFor="photoMoto"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {photoMoto ? photoMoto.name : 'Photo Moto'}
                  </span>
                </label>
              </div>
            </div>
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
              {loading ? 'Sauvegarde...' : (moto ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MotoForm;