export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const next = new URL(value, "https://ziteo.invalid");
    if (next.origin !== "https://ziteo.invalid" || next.pathname.startsWith("/auth/") || next.pathname === "/login") return "/";
    return `${next.pathname}${next.search}${next.hash}`;
  } catch { return "/"; }
}

export function appOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (!configured && process.env.NODE_ENV === "production") throw new Error("App URL is not configured.");
  const url = new URL(configured || "http://localhost:3000");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("App URL must use HTTPS.");
  return url.origin;
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  // All browser auth mutations require Origin, including sign-out.
  return Boolean(origin && origin === appOrigin());
}
