import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/button/Button";
import { useTranslation } from "react-i18next";
export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  return (
    <div className="mx-auto max-w-sm p-6 text-center space-y-4">
      <h1 className="text-2xl font-bold">Přihlášení</h1>
      <Button
        onClick={login}
        text={t("login")}
        className="px-4 py-2 rounded bg-black text-white"
      />
    </div>
  );
}
