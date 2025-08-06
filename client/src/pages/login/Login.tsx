import Button from "../../components/button/Button";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <Button
        variant="primary"
        onClick={() => alert("Primary!")}
        text={t("login")}
      />
    </div>
  );
}
