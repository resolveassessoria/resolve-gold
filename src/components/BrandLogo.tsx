import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  alt?: string;
}

export function BrandLogo({
  className,
  imageClassName,
  alt = "Resolve Assessoria e Solucoes Financeiras",
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img
        src="/resolve-logo.png"
        alt={alt}
        className={cn(
          "h-10 w-auto rounded-md border border-primary/30 bg-black object-contain shadow-[0_0_22px_rgba(198,164,63,0.12)]",
          imageClassName,
        )}
      />
    </div>
  );
}
