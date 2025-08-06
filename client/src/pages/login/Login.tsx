import Button from "../../components/button/Button";

export default function Login() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Login</h1>
      <Button
        variant="primary"
        onClick={() => alert("Primary!")}
        text="Primary Button"
      />
    </div>
  );
}
