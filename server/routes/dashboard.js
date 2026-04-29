const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

router.get('/activity', async (req, res) => {
  res.json([]);
});

// ─── Main Stats ──────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const startDate = req.query.start;
    const endDate = req.query.end;

    const [
      { count: total, error: e_total },
      { count: completed, error: e_completed },
      { count: cancelled, error: e_cancelled },
      { count: onlineMotards, error: e_online },
    ] = await Promise.all([
      supabase.from('course').select('*', { count: 'exact', head: true }).gte('date_heure', startDate).lte('date_heure', endDate),
      supabase.from('course').select('*', { count: 'exact', head: true }).eq('etat', 'completée').gte('date_heure', startDate).lte('date_heure', endDate),
      supabase.from('course').select('*', { count: 'exact', head: true }).eq('etat', 'annulée').gte('date_heure', startDate).lte('date_heure', endDate),
      supabase.from('motard').select('*', { count: 'exact', head: true }).eq('is_online', true),
    ]);
    if (e_total || e_completed || e_cancelled || e_online) throw e_total || e_completed || e_cancelled || e_online;

    // Revenue + avg distance/duration from completed courses
    const { data: revData, error: e_rev } = await supabase
      .from('course')
      .select('prix, distance_km, duree_minutes')
      .eq('etat', 'completée')
      .gte('date_heure', startDate)
      .lte('date_heure', endDate);
    if (e_rev) throw e_rev;
    const completedCount = revData?.length || 0;
    const revenue = revData?.reduce((sum, c) => sum + (parseFloat(c.prix) || 0), 0) || 0;
    const avgDistance = completedCount > 0
      ? revData.reduce((sum, c) => sum + (parseFloat(c.distance_km) || 0), 0) / completedCount
      : 0;
    const avgDuration = completedCount > 0
      ? revData.reduce((sum, c) => sum + (parseInt(c.duree_minutes) || 0), 0) / completedCount
      : 0;

    const { data: avisData, error: e_avis } = await supabase.from('avis').select('note');
    if (e_avis) throw e_avis;
    const countRating = avisData?.length || 0;
    const avgRating = countRating > 0
      ? avisData.reduce((sum, a) => sum + (parseFloat(a.note) || 0), 0) / countRating
      : 0;

    const [
      { count: totalMotards, error: e1 },
      { count: totalMotos, error: e2 },
      { count: totalClients, error: e3 },
      { count: totalAdmins, error: e4 },
      { count: blockedClients, error: e5 },
      { count: blockedMotards, error: e6 },
    ] = await Promise.all([
      supabase.from('motard').select('*', { count: 'exact', head: true }),
      supabase.from('moto').select('*', { count: 'exact', head: true }),
      supabase.from('client').select('*', { count: 'exact', head: true }),
      supabase.from('admin').select('*', { count: 'exact', head: true }),
      supabase.from('client').select('*', { count: 'exact', head: true }).eq('status_bloque', true),
      supabase.from('motard').select('*', { count: 'exact', head: true }).eq('statut_bloque', true),
    ]);
    if (e1 || e2 || e3 || e4 || e5 || e6) throw e1 || e2 || e3 || e4 || e5 || e6;

    res.json({
      total: total || 0,
      completed: completed || 0,
      cancelled: cancelled || 0,
      revenue,
      avgRating,
      countRating,
      totalMotards: totalMotards || 0,
      totalMotos: totalMotos || 0,
      totalClients: totalClients || 0,
      totalAdmins: totalAdmins || 0,
      blockedClients: blockedClients || 0,
      blockedMotards: blockedMotards || 0,
      onlineMotards: onlineMotards || 0,
      avgDistance: Math.round(avgDistance * 10) / 10,
      avgDuration: Math.round(avgDuration),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Course status distribution ───────────────────────────────────────────────
router.get('/stats/courses', async (req, res) => {
  try {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const { data, error } = await supabase
      .from('course')
      .select('etat')
      .gte('date_heure', startDate)
      .lte('date_heure', endDate);
    if (error) throw error;
    const grouped = {};
    data?.forEach(c => { grouped[c.etat] = (grouped[c.etat] || 0) + 1; });
    res.json(Object.entries(grouped).map(([etat, count]) => ({ etat, count })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Revenue over time (daily) ────────────────────────────────────────────────
router.get('/stats/revenue-timeline', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('course')
      .select('date_heure, prix')
      .eq('etat', 'completée')
      .gte('date_heure', req.query.start)
      .lte('date_heure', req.query.end);
    if (error) throw error;
    const byDay = {};
    data?.forEach(c => {
      const day = c.date_heure.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + (parseFloat(c.prix) || 0);
    });
    res.json(
      Object.entries(byDay)
        .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── New registrations (clients + motards) by day ────────────────────────────
router.get('/stats/registrations', async (req, res) => {
  try {
    const [{ data: clients, error: e1 }, { data: motards, error: e2 }] = await Promise.all([
      supabase.from('client').select('created_at').gte('created_at', req.query.start).lte('created_at', req.query.end),
      supabase.from('motard').select('created_at').gte('created_at', req.query.start).lte('created_at', req.query.end),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    const cByDay = {};
    const mByDay = {};
    clients?.forEach(c => { const d = c.created_at.slice(0, 10); cByDay[d] = (cByDay[d] || 0) + 1; });
    motards?.forEach(m => { const d = m.created_at.slice(0, 10); mByDay[d] = (mByDay[d] || 0) + 1; });
    const allDays = new Set([...Object.keys(cByDay), ...Object.keys(mByDay)]);
    res.json(
      Array.from(allDays).sort().map(date => ({ date, clients: cByDay[date] || 0, motards: mByDay[date] || 0 }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Complaints / reclamations ────────────────────────────────────────────────
router.get('/stats/reclamations', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reclamation').select('status');
    if (error) throw error;
    const byStatus = {};
    data?.forEach(r => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
    res.json({
      total: data?.length || 0,
      byStatus,
      open: byStatus['ouverte'] || 0,
      inProgress: byStatus['en_cours'] || 0,
      resolved: byStatus['resolue'] || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 10 most recent courses ───────────────────────────────────────────────────
router.get('/recent', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('course')
      .select('id, id_client, id_motard, point_depart, point_arrivee, date_heure, etat, prix, distance_km, duree_minutes')
      .order('date_heure', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

