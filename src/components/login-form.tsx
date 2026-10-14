"use client";

import * as React from "react";
import { Building2Icon, Loader2Icon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/hooks/use-login";

/** Textos para los códigos de error que devuelven las rutas de LinkedIn (nunca se muestra el código crudo). */
const MENSAJES_ERROR: Record<string, string> = {
  linkedin_cancelado: "Has cancelado el acceso con LinkedIn.",
  linkedin_estado: "La sesión de LinkedIn ha caducado. Vuelve a intentarlo.",
  linkedin_token: "LinkedIn no ha devuelto un acceso válido. Vuelve a intentarlo.",
  linkedin_perfil: "No se pudo leer tu perfil de LinkedIn.",
  linkedin_email: "LinkedIn no ha confirmado tu email. Verifícalo en LinkedIn y vuelve a intentarlo.",
  linkedin_red: "No se pudo conectar con LinkedIn. Inténtalo de nuevo.",
  linkedin_no_configurado: "El acceso con LinkedIn no está configurado.",
};

interface Props {
  conPassword: boolean;
  conLinkedin: boolean;
  errorInicial?: string;
}

export function LoginForm({ conPassword, conLinkedin, errorInicial }: Props) {
  const { loading, error, entrar } = useLogin();
  const [password, setPassword] = React.useState("");
  const errorLinkedin = errorInicial ? (MENSAJES_ERROR[errorInicial] ?? "No se pudo iniciar sesión.") : null;
  const descripcion =
    conLinkedin && conPassword
      ? "Entra con LinkedIn o con la contraseña de acceso"
      : conLinkedin
        ? "Entra con tu cuenta de LinkedIn"
        : "Introduce la contraseña de acceso";

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2Icon className="size-6" />
        </div>
        <CardTitle>Gestión inmobiliaria</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conLinkedin && (
          <div className="space-y-2">
            {/* Enlace normal: el inicio de sesión es una redirección del servidor a LinkedIn, no una página de la app */}
            <a href="/api/auth/linkedin" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              Entrar con LinkedIn
            </a>
            {errorLinkedin && <p role="alert" className="text-sm text-destructive">{errorLinkedin}</p>}
          </div>
        )}
        {conLinkedin && conPassword && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            o con contraseña
            <Separator className="flex-1" />
          </div>
        )}
        {conPassword && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (password) entrar(password);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" autoFocus={!conLinkedin} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={!password || loading}>
              {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
