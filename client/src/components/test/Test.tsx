import React, { useEffect, useState } from "react";
import {
  getCrewResultsInSport,
  saveCrewResultsInSport,
  type Person,
} from "../../api/test";
import Table from "pk-editable-table-component";
import { useParams } from "react-router";
export default function TourPersons() {
  const { tourId, crewId, sportId } = useParams();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = [
    {
      columnLabel: "Name",
      key: "person_name",
      type: "string",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
    {
      columnLabel: "Result",
      key: "score",
      type: "number",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
  ];

  const handleSubmit = async (data: any) => {
    await saveCrewResultsInSport(tourId, crewId, sportId, data);
  };
  useEffect(() => {
    getCrewResultsInSport(tourId, crewId, sportId)
      .then(setPersons)
      .catch((err: any) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Tour Participants</h2>

      <Table
        keyVal="id"
        headers={headers}
        initialData={persons}
        onSubmit={handleSubmit}
        editable={true}
        actions={{ create: false, edit: true, delete: false }}
        text={{
          delete: "Remove",
          addRow: "Add New Row",
          submit: "Save Changes",
        }}
      />
    </div>
  );
}
