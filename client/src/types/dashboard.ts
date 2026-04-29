export interface DashboardStats {
  total: number;
  completed: number;
  cancelled: number;
  revenue: number;
  avgRating: number;
  countRating: number;
  totalMotards: number;
  totalMotos: number;
  totalClients: number;
  totalAdmins: number;
  blockedClients: number;
  blockedMotards: number;
  onlineMotards: number;
  avgDistance: number;
  avgDuration: number;
}

export interface CourseStatusItem {
  etat: string;
  count: number;
}

export interface RevenueTimelineItem {
  date: string;
  revenue: number;
}

export interface RegistrationsItem {
  date: string;
  clients: number;
  motards: number;
}

export interface ReclamationsStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  byStatus: Record<string, number>;
}

export interface RecentCourse {
  id: string;
  id_client: string;
  id_motard: string | null;
  point_depart: string;
  point_arrivee: string;
  date_heure: string;
  etat: string;
  prix: number;
  distance_km: number | null;
  duree_minutes: number | null;
}
