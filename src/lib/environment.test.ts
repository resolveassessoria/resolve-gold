import { describe, expect, it } from "vitest";

import { buildEnvUrl, getEnvironment } from "./environment";

type FakeLocation = {
  hostname: string;
  pathname: string;
  protocol: string;
  port: string;
};

function makeLocation(overrides: Partial<FakeLocation> = {}): FakeLocation {
  return {
    hostname: "resolvegold.com.br",
    pathname: "/",
    protocol: "https:",
    port: "",
    ...overrides,
  };
}

describe("environment routing", () => {
  it("detects admin environment from subdomain", () => {
    expect(getEnvironment(makeLocation({ hostname: "admin.resolvegold.com.br" }))).toBe("admin");
  });

  it("detects app environment from routes during local development", () => {
    expect(getEnvironment(makeLocation({ hostname: "localhost", pathname: "/cliente/dashboard" }))).toBe("app");
  });

  it("builds app urls correctly for custom domains with country-code TLDs", () => {
    expect(buildEnvUrl("app", "/login", makeLocation())).toBe("https://app.resolvegold.com.br/login");
  });

  it("switches between app and admin subdomains without truncating the base domain", () => {
    expect(
      buildEnvUrl("admin", "/dashboard", makeLocation({ hostname: "app.resolvegold.com.br" })),
    ).toBe("https://admin.resolvegold.com.br/dashboard");
  });

  it("keeps preview deployments on path-based navigation", () => {
    expect(
      buildEnvUrl("app", "/cliente/dashboard", makeLocation({ hostname: "resolve-gold.vercel.app" })),
    ).toBe("/cliente/dashboard");
  });

  it("keeps lovable preview deployments on path-based navigation", () => {
    expect(
      buildEnvUrl("app", "/cliente/dashboard", makeLocation({ hostname: "resolve-gold.lovable.app" })),
    ).toBe("/cliente/dashboard");
  });
});
