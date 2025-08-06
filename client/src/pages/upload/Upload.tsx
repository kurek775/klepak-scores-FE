import { useTranslation } from "react-i18next";
import Button from "../../components/button/Button";

export default function Upload() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <Button
        variant="primary"
        onClick={() => alert("Primary!")}
        text={t("upload")}
      />
    </div>
  );
}
