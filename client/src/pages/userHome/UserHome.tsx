import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSports } from "../../api/sportsService";
import type { SportDTO } from "../../models/Sport";
import Button from "../../components/button/Button";

export default function UserHome() {
  const { tourId, crewId } = useParams();
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<SportDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClick = (id: number) => {
    navigate(`/tours/${tourId}/crews/${crewId}/sport/${id}`);
  };

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
          <Button
            onClick={() => handleClick(s.sport_id)}
            key={s.sport_id}
            text={s.sport_name}
          />
        ))}
      </ul>
    </div>
  );
}
