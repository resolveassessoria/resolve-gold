import { FinancialCard } from "./FinancialCard";
import { LucideIcon } from "lucide-react";

interface KPIItem {
  title: string;
  value: number;
  icon?: LucideIcon;
  isProjection?: boolean;
  subtitle?: string;
  format?: "currency" | "percent" | "number" | "text";
  textValue?: string;
}

interface KPIGridProps {
  items: KPIItem[];
  columns?: 2 | 3 | 4;
}

export function KPIGrid({ items, columns = 4 }: KPIGridProps) {
  const colClass = columns === 2 ? "md:grid-cols-2" : columns === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-4`}>
      {items.map((item, i) => (
        <FinancialCard key={i} {...item} />
      ))}
    </div>
  );
}
