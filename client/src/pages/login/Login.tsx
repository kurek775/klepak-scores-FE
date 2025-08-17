import Button from "../../components/button/Button";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const handleLogin = () => {
    // přesměruje na backend, ten zahájí Google OAuth
    window.location.href = "http://localhost:8000/auth/google/login";
  };
  return (
    <div className="p-8">
      <Button variant="primary" onClick={handleLogin} text={t("login")} />
    </div>
  );
}
