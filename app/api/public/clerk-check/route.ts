import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function decodePkHost(pk: string | undefined): string | null {
  if (!pk) return null;
  const raw = pk.replace(/^pk_(live|test)_/, "");
  try {
    return Buffer.from(raw, "base64").toString("utf8").replace(/\$$/, "") || null;
  } catch {
    return null;
  }
}

async function kids(url: string, headers?: Record<string, string>): Promise<string[]> {
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { keys?: { kid?: string }[] };
    return (json.keys ?? []).map((k) => k.kid ?? "").filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Diagnóstico sin secretos: ¿la clave secreta de Clerk es de la misma instancia
 * que la publicable? Solo devuelve booleanos y prefijos.
 */
export async function GET() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const sk = process.env.CLERK_SECRET_KEY;
  const host = decodePkHost(pk);
  const frontendKids = host ? await kids(`https://${host}/.well-known/jwks.json`) : [];
  const backendKids = sk
    ? await kids("https://api.clerk.com/v1/jwks", { Authorization: `Bearer ${sk}` })
    : [];
  return NextResponse.json({
    pkPrefix: pk?.slice(0, 8) ?? null,
    skPrefix: sk?.slice(0, 8) ?? null,
    frontendHost: host,
    frontendKeys: frontendKids.length,
    backendKeys: backendKids.length,
    sameInstance: frontendKids.length > 0 && frontendKids.some((k) => backendKids.includes(k)),
    loginFlag: process.env.AUTH_CLERK_LOGIN ?? null,
  });
}
