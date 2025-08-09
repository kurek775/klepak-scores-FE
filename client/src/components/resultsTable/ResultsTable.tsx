import React, { useEffect, useState } from "react";
import {
  getCrewResultsInSport,
  saveCrewResultsInSport,
} from "../../api/resultsService";
import Table from "pk-editable-table-component";
import { useParams } from "react-router";
import type { Result } from "../../models/Result";
import { useTranslation } from "react-i18next";

export default function ResultsTable() {
  const { t } = useTranslation();
  const { tourId, crewId, sportId } = useParams();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = [
    {
      columnLabel: t("name"),
      key: "person_name",
      type: "string",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
    {
      columnLabel: t("result"),
      key: "score",
      type: "number",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
  ];

  const handleSubmit = async (data: Result[]) => {
    await saveCrewResultsInSport(tourId, crewId, sportId, data);
  };
  useEffect(() => {
    getCrewResultsInSport(tourId, crewId, sportId)
      .then(setResults)
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <Table
        keyVal="id"
        headers={headers}
        initialData={results}
        onSubmit={handleSubmit}
        editable={true}
        actions={{ create: false, edit: true, delete: false }}
        text={{
          submit: t("submit"),
        }}
      />
    </div>
  );
}
