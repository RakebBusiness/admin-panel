import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Bike,
  UserCheck,
  Settings,
  LogOut,
  BarChart3,
  MessageSquare,
  Car,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import AdminProfileModal from "../Admin/AdminProfileModal"; // à créer

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { admin, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de Bord" },
    { id: "motards", icon: UserCheck, label: "Motards" },
    { id: "motos", icon: Bike, label: "Motos" },
    { id: "clients", icon: Users, label: "Clients" },
    { id: "gestion-courses", icon: Car, label: "Gestion Courses" },
    { id: "reclamations", icon: MessageSquare, label: "Réclamations" },
    { id: "statistiques", icon: BarChart3, label: "Statistiques" },
    { id: "admins", icon: Settings, label: "Admins" },
  ];

  const visibleTabs: Record<string, string[]> = {
    Admin: [
      "dashboard",
      "motards",
      "motos",
      "clients",
      "gestion-courses",
      "reclamations",
      "statistiques",
      "admins",
    ],
    AdminChauffeur: ["motards", "motos"],
    AdminGestion: ["dashboard", "statistiques"],
  };

  const tabsAllowed = visibleTabs[admin?.type || ""] || [];

  return (
    <>
      <div className="w-64 bg-white shadow-lg h-full flex flex-col justify-between">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">VTC Moto</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems
            .filter((item) => tabsAllowed.includes(item.id))
            .map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div
            className="flex items-center space-x-3 mb-3 cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {admin?.nomcomplet}
              </p>
              <p className="text-xs text-gray-500">{admin?.type}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {modalOpen && (
        <AdminProfileModal admin={admin} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
