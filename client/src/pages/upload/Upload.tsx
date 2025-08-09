import { useTranslation } from "react-i18next";
import Button from "../../components/button/Button";
import TourPersons from "../../components/test/Test";
import { useParams } from "react-router-dom";
export default function Upload() {
  const { t } = useTranslation();
  const { tourId, crewId, sportId } = useParams();
  return (
    <div className="p-8">
      {tourId}
      {crewId}
      {sportId}
      <TourPersons />
    </div>
  );
}
