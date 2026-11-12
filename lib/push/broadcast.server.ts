import "server-only";
import { staffEmailMatcher } from "@/lib/auth/staff.server";
import { isPaymentsSuperAdminEmail } from "@/lib/payments/funding-roles.server";
import { sendWebPushWithStats } from "@/lib/push/send-web-push.server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Avisos de gerencia a todos ("¡Ya es hora de pautar!"): llegan como push a
 * quien tiene avisos activos y quedan en la campanita de todos, así nadie se
 * los pierde aunque no haya activado las notificaciones.
 */

export type BroadcastAudience = "clientes" | "todos" | "prueba";

export const BROADCAST_TITLE_MAX = 60;
export const BROADCAST_BODY_MAX = 180;

/** Destinos permitidos al tocar el aviso (rutas internas conocidas). */
export const BROADCAST_DESTINATIONS = [
  { url: "/overview", label: "Inicio", action: "Abrir Ads Holistic" },
  { url: "/payments", label: "Recargar saldo", action: "Recargar ahora" },
  { url: "/ad-accounts", label: "Cuentas publicitarias", action: "Ver mis cuentas" },
  { url: "/creative-analyzer", label: "Creativos", action: "Ver creativos" },
  { url: "/education", label: "Educación", action: "Ver tutorial" },
  { url: "/support", label: "Soporte", action: "Abrir soporte" },
] as const;

const ALLOWED_URLS = new Set<string>(BROADCAST_DESTINATIONS.map((d) => d.url));

export type BroadcastInput = {
  title: string;
  body: string;
  url: string;
  audience: BroadcastAudience;
};

export function parseBroadcastInput(raw: unknown): BroadcastInput {
  const r = (raw ?? {}) as Record<string, unknown>;
  const title = String(r.title ?? "").replace(/\s+/g, " ").trim();
  const body = String(r.body ?? "").replace(/[ \t]+/g, " ").trim();
  const url = String(r.url ?? "/overview").trim();
  const audience = r.audience;
  if (!title) throw new Error("Escribe un título.");
  if (title.length > BROADCAST_TITLE_MAX) throw new Error(`El título puede tener hasta ${BROADCAST_TITLE_MAX} letras.`);
  if (!body) throw new Error("Escribe el mensaje.");
  if (body.length > BROADCAST_BODY_MAX) throw new Error(`El mensaje puede tener hasta ${BROADCAST_BODY_MAX} letras.`);
  if (!ALLOWED_URLS.has(url)) throw new Error("Elige a dónde lleva el aviso.");
  if (audience !== "clientes" && audience !== "todos" && audience !== "prueba") {
    throw new Error("Elige a quién va el aviso.");
  }
  return { title, body, url, audience };
}

function isTeamEmail(email: string, isStaffEmail: (email: string) => boolean): boolean {
  return isStaffEmail(email) || isPaymentsSuperAdminEmail(email);
}

type Recipient = { id: string; organizationId: string | null };

async function resolveRecipients(audience: BroadcastAudience, senderId: string): Promise<Recipient[]> {
  const admin = createAdminClient();
  if (audience === "prueba") {
    return [{ id: senderId, organizationId: null }];
  }
  const out: Recipient[] = [];
  // Roster de staff_members leído una vez para todo el recorrido.
  const isStaffEmail = await staffEmailMatcher();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from("profiles")
      .select("id, email")
      .order("id")
      .range(from, from + 999);
    if (error) throw new Error("No se pudo leer la lista de usuarios.");
    for (const row of data ?? []) {
      const email = String(row.email ?? "");
      if (audience === "clientes" && isTeamEmail(email, isStaffEmail)) continue;
      out.push({ id: String(row.id), organizationId: null });
    }
    if (!data || data.length < 1000) break;
  }
  return out;
}

export type BroadcastAudienceCount = { recipients: number; devices: number };

/** Cuántas personas lo verán en la campanita y cuántos dispositivos lo reciben como push. */
export async function countBroadcastAudience(
  audience: BroadcastAudience,
  senderId: string,
): Promise<BroadcastAudienceCount> {
  const recipients = await resolveRecipients(audience, senderId);
  if (recipients.length === 0) return { recipients: 0, devices: 0 };
  const admin = createAdminClient();
  const ids = recipients.map((r) => r.id);
  let devices = 0;
  for (let i = 0; i < ids.length; i += 200) {
    const { count } = await admin
      .from("web_push_subscriptions")
      .select("id", { count: "exact", head: true })
      .in("user_id", ids.slice(i, i + 200));
    devices += count ?? 0;
  }
  return { recipients: recipients.length, devices };
}

export type BroadcastResult = {
  id: string | null;
  recipients: number;
  devices: number;
  delivered: number;
  failed: number;
};

export async function sendBroadcast(
  input: BroadcastInput,
  actor: { id: string; email: string },
): Promise<BroadcastResult> {
  const recipients = await resolveRecipients(input.audience, actor.id);
  if (recipients.length === 0) throw new Error("No hay a quién mandarle el aviso.");
  const admin = createAdminClient();

  // La prueba solo va como push al gerente; no ensucia la campanita de nadie.
  if (input.audience !== "prueba") {
    const rows = recipients.map((r) => ({
      organization_id: r.organizationId,
      user_id: r.id,
      title: input.title,
      body: input.body,
      type: "announcement",
      data: { url: input.url },
    }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await admin.from("notifications").insert(rows.slice(i, i + 500));
      if (error) throw new Error("No se pudo guardar el aviso. No se mandó nada.");
    }
  }

  const stats = await sendWebPushWithStats(
    recipients.map((r) => r.id),
    {
      title: input.title,
      body: input.body,
      url: input.url,
      tag: `broadcast-${Date.now()}`,
      actionLabel: BROADCAST_DESTINATIONS.find((d) => d.url === input.url)?.action ?? null,
    },
  );

  const { data } = await admin
    .from("push_broadcasts")
    .insert({
      title: input.title,
      body: input.body,
      url: input.url,
      audience: input.audience,
      sent_by: actor.id,
      sent_by_email: actor.email,
      recipients: recipients.length,
      devices: stats.devices,
      delivered: stats.delivered,
      failed: stats.failed,
    })
    .select("id")
    .maybeSingle();

  return {
    id: data?.id ? String(data.id) : null,
    recipients: recipients.length,
    ...stats,
  };
}

export type BroadcastLog = {
  id: string;
  title: string;
  body: string;
  url: string;
  audience: BroadcastAudience;
  sentByEmail: string | null;
  recipients: number;
  devices: number;
  delivered: number;
  createdAt: string;
};

export async function listBroadcasts(limit = 20): Promise<BroadcastLog[]> {
  const { data } = await createAdminClient()
    .from("push_broadcasts")
    .select("id,title,body,url,audience,sent_by_email,recipients,devices,delivered,created_at")
    .neq("audience", "prueba")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    body: String(row.body),
    url: String(row.url),
    audience: row.audience as BroadcastAudience,
    sentByEmail: row.sent_by_email ? String(row.sent_by_email) : null,
    recipients: Number(row.recipients) || 0,
    devices: Number(row.devices) || 0,
    delivered: Number(row.delivered) || 0,
    createdAt: String(row.created_at),
  }));
}
