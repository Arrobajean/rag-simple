import { Suspense } from "react";
import { redirect } from "next/navigation";
import { accesoAbierto, linkedinConfigurado, passwordConfigurado } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Acceso · Gestión inmobiliaria" };
// Lee las variables de entorno en cada petición: si se prerenderiza, el build fija la redirección y el botón de LinkedIn
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (accesoAbierto()) redirect("/dashboard");
  const { error } = await searchParams;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-muted/30 p-4">
      <Suspense>
        <LoginForm conPassword={passwordConfigurado()} conLinkedin={linkedinConfigurado()} errorInicial={error} />
      </Suspense>
      <p className="max-w-sm text-center text-xs text-muted-foreground">Demo con datos sintéticos. Respuestas legales orientativas.</p>
    </div>
  );
}
