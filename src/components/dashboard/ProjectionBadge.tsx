import { Badge } from "@/components/ui/badge";

interface ProjectionBadgeProps {
  label?: string;
}

export function ProjectionBadge({ label = "Estimativa" }: ProjectionBadgeProps) {
  return (
    <Badge variant="outline" className="border-primary/40 text-primary text-[10px] px-2 py-0.5 font-normal">
      {label}
    </Badge>
  );
}
