import { Suspense } from "react";
import { LoginForm } from "@/app/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
