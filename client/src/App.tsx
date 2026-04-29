import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import MotardsList from './components/Motards/MotardsList';
import MotosList from './components/Motos/MotosList';
import ClientsList from './components/Clients/ClientsList';
import CoursesList from './components/Courses/CoursesList';
import AdminsList from './components/Admin/AdminList';
 // ✅ NOUVEAU

const AppContent: React.FC = () => {
  const { admin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!admin) {
    return <LoginForm />;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tableau de Bord';
      case 'motards':
        return 'Gestion des Motards';
      case 'motos':
        return 'Gestion des Motos';
      case 'clients':
        return 'Gestion des Clients';
      case 'gestion-courses':
        return 'Gestion des Courses';
      case 'reclamations':
        return 'Réclamations';
      case 'statistiques':
        return 'Tableau de Bord';
      case 'admins':
        return 'Gestion des Admins';
      default:
        return 'VTC Moto';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Vue d\'ensemble des performances de la plateforme';
      case 'motards':
        return 'Gérer les motards de votre flotte';
      case 'motos':
        return 'Gérer votre flotte de motos';
      case 'clients':
        return 'Gérer votre base de clients';
      case 'gestion-courses':
        return 'Afficher et gérer les courses enregistrées';
      default:
        return '';
    }
  };

  const renderContent = () => {
  if (!admin) return null;

  const allowedPages: Record<string, string[]> = {
    Admin: ['dashboard', 'motards', 'motos', 'clients', 'gestion-courses', 'reclamations', 'statistiques', 'admins'],
    AdminChauffeur: ['motards', 'motos'],
    AdminGestion: ['dashboard', 'statistiques'],
    AdminReclamation: ['reclamations'],
    AdminStatistiques: ['dashboard'],
  };

  const pages = allowedPages[admin.type] || [];

  if (!pages.includes(activeTab)) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">⛔ Accès refusé</h2>
        <p className="text-gray-600">Vous n’avez pas accès à cette section.</p>
      </div>
    );
  }

  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;//admin
    case 'motards':
      return <MotardsList />;//chuaffeur
    case 'motos':
      return <MotosList />;//chuaffeur
    case 'clients':
      return <ClientsList />;//chauffeur,admin,gestion
    case 'gestion-courses':
      return <CoursesList />;//chauffeur
    case 'reclamations':
      return <div className="p-6 text-center">Réclamations à venir</div>;//reclamation
    case 'statistiques':
      return <Dashboard />;//statistiques
    case 'admins':
      return <AdminsList />;
    default:
      return <Dashboard />;
  }
};

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} subtitle={getPageSubtitle()} />
        
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
