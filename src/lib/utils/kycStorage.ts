import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  "401": "Sua sessão expirou. Faça login novamente.",
  "403": "Você não tem permissão para acessar este documento.",
  "404": "Documento não encontrado.",
  default: "Não foi possível carregar o documento. Tente novamente.",
};

/**
 * Fetches a temporary signed URL for a KYC document via edge function.
 * Never caches or persists the URL.
 */
export async function getKycSignedUrl(documentId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("getKycDocumentUrl", {
      body: { document_id: documentId },
    });

    if (error) {
      const msg = ERROR_MESSAGES.default;
      toast.error(msg);
      return null;
    }

    if (data?.error) {
      toast.error(data.error);
      return null;
    }

    return data?.signed_url || null;
  } catch {
    toast.error(ERROR_MESSAGES.default);
    return null;
  }
}
