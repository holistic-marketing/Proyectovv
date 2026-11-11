import "server-only";
import webpush from "web-push";
import { serverEnv } from "@/lib/env/env.server";
import { createAdminClient } from "@/lib/supabase/admin";

const PUSH_TYPES = new Set([
  "payment_approved",
  "payment_rejected",
  "payment_proof_uploaded",
  "payment_bank_confirmed",
]);

export type PushPayload = {
  title: string;
  body?: string | null;
  url?: string | null;
  /** Mismo tag = el aviso nuevo reemplaza al anterior en vez de apilarse. */
  tag?: string | null;
  /** Botón dentro del aviso (Windows/Android), ej. "Recargar ahora". */
  actionLabel?: string | null;
};

export type PushDeliveryStats = { devices: number; delivered: number; failed: number };

const EMPTY_STATS: PushDeliveryStats = { devices: 0, delivered: 0, failed: 0 };
/** Envíos en paralelo por tanda: suficiente para cientos sin saturar la función. */
const SEND_BATCH = 50;

function vapidReady(): boolean {
  return Boolean(serverEnv.vapidPublicKey && serverEnv.vapidPrivateKey);
}

function ensureVapid(): boolean {
  if (!vapidReady()) return false;
  webpush.setVapidDetails(
    "mailto:soporte@adsholistic.com",
    serverEnv.vapidPublicKey,
    serverEnv.vapidPrivateKey,
  );
  return true;
}

async function deliver(userIds: string[], payload: PushPayload): Promise<PushDeliveryStats> {
  if (!ensureVapid() || userIds.length === 0) return EMPTY_STATS;
  const admin = createAdminClient();
  const rows: Array<{ id: string; endpoint: string; p256dh: string; auth: string }> = [];
  for (let i = 0; i < userIds.length; i += 200) {
    const { data, error } = await admin
      .from("web_push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", userIds.slice(i, i + 200));
    if (error) {
      console.error("[web-push] no se pudieron leer las suscripciones", error);
      continue;
    }
    rows.push(...(data ?? []));
  }
  if (rows.length === 0) return EMPTY_STATS;

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body ?? "",
    url: payload.url || "/overview",
    tag: payload.tag || undefined,
    actionLabel: payload.actionLabel || undefined,
  });

  const dead: string[] = [];
  let delivered = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += SEND_BATCH) {
    await Promise.all(
      rows.slice(i, i + SEND_BATCH).map(async (row) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            message,
            { TTL: 60 * 60 * 24 * 3, urgency: "normal" },
          );
          delivered += 1;
        } catch (err) {
          failed += 1;
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) dead.push(row.id);
          else console.error("[web-push] envío falló", status ?? err);
        }
      }),
    );
  }

  if (dead.length > 0) {
    await admin.from("web_push_subscriptions").delete().in("id", dead);
  }
  return { devices: rows.length, delivered, failed };
}

/** Para avisos masivos: devuelve a cuántos dispositivos llegó. */
export async function sendWebPushWithStats(
  userIds: string[],
  payload: PushPayload,
): Promise<PushDeliveryStats> {
  const ids = [...new Set(userIds.map((id) => String(id ?? "").trim()).filter(Boolean))];
  try {
    return await deliver(ids, payload);
  } catch (error) {
    console.error("[web-push] no se pudo enviar", error);
    return EMPTY_STATS;
  }
}

export async function sendWebPushToUsers(
  userIds: Array<string | null | undefined>,
  payload: PushPayload,
): Promise<void> {
  const ids = [...new Set(userIds.map((id) => String(id ?? "").trim()).filter(Boolean))];
  try {
    await deliver(ids, payload);
  } catch (error) {
    console.error("[web-push] no se pudo enviar", error);
  }
}

export async function sendWebPushToEmails(
  emails: string[],
  payload: PushPayload,
): Promise<void> {
  const list = [...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))];
  if (list.length === 0 || !vapidReady()) return;
  try {
    const admin = createAdminClient();
    const orFilter = list.map((email) => `email.ilike.${email}`).join(",");
    const { data, error } = await admin.from("profiles").select("id, email").or(orFilter);
    if (error) {
      console.error("[web-push] no se pudieron resolver gerentes", error);
      return;
    }
    await deliver(
      (data ?? []).map((row) => String(row.id)),
      payload,
    );
  } catch (error) {
    console.error("[web-push] gerentes", error);
  }
}

export async function maybePushForNotification(input: {
  userId?: string | null;
  title: string;
  body?: string | null;
  type?: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  if (!input.userId || !input.type || !PUSH_TYPES.has(input.type)) return;
  const url = typeof input.data?.url === "string" ? input.data.url : "/payments";
  await sendWebPushToUsers([input.userId], {
    title: input.title,
    body: input.body,
    url,
    actionLabel: input.type === "payment_approved" ? "Ver mi saldo" : "Ver detalle",
  });
}
