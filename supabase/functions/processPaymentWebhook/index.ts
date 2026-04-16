import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { encode as hexEncode } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const computed = new TextDecoder().decode(hexEncode(new Uint8Array(sig)));
    return computed === signature;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only POST allowed
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("PAYMENT_WEBHOOK_SECRET not configured");
      return jsonResponse({ error: "Server misconfiguration" }, 500);
    }

    // Read raw body for signature verification
    const rawBody = await req.text();
    
    // Verify webhook signature
    const signature = req.headers.get("x-webhook-signature") || "";
    const isValid = await verifySignature(rawBody, signature, webhookSecret);
    
    if (!isValid) {
      console.error("Invalid webhook signature");
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    // Validate required fields
    const { event, payment } = payload;
    if (!event || !payment?.id || !payment?.value || !payment?.customer_id) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook reception
    await supabaseAdmin.from("audit_logs").insert({
      action: "webhook_received",
      target_table: "transactions",
      metadata: {
        event,
        payment_id: payment.id,
        timestamp: new Date().toISOString(),
        source: "payment_gateway",
      },
    });

    // Process based on event type
    if (event === "payment_confirmed" || event === "PAYMENT_RECEIVED") {
      // Lookup user by external ID
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", payment.customer_id)
        .single();

      if (!profile) {
        console.error("User not found for payment:", payment.customer_id);
        return jsonResponse({ error: "User not found" }, 404);
      }

      // Insert validated transaction
      const { error: txError } = await supabaseAdmin.from("transactions").insert({
        user_id: profile.id,
        valor: payment.value,
        tipo: "investimento",
        mes_referencia: new Date().toISOString().slice(0, 10),
      });

      if (txError) {
        console.error("Transaction insert error:", txError);
        return jsonResponse({ error: "Transaction processing failed" }, 500);
      }

      // Audit log
      await supabaseAdmin.from("audit_logs").insert({
        user_id: profile.id,
        action: "transaction_created_via_webhook",
        target_table: "transactions",
        metadata: {
          payment_id: payment.id,
          value: payment.value,
          event,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
