import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSports } from "../../api/test";

type SportDTO = { sport_id: number; sport_name: string };

export default function UserHome() {
  const { tourId } = useParams();
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<SportDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tourId) {
      setError("Missing tourId in route.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    getSports(tourId)
      .then(setSports)
      .catch((err) => {
        console.error("API error:", err);
        setError("Failed to load sports.");
      })
      .finally(() => setLoading(false));
  }, [tourId]);

  if (loading) return <div className="p-8">…loading</div>;
  return (
    <div className="p-8">
      <ul className="space-y-2">
        {sports.map((s) => (
          <li
            key={s.sport_id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm"
          >
            <span className="font-medium text-gray-500">{s.sport_name}</span>
            <code className="text-xs text-gray-500">#{s.sport_id}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
