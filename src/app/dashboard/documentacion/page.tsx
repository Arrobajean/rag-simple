import type { ReactNode } from "react";
import {
  BellIcon, BookOpenIcon, Building2Icon, FileTextIcon, HistoryIcon, LifeBuoyIcon, LayoutDashboardIcon, MessageSquareIcon, ScanTextIcon, SendIcon, ShieldCheckIcon, SlidersHorizontalIcon, StarIcon, UsersIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Documentación · Gestión inmobiliaria" };

function Seccion({ id, titulo, icono, children }: { id: string; titulo: string; icono: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">{icono}</span>
        {titulo}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{n}</span>
      <span>
        <span className="font-medium text-foreground">{titulo}</span> {children}
      </span>
    </li>
  );
}

const MODULOS = [
  { icono: LayoutDashboardIcon, titulo: "Panel", texto: "Resumen de la cartera: cobros, alertas, embudo de clientes y documentos que el asistente ha detectado." },
  { icono: MessageSquareIcon, titulo: "Asistente", texto: "Chat con el asistente Atlas. Responde con datos de la cartera y cita los documentos en los que se apoya." },
  { icono: Building2Icon, titulo: "Propiedades", texto: "Fichas de inmuebles y edificios, con filtros por zona, precio, superficie y estado." },
  { icono: BellIcon, titulo: "Alertas", texto: "Avisos de vencimientos, impagos y tareas pendientes, con opción de resolver o posponer." },
  { icono: UsersIcon, titulo: "Clientes", texto: "Listado de clientes y coincidencias entre lo que buscan y la cartera disponible." },
  { icono: FileTextIcon, titulo: "Documentos", texto: "Subida y búsqueda semántica en contratos y escrituras. Cada respuesta del asistente apunta a su fuente." },
  { icono: ScanTextIcon, titulo: "Lector de contratos", texto: "Extrae los campos de un contrato con IA y propone un formulario para revisar y confirmar antes de guardar." },
  { icono: SlidersHorizontalIcon, titulo: "Campos del catálogo", texto: "Catálogo de campos que el lector puede reconocer. Los cambios propuestos requieren aprobación." },
  { icono: StarIcon, titulo: "Valoraciones", texto: "Qué respuestas del asistente resultan útiles o mejorables. Solo visible para administradores." },
  { icono: HistoryIcon, titulo: "Accesos", texto: "Quién entra, con qué rol, por qué método y desde qué dispositivo. Solo visible para administradores." },
] as const;

export default function DocumentacionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <PageHeader titulo="Documentación" descripcion="Cómo funciona esta demo de gestión inmobiliaria y qué puedes probar en cada pantalla" />

      <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <ShieldCheckIcon className="size-4" /> Demo con datos sintéticos
        </p>
        <p className="text-muted-foreground">
          Todo lo que ves (propiedades, clientes, contratos y documentos) es ficticio y se genera para la demostración. Las respuestas del asistente son orientativas y no sustituyen el asesoramiento legal.
        </p>
      </div>

      <Seccion id="acceso" titulo="Cómo entrar" icono={<BookOpenIcon className="size-4" />}>
        <p>El acceso es con LinkedIn. Pulsa <span className="font-medium text-foreground">Entrar con LinkedIn</span> en la pantalla de acceso y autoriza la aplicación; solo se leen tu nombre, email y foto, nunca se publica nada en tu nombre.</p>
        <ol className="space-y-2">
          <Paso n={1} titulo="Inicia sesión.">Según la configuración, también puede haber acceso por contraseña.</Paso>
          <Paso n={2} titulo="Tu rol se asigna solo.">Las cuentas de la lista de administradores ven las pantallas de administración; el resto entra como visitante y usa la aplicación como un gestor.</Paso>
          <Paso n={3} titulo="Cada entrada queda registrada.">Método y dispositivo se guardan en el Registro de accesos.</Paso>
        </ol>
      </Seccion>

      <Seccion id="recorrido" titulo="Recorrido por el panel" icono={<LayoutDashboardIcon className="size-4" />}>
        <p className="text-muted-foreground">Cada entrada del menú lateral abre una pantalla:</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODULOS.map((m) => (
            <li key={m.titulo} className="rounded-lg border p-3">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <m.icono className="size-4 text-muted-foreground" />
                {m.titulo}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.texto}</p>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="asistente" titulo="Cómo trabaja el asistente" icono={<MessageSquareIcon className="size-4" />}>
        <p>El asistente combina búsqueda semántica en los documentos con consultas a los datos de la cartera. Antes de escribir en la base de datos, propone la acción y espera tu confirmación.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Cita las fuentes en las que se apoya; puedes abrir el documento original.</li>
          <li>Rechaza peticiones fuera de alcance o intentos de manipular el sistema.</li>
          <li>Puedes valorar cada respuesta con 👍 o 👎; el administrador lo revisa en Valoraciones.</li>
        </ul>
      </Seccion>

      <Seccion id="admin" titulo="Pantallas de administración" icono={<StarIcon className="size-4" />}>
        <p>Solo para las cuentas de la lista de administradores:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><span className="font-medium text-foreground">Valoraciones:</span> respuestas útiles y mejorables, acciones ejecutadas y bloqueos del asistente.</li>
          <li><span className="font-medium text-foreground">Accesos:</span> historial de entradas con rol, método y dispositivo.</li>
          <li><span className="font-medium text-foreground">Soporte y feedback:</span> mensajes que dejan los usuarios desde el menú lateral.</li>
        </ul>
      </Seccion>

      <Seccion id="ayuda" titulo="Soporte y feedback" icono={<LifeBuoyIcon className="size-4" />}>
        <p>En el menú lateral, en <span className="font-medium text-foreground">Recursos</span>, tienes dos accesos directos:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <LifeBuoyIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span><span className="font-medium text-foreground">Soporte:</span> para contar un problema o una duda y que el equipo te responda.</span>
          </li>
          <li className="flex items-start gap-2">
            <SendIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span><span className="font-medium text-foreground">Feedback:</span> para proponer mejoras de la demo.</span>
          </li>
        </ul>
        <p>Si has entrado con LinkedIn, el mensaje se asocia a tu email automáticamente; si no, puedes dejar un email de contacto.</p>
      </Seccion>

      <Seccion id="privacidad" titulo="Datos y privacidad" icono={<ShieldCheckIcon className="size-4" />}>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Los datos de la demo son sintéticos; no corresponden a personas ni inmuebles reales.</li>
          <li>La sesión se guarda en una cookie firmada y caduca a las pocas horas.</li>
          <li>Los mensajes de soporte y feedback solo los lee el administrador.</li>
        </ul>
      </Seccion>
    </div>
  );
}
