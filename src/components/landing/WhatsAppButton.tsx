import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/5500000000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-background border-2 border-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:glow-gold"
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.9, 1, 0.9],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 2,
      }}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      <MessageCircle className="w-6 h-6 text-primary" />
    </motion.a>
  );
}
