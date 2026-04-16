/**
 * Masks a CPF showing only last 3 digits: ***.***. **X-XX
 */
export function maskCPF(cpf: string | null | undefined): string {
  if (!cpf) return "Não informado";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 4) return "***.***.***-**";
  const last3 = digits.slice(-3);
  return `***.***.*${last3.charAt(0)}-${last3.slice(1)}`;
}

/**
 * Masks a phone number showing only last 4 digits
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "Não informado";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "(••) •••••-••••";
  const last4 = digits.slice(-4);
  return `(••) •••••-${last4}`;
}

/**
 * Masks email: shows first 2 chars and domain
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}
