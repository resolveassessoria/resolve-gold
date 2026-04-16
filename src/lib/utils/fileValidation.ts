const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(file: File): FileValidationResult {
  // Check size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB.` };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "Tipo de arquivo não permitido. Use PDF, JPG, PNG ou WEBP." };
  }

  // Check extension
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: "Extensão de arquivo não permitida." };
  }

  // Check for suspicious filenames
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return { valid: false, error: "Nome de arquivo inválido." };
  }

  return { valid: true };
}

/**
 * Generates a safe filename using user ID and timestamp (no personal data)
 */
export function generateSafeFilename(userId: string, docType: string, originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "pdf";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${docType}_${timestamp}_${random}.${ext}`;
}
