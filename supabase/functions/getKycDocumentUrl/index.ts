import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Sua sessão expirou. Faça login novamente." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client for identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Sua sessão expirou. Faça login novamente." }, 401);
    }

    // Parse request
    const { document_id } = await req.json();
    if (!document_id || typeof document_id !== "string") {
      return jsonResponse({ error: "Documento não encontrado." }, 400);
    }

    // Admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const { data: adminCheck } = await supabaseAdmin.rpc("is_admin", { _user_id: user.id });
    const isAdmin = !!adminCheck;

    // If admin, verify they have admin_kyc or admin_full sub-role
    if (isAdmin) {
      const { data: hasKycRole } = await supabaseAdmin.rpc("has_admin_role", {
        _user_id: user.id,
        _role: "admin_kyc",
      });
      // admin_full also passes (handled in the function)
      if (!hasKycRole) {
        return jsonResponse({ error: "Você não tem permissão para acessar este documento." }, 403);
      }
    }

    // Fetch document record
    const { data: doc, error: docError } = await supabaseAdmin
      .from("kyc_documents")
      .select("id, user_id, file_url, document_type")
      .eq("id", document_id)
      .single();

    if (docError || !doc) {
      return jsonResponse({ error: "Documento não encontrado." }, 404);
    }

    // Authorization: owner or admin with kyc role
    if (!isAdmin && doc.user_id !== user.id) {
      return jsonResponse({ error: "Você não tem permissão para acessar este documento." }, 403);
    }

    // Generate signed URL (60 seconds)
    const expiresIn = 60;
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from("kyc-documents")
      .createSignedUrl(doc.file_url, expiresIn);

    if (signedError || !signedData?.signedUrl) {
      console.error("Signed URL error:", signedError);
      return jsonResponse({ error: "Não foi possível carregar o documento. Tente novamente." }, 500);
    }

    // Fetch user profile for role info
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      user_id: user.id,
      action: "kyc_document_view",
      target_table: "kyc_documents",
      target_id: doc.id,
      metadata: {
        document_type: doc.document_type,
        target_user_id: doc.user_id,
        is_admin: isAdmin,
        role: profile?.tipo_usuario || "unknown",
        timestamp: new Date().toISOString(),
      },
    });

    return jsonResponse({
      signed_url: signedData.signedUrl,
      expires_in: expiresIn,
    });
  } catch (err) {
    console.error("getKycDocumentUrl error:", err);
    return jsonResponse({ error: "Não foi possível carregar o documento. Tente novamente." }, 500);
  }
});
