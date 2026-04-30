import React, { useEffect, useState } from "react";
import { coursesApi } from "../../services/api";

interface Course {
  id: string;
  id_client: string;
  id_motard: string | null;
  point_depart: string;
  point_arrivee: string;
  date_heure: string;
  etat: string;
  prix: number;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ETAT_BADGE: Record<string, string> = {
  complée: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  annulée: "bg-rose-50 text-rose-700 border border-rose-100",
  en_cours: "bg-sky-50 text-sky-700 border border-sky-100",
  réservée: "bg-indigo-50 text-indigo-700 border border-indigo-100",
};
const ETAT_LABELS: Record<string, string> = {
  complée: "Terminée",
  annulée: "Annulée",
  en_cours: "En cours",
  réservée: "Réservée",
};

const CoursesList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .getAll()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-5 min-h-full">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Gestion des Courses</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {courses.length} course{courses.length !== 1 ? "s" : ""} enregistrée{courses.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">Aucune course trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50/80">
                  <th className="px-5 py-3 text-left font-semibold">Client</th>
                  <th className="px-5 py-3 text-left font-semibold">Chauffeur</th>
                  <th className="px-5 py-3 text-left font-semibold">Départ</th>
                  <th className="px-5 py-3 text-left font-semibold">Arrivée</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3 text-left font-semibold">État</th>
                  <th className="px-5 py-3 text-right font-semibold">Prix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{course.id_client}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{course.id_motard ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-3 text-gray-700 max-w-[160px] truncate text-xs">{course.point_depart}</td>
                    <td className="px-5 py-3 text-gray-700 max-w-[160px] truncate text-xs">{course.point_arrivee}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">{fmtDate(course.date_heure)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${ETAT_BADGE[course.etat] ?? "bg-gray-100 text-gray-600"}` }>
                        {ETAT_LABELS[course.etat] ?? course.etat}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900 whitespace-nowrap tabular-nums text-xs">
                      {Number(course.prix).toLocaleString("fr-DZ")} DZD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesList;
