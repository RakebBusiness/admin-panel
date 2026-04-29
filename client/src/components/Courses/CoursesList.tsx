import React, { useEffect, useState } from "react";
import axios from 'axios';


interface Course {
  _id: string;
  idClient: string;
  idMotard: string;
  pointDepart: string;
  pointArrivee: string;
  dateHeure: string;
  etat: string;
  prix: number;
}

const CoursesList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

useEffect(() => {
  axios.get<Course[]>("http://localhost:5000/api/courses")
    .then((res) => {
      const data = Array.isArray(res.data) ? res.data : [];
      console.log("Courses reçues depuis le backend:", data);
      setCourses(data);
    })
    .catch(err => console.error("Erreur chargement courses:", err));
}, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Liste des courses</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Client</th>
              <th className="p-2">Motard</th>
              <th className="p-2">Départ</th>
              <th className="p-2">Arrivée</th>
              <th className="p-2">Date</th>
              <th className="p-2">État</th>
              <th className="p-2">Prix (DA)</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.idClient}</td>
                <td>{course.idMotard}</td>
                <td>{course.pointDepart}</td>
                <td>{course.pointArrivee}</td>
                <td>{new Date(course.dateHeure).toLocaleString()}</td>
                <td>{course.etat}</td>
                <td>{course.prix} DA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoursesList;
