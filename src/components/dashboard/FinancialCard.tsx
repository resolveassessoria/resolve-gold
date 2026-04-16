import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface FinancialCardProps {
  title: string;
  value: number;
  icon?: LucideIcon;
  isProjection?: boolean;
  subtitle?: string;
  format?: "currency" | "percent" | "number" | "text";
  textValue?: string;
}

export function FinancialCard({
  title, value, icon: Icon, isProjection = false, subtitle, format = "currency", textValue,
}: FinancialCardProps) {
  const displayValue = format === "currency"
    ? formatBRL(value)
    : format === "percent"
      ? `${(value * 100).toFixed(1)}%`
      : format === "text"
        ? (textValue ?? "—")
        : value.toLocaleString("pt-BR");

  return (
    <Card className="bg-card border-gold">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-1">
          {isProjection && <Badge variant="outline" className="text-[10px] border-primary/40 text-primary px-1.5 py-0">Estimativa</Badge>}
          {Icon && <Icon className="w-4 h-4 text-primary" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-primary">{displayValue}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
