import { supabase } from "@/integrations/supabase/client";

interface AuditLogParams {
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an action to the audit_logs table.
 * Fails silently to not block user flows.
 */
export async function logAudit({ action, targetTable, targetId, metadata }: AuditLogParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_logs" as any).insert({
      user_id: user.id,
      action,
      target_table: targetTable || null,
      target_id: targetId || null,
      metadata: metadata || {},
    } as any);
  } catch {
    // Audit logging should never break the app
  }
}
