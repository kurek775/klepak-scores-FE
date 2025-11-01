import { useParams } from "react-router";
import ResultsTable from "../../components/resultsTable/ResultsTable";
import { useEffect, useState, useTransition } from "react";
import type { Result } from "../../models/Result";
import { getCrewResultsInSport } from "../../api/resultsService";
import Button from "../../components/button/Button";
import { useTranslation } from "react-i18next";
export default function Results() {
  const { tourId, crewId, sportId } = useParams();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadEnabled, setUploadEnabled] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tourId && crewId && sportId) {
          setLoading(true);
          const response = await getCrewResultsInSport(tourId, crewId, sportId);
          setUploadEnabled(
            Boolean(response.filter((x: Result) => x.result_id).length === 0)
          );
          setResults(response);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      {uploadEnabled && <Button text={t("upload")} />}
      {!loading && results.length && <ResultsTable data={results} />}
    </div>
  );
}
