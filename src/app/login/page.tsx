import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Acceso · Gestión inmobiliaria" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
