import React, { useEffect, useState } from "react";
import { getPersonsByTourId, type Person } from "../../api/test";

export default function TourPersons() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPersonsByTourId(4)
      .then(setPersons)
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Tour Participants</h2>
      <ul className="space-y-2">
        {persons.map((p) => (
          <li key={p.id} className=" shadow rounded p-2">
            <div>
              <strong>{p.name}</strong>
            </div>
            <div>Category: {p.category}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
