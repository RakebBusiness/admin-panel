import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../services/api';
import type {
  DashboardStats,
  CourseStatusItem,
  RevenueTimelineItem,
  RegistrationsItem,
  ReclamationsStats,
  RecentCourse,
} from '../types/dashboard';

export function useDashboard(range: [Date, Date]) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courseData, setCourseData] = useState<CourseStatusItem[]>([]);
  const [revenueTimeline, setRevenueTimeline] = useState<RevenueTimelineItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationsItem[]>([]);
  const [reclamations, setReclamations] = useState<ReclamationsStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startIso = range[0].toISOString();
  const endIso = range[1].toISOString();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = `start=${startIso}&end=${endIso}`;
      const [s, c, rt, reg, rec, recent] = await Promise.all([
        dashboardApi.getStats(qs),
        dashboardApi.getCourseStats(qs),
        dashboardApi.getRevenueTimeline(qs),
        dashboardApi.getRegistrations(qs),
        dashboardApi.getReclamations(),
        dashboardApi.getRecentCourses(),
      ]);
      setStats(s?.error ? null : s);
      setCourseData(Array.isArray(c) ? c : []);
      setRevenueTimeline(Array.isArray(rt) ? rt : []);
      setRegistrations(Array.isArray(reg) ? reg : []);
      setReclamations(rec && !rec.error ? rec : null);
      setRecentCourses(Array.isArray(recent) ? recent : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIso, endIso]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    stats,
    courseData,
    revenueTimeline,
    registrations,
    reclamations,
    recentCourses,
    loading,
    error,
    refresh: fetchAll,
  };
}
