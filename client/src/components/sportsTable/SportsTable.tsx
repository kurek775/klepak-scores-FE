import { useEffect, useState } from "react";
import Table from "pk-editable-table-component";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { getSports } from "../../api/sportsService";
import type { SportDTO } from "../../models/Sport";
import Button from "../button/Button";
type ColumnType = "text" | "number" | "enum";
type EnumConfig = {
  enumItems: string[];
};
type HeaderConfig = {
  columnLabel?: string;
  key: string;
  type: ColumnType;
  disabled?: boolean;
  required?: boolean;
  filterDisabled?: boolean;
  sorterDisabled?: boolean;
  enumConfig?: EnumConfig;
};
export default function SportsTable() {
  const { t } = useTranslation();
  const { tourId } = useParams();
  const [editable, setEditable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const headers: HeaderConfig[] = [
    {
      columnLabel: t("sportTitle"),
      key: "sport_name",
      type: "text" as ColumnType,
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
    {
      columnLabel: t("sportMetric"),
      key: "sport_metric",
      enumConfig: {
        enumItems: ["distance", "points"],
      },
      type: "enum" as ColumnType,
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
  ];

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2>{t("sports")}</h2>
      <Button text={t("edit")} onClick={() => setEditable(!editable)} />
      <Table
        keyVal="id"
        headers={headers}
        initialData={sports}
        editable={editable}
        actions={{ create: true, edit: true, delete: false }}
        text={{
          submit: t("submit"),
          addRow: t("addRow"),
        }}
      />
    </div>
  );
}
