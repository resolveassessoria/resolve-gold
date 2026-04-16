import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type WhatsAppButtonProps = ComponentPropsWithoutRef<"a">;

export const WhatsAppButton = forwardRef<HTMLAnchorElement, WhatsAppButtonProps>(
  (
    {
      className,
      children,
      href = "https://wa.me/5500000000000",
      rel = "noopener noreferrer",
      target = "_blank",
      ...props
    },
    ref,
  ) => {
    return (
      <motion.a
        ref={ref}
        href={href}
        target={target}
        rel={rel}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-background transition-all duration-300 hover:scale-110 hover:glow-gold",
          className,
        )}
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
        {...props}
      >
        {children ?? <MessageCircle className="h-6 w-6 text-primary" />}
      </motion.a>
    );
  },
);

WhatsAppButton.displayName = "WhatsAppButton";
