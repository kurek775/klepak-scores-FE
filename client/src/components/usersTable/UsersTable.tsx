// src/components/tours/ToursTable.tsx
import { useEffect, useState } from "react";
import Table from "pk-editable-table-component";
import { useTranslation } from "react-i18next";
import Button from "../button/Button";
import { useNavigate, useParams } from "react-router";
import type { AssignedUser } from "../../models/User";
import { listUsers } from "../../api/usersService";

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

export default function UsersTable() {
  const { t } = useTranslation();
  const { tourId } = useParams();
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const headers: HeaderConfig[] = [
    {
      columnLabel: t("email"),
      key: "email",
      type: "text",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
    {
      columnLabel: t("crew"),
      key: "crew_id",
      type: "number",
      required: true,
      sorterDisabled: true,
      filterDisabled: true,
    },
  ];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers(tourId!);
      setUsers(data);
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
        initialData={users}
        editable={editable}
        actions={{ create: true, edit: true, delete: false }}
        text={{
          submit: saving ? t("saving") || "Saving…" : t("submit") || "Submit",
          addRow: t("addRow") || "Add row",
        }}
      />
    </div>
  );
}
