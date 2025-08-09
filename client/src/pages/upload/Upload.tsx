import { useTranslation } from "react-i18next";
import ResultsTable from "../../components/resultsTable/ResultsTable";
export default function Upload() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <ResultsTable />
    </div>
  );
}
