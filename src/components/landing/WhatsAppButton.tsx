import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5500000000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-background border-2 border-primary rounded-full flex items-center justify-center transition-all hover:scale-110"
    >
      <MessageCircle className="w-6 h-6 text-primary" />
    </a>
  );
}
