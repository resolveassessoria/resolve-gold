/**
 * Environment detection based on hostname/subdomain.
 * 
 * Production:
 *   - site público:  seudominio.com
 *   - app usuários:  app.seudominio.com
 *   - admin:         admin.seudominio.com
 * 
 * Development / preview (single origin):
 *   Uses path-based fallback so all 3 environments work on localhost.
 */

export type AppEnvironment = "public" | "app" | "admin";

const ADMIN_SUBDOMAINS = ["admin"];
const APP_SUBDOMAINS = ["app"];

/**
 * Detect the current environment from hostname.
 * Falls back to path-based detection for local dev / preview.
 */
export function getEnvironment(): AppEnvironment {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Subdomain detection (production)
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const sub = parts[0].toLowerCase();
    if (ADMIN_SUBDOMAINS.includes(sub)) return "admin";
    if (APP_SUBDOMAINS.includes(sub)) return "app";
  }

  // Path-based fallback (dev/preview — single domain)
  if (pathname.startsWith("/admin")) return "admin";
  if (
    pathname.startsWith("/cliente") ||
    pathname.startsWith("/fomentador") ||
    pathname.startsWith("/corretor") ||
    pathname.startsWith("/franqueado") ||
    pathname.startsWith("/onboarding")
  ) {
    return "app";
  }

  return "public";
}

/** Build a URL for a different environment */
export function buildEnvUrl(env: AppEnvironment, path: string): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";
  const parts = hostname.split(".");

  // If we're on localhost or preview (no real subdomains), just use path
  if (hostname === "localhost" || hostname === "127.0.0.1" || parts.length < 3) {
    return `${path}`;
  }

  // Production: build subdomain URL
  const baseDomain = parts.slice(-2).join(".");
  const subdomainMap: Record<AppEnvironment, string> = {
    public: "",
    app: "app.",
    admin: "admin.",
  };

  const sub = subdomainMap[env];
  return `${protocol}//${sub}${baseDomain}${port}${path}`;
}

/** Check if current hostname matches a specific environment */
export function isEnvironment(env: AppEnvironment): boolean {
  return getEnvironment() === env;
}
