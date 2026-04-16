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
type LocationLike = Pick<Location, "hostname" | "pathname" | "protocol" | "port">;

const ADMIN_SUBDOMAINS = ["admin"];
const APP_SUBDOMAINS = ["app"];
const PREVIEW_HOSTS = ["vercel.app", "netlify.app", "pages.dev", "lovable.app"];

function isKnownAppSubdomain(subdomain: string): boolean {
  return ADMIN_SUBDOMAINS.includes(subdomain) || APP_SUBDOMAINS.includes(subdomain);
}

function isPreviewHost(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();
  return PREVIEW_HOSTS.some(
    (previewHost) =>
      normalizedHostname === previewHost || normalizedHostname.endsWith(`.${previewHost}`),
  );
}

function getBaseDomain(hostname: string): string | null {
  const parts = hostname.split(".").filter(Boolean);

  if (parts.length < 2) return null;

  const firstLabel = parts[0].toLowerCase();
  if (isKnownAppSubdomain(firstLabel)) {
    return parts.slice(1).join(".");
  }

  if (parts.length === 2) {
    return parts.join(".");
  }

  const lastLabel = parts.at(-1) ?? "";
  const secondToLastLabel = parts.at(-2) ?? "";
  const looksLikeCountryCodeRoot = lastLabel.length === 2 && secondToLastLabel.length <= 3;

  return looksLikeCountryCodeRoot
    ? parts.slice(-3).join(".")
    : parts.slice(-2).join(".");
}

/**
 * Detect the current environment from hostname.
 * Falls back to path-based detection for local dev / preview.
 */
export function getEnvironment(location: LocationLike = window.location): AppEnvironment {
  const { hostname, pathname } = location;

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
export function buildEnvUrl(env: AppEnvironment, path: string, location: LocationLike = window.location): string {
  const { hostname, protocol } = location;
  const port = location.port ? `:${location.port}` : "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // If we're on localhost or preview (no real subdomains), just use path
  if (hostname === "localhost" || hostname === "127.0.0.1" || isPreviewHost(hostname)) {
    return normalizedPath;
  }

  const configuredRootDomain = import.meta.env.VITE_ROOT_DOMAIN?.trim();
  const baseDomain = configuredRootDomain || getBaseDomain(hostname);

  if (!baseDomain) {
    return normalizedPath;
  }

  const subdomainMap: Record<AppEnvironment, string> = {
    public: "",
    app: "app.",
    admin: "admin.",
  };

  const sub = subdomainMap[env];
  return `${protocol}//${sub}${baseDomain}${port}${normalizedPath}`;
}

/** Check if current hostname matches a specific environment */
export function isEnvironment(env: AppEnvironment, location: LocationLike = window.location): boolean {
  return getEnvironment(location) === env;
}
