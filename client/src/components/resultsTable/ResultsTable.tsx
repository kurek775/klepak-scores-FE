import { useState } from "react";
import { saveCrewResultsInSport } from "../../api/resultsService";
import Table, { type HeaderConfig } from "pk-editable-table-component";
import { useParams } from "react-router";
import type { Result } from "../../models/Result";
import { useTranslation } from "react-i18next";
import Button from "../button/Button";

type ResultsTableProps = {
  data: Result[];
};

export default function ResultsTable({ data }: ResultsTableProps) {
  const { t } = useTranslation();
  const { tourId, crewId, sportId } = useParams();
  const [editable, setEditable] = useState(true);
  const headers: HeaderConfig[] = [
    {
      columnLabel: t("name"),
      key: "person_name",
      type: "text",
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

  const handleSubmit = async (
    data: Array<Record<string, string | number | null | boolean>>
  ) => {
    if (tourId && crewId && sportId)
      await saveCrewResultsInSport(
        tourId,
        crewId,
        sportId,
        data as unknown as Result[]
      );
    setEditable(false);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{t("results")}</h2>
        <Button
          text={editable ? t("cancel") : t("edit")}
          onClick={() => setEditable((v) => !v)}
        />
      </div>

      <Table
        keyVal="id"
        headers={headers}
        initialData={data}
        onSubmit={handleSubmit}
        editable={editable}
        actions={{ create: false, edit: true, delete: false }}
        text={{
          submit: t("submit"),
        }}
      />
    </div>
  );
}
