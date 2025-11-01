// src/components/tours/ToursTable.tsx
import { useEffect, useState } from "react";
import Table from "pk-editable-table-component";
import { useTranslation } from "react-i18next";
import { listTours, createTour, updateTour } from "../../api/toursService";
import Button from "../button/Button";
import type { TourDTO } from "../../models/Tour";
import { useNavigate } from "react-router";

type ColumnType = "text" | "number" | "enum";
type HeaderConfig = {
  columnLabel?: string;
  key: string;
  type: ColumnType;
  disabled?: boolean;
  required?: boolean;
  filterDisabled?: boolean;
  sorterDisabled?: boolean;
};

export default function ToursTable() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tours, setTours] = useState<TourDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const headers: HeaderConfig[] = [
    {
      columnLabel: t("year"),
      key: "year",
      type: "number",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },

    {
      columnLabel: t("theme"),
      key: "theme",
      type: "text",
      sorterDisabled: true,
      filterDisabled: true,
    },
  ];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTours();
      setTours(data);
    } catch (e) {
      console.error("API error:", e);
      setError(t("failedToLoadTours") ?? "Failed to load tours.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const handleDoubleClick = (
    item: Record<string, string | number | null | boolean>
  ) => {
    if (item?.id) {
      navigate("../tours/" + item.id);
    }
  };
  const handleSubmit = async (
    rows: Array<Record<string, string | number | null | boolean>>
  ) => {
    setSaving(true);
    setError(null);
    try {
      const creates: Array<Promise<any>> = [];
      const updates: Array<Promise<any>> = [];
      console.log(rows);

      for (const r of rows) {
        console.log(r);
        const id = r["id"];
        const yearRaw = r["year"];
        const partRaw = r["part"];
        const themeRaw = r["theme"];
        const templateIdRaw = r["template_id"];

        const year =
          yearRaw === null || yearRaw === undefined || yearRaw === ""
            ? undefined
            : Number(yearRaw);

        const template_id =
          templateIdRaw === null ||
          templateIdRaw === undefined ||
          templateIdRaw === ""
            ? undefined
            : Number(templateIdRaw);

        const part = (partRaw ?? "").toString().trim() || undefined;
        const theme = (themeRaw ?? "").toString().trim() || undefined;

        if (!id) {
          if (typeof year !== "number" || Number.isNaN(year)) {
            throw new Error(
              t("yearIsRequired") ?? "Year is required for new rows."
            );
          }
          creates.push(
            createTour({
              year,
              part: part ?? null,
              theme: theme ?? null,
              template_id: template_id ?? null,
            })
          );
        } else {
          const payload: any = {};
          if (typeof year === "number" && !Number.isNaN(year))
            payload.year = year;
          if (part !== undefined) payload.part = part || null;
          if (theme !== undefined) payload.theme = theme || null;
          if (template_id !== undefined)
            payload.template_id = template_id ?? null;

          if (Object.keys(payload).length > 0) {
            updates.push(updateTour(Number(id), payload));
          }
        }
      }

      if (creates.length) await Promise.all(creates);
      if (updates.length) await Promise.all(updates);

      await load();
      setEditable(false);
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message ?? (t("saveFailed") as string) ?? "Saving tours failed."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{t("tours") || "Tours"}</h2>
        <Button
          text={editable ? t("cancel") || "Cancel" : t("edit") || "Edit"}
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
        keyVal="id"
        headers={headers}
        initialData={tours}
        editable={editable}
        actions={{ create: true, edit: true, delete: false }}
        text={{
          submit: saving ? t("saving") || "Saving…" : t("submit") || "Submit",
          addRow: t("addRow") || "Add row",
        }}
        onSubmit={handleSubmit}
        onRowDoubleClick={handleDoubleClick}
      />
    </div>
  );
}
