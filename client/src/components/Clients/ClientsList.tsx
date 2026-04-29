import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, UserX, UserCheck } from 'lucide-react';
import { clientsApi } from '../../services/api';
import ClientForm from './ClientForm';

const ClientsList: React.FC = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter((client: any) =>
      client.nomcomplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.numtel.includes(searchTerm)
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (numtel: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      try {
        await clientsApi.delete(numtel);
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleToggleStatus = async (client: any) => {
    try {
      await clientsApi.update(client.numtel, {
        ...client,
        statusbloque: !client.statusbloque
      });
      fetchClients();
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingClient(null);
    fetchClients();
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Clients</h2>
          <p className="text-gray-600">Gérer votre base de clients</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter Client</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          <span>Filtrer</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client: any) => (
              <tr key={client.numtel} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {client.nomcomplet.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{client.nomcomplet}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.numtel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    client.statusbloque 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {client.statusbloque ? 'Bloqué' : 'Actif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(client)}
                      className={`p-1 rounded hover:bg-opacity-20 ${
                        client.statusbloque 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={client.statusbloque ? 'Débloquer' : 'Bloquer'}
                    >
                      {client.statusbloque ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.numtel)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default ClientsList;