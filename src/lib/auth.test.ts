import { describe, expect, it } from "vitest";

import { getLoginErrorMessage } from "./auth";

describe("getLoginErrorMessage", () => {
  it("maps unconfirmed email errors", () => {
    expect(getLoginErrorMessage({ code: "email_not_confirmed" })).toBe(
      "Confirme seu email antes de fazer login. Verifique sua caixa de entrada.",
    );
  });

  it("maps invalid credentials errors", () => {
    expect(getLoginErrorMessage({ message: "Invalid login credentials" })).toBe(
      "Email ou senha incorretos.",
    );
  });

  it("falls back to the provided message", () => {
    expect(getLoginErrorMessage({ message: "Custom auth error" })).toBe("Custom auth error");
  });

  it("falls back to a generic message when nothing useful is provided", () => {
    expect(getLoginErrorMessage(undefined)).toBe("Nao foi possivel entrar. Tente novamente.");
  });
});
