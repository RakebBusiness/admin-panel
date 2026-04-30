import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Bike,
  UserCheck,
  ShieldCheck,
  LogOut,
  BarChart3,
  MessageSquare,
  Car,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import AdminProfileModal from "../Admin/AdminProfileModal";
import casqueWhite from "../../assets/casque-white.svg";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard",       icon: LayoutDashboard, label: "Tableau de Bord" },
  { id: "motards",         icon: UserCheck,       label: "Motards" },
  { id: "motos",           icon: Bike,            label: "Motos" },
  { id: "clients",         icon: Users,           label: "Clients" },
  { id: "gestion-courses", icon: Car,             label: "Courses" },
  { id: "reclamations",    icon: MessageSquare,   label: "Réclamations" },
  { id: "statistiques",    icon: BarChart3,       label: "Statistiques" },
  { id: "admins",          icon: ShieldCheck,     label: "Admins" },
];

const visibleTabs: Record<string, string[]> = {
  Admin:              ["dashboard", "motards", "motos", "clients", "gestion-courses", "reclamations", "statistiques", "admins"],
  AdminChauffeur:     ["motards", "motos"],
  AdminGestion:       ["dashboard", "statistiques"],
  AdminReclamation:   ["reclamations"],
  AdminStatistiques:  ["dashboard", "statistiques"],
};

/* ── Admin role badge ─────────────────────────────────────────────────────── */
const roleBadge: Record<string, string> = {
  Admin:             "Super Admin",
  AdminChauffeur:    "Chauffeurs",
  AdminGestion:      "Gestion",
  AdminReclamation:  "Réclamations",
  AdminStatistiques: "Statistiques",
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { admin, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const tabsAllowed = visibleTabs[admin?.type ?? ""] ?? [];
  const initials = admin?.nomcomplet
    ? admin.nomcomplet.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      {/* ── Sidebar shell ─────────────────────────────────────────────────── */}
      <div className="w-60 bg-sidebar flex flex-col h-full select-none">

        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <img src={casqueWhite} alt="Rydz" className="w-5 h-5 object-contain" />
          </div>
          <div className="leading-tight">
            <span className="text-brand font-extrabold text-lg tracking-tight leading-none">rydz</span>
            <p className="text-sidebar-muted text-[10px] font-medium uppercase tracking-widest mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {menuItems
            .filter((item) => tabsAllowed.includes(item.id))
            .map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                    transition-all duration-150 group
                    ${isActive
                      ? "bg-brand text-white shadow-brand"
                      : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white"
                    }
                  `}
                >
                  <item.icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-sidebar-muted group-hover:text-white"}`} style={{ width: '18px', height: '18px' }} />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                </button>
              );
            })}
        </nav>

        {/* ── User footer ───────────────────────────────────────────────── */}
        <div className="border-t border-sidebar-border px-3 py-3 space-y-1">
          {/* Profile row */}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-sidebar-hover transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate leading-tight">
                {admin?.nomcomplet ?? "Administrateur"}
              </p>
              <p className="text-sidebar-muted text-[11px] truncate leading-tight">
                {roleBadge[admin?.type ?? ""] ?? admin?.type}
              </p>
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-muted hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Déconnexion
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
