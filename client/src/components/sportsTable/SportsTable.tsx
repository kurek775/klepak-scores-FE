import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { getSports, saveSports } from "../../api/sportsService";
import type { SportDTO } from "../../models/Sport";
import Button from "../button/Button";
import Table, { type HeaderConfig } from "pk-editable-table-component";

export default function SportsTable() {
  const { t } = useTranslation();
  const { tourId } = useParams();
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sports, setSports] = useState<SportDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const headers: HeaderConfig[] = [
    {
      columnLabel: t("sportTitle"),
      key: "sport_name",
      type: "text",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
    {
      columnLabel: t("sportMetric"),
      key: "sport_metric",
      enumConfig: {
        enumItems: ["time", "distance", "points"],
      },
      type: "enum",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
  ];

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
        setError(t("failedToLoadSports") ?? "Failed to load sports.");
      })
      .finally(() => setLoading(false));
  }, [tourId, t]);

  const handleSubmit = async (
    rows: Array<Record<string, string | number | null>>
  ) => {
    if (!tourId) return;
    setSaving(true);
    setError(null);
    try {
      const seen = new Set<string>();
      const payload = rows
        .map((r) => ({
          name: (r["sport_name"] ?? "").toString().trim(),
          metric: (r["sport_metric"] ?? "").toString().trim(),
        }))
        .filter((r) => r.name && r.metric)
        .filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)));

      const saved = await saveSports(tourId, payload);
      setSports(saved);
      setEditable(false);
    } catch (e) {
      console.error(e);
      setError(t("saveFailed") ?? "Saving sports failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{t("sports")}</h2>
        <Button
          text={editable ? t("cancel") : t("edit")}
          onClick={() => setEditable((v) => !v)}
          disabled={saving}
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <Table
        keyVal="sport_id"
        headers={headers}
        initialData={sports}
        editable={editable}
        actions={{ create: true, edit: true, delete: false }}
        text={{
          submit: saving ? t("saving") : t("submit"),
          addRow: t("addRow"),
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
