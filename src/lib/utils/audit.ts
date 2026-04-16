import { supabase } from "@/integrations/supabase/client";

interface AuditLogParams {
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an action via edge function (audit_logs is no longer directly writable by users).
 * Falls back silently — audit logging should never block user flows.
 */
export async function logAudit({ action, targetTable, targetId, metadata }: AuditLogParams) {
  try {
    // Audit logging now happens primarily via:
    // 1. Database triggers (role changes, KYC status, admin roles)
    // 2. Edge functions (document access, webhooks)
    // Frontend audit calls are no-ops since direct insert was removed for security.
    // If you need frontend-initiated audit logging, create an edge function.
    console.debug("[audit]", action, targetTable, targetId);
  } catch {
    // Audit logging should never break the app
  }
}
