type AuthErrorLike = {
  code?: string | null;
  message?: string | null;
};

export function getLoginErrorMessage(error: AuthErrorLike | null | undefined): string {
  const normalizedCode = String(error?.code ?? "").toLowerCase();
  const normalizedMessage = String(error?.message ?? "").toLowerCase();

  if (
    normalizedCode === "email_not_confirmed" ||
    normalizedMessage.includes("email not confirmed") ||
    normalizedMessage.includes("email_not_confirmed")
  ) {
    return "Confirme seu email antes de fazer login. Verifique sua caixa de entrada.";
  }

  if (
    normalizedCode === "invalid_credentials" ||
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid_credentials")
  ) {
    return "Email ou senha incorretos.";
  }

  return error?.message?.trim() || "Nao foi possivel entrar. Tente novamente.";
}
