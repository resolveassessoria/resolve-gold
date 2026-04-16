import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils/currency";
import { ProjectionBadge } from "./ProjectionBadge";

interface BreakdownRow {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BreakdownTableProps {
  title: string;
  rows: BreakdownRow[];
  isProjection?: boolean;
}

export function BreakdownTable({ title, rows, isProjection = false }: BreakdownTableProps) {
  return (
    <Card className="bg-card border-gold">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {title}
          {isProjection && <ProjectionBadge />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className={`flex justify-between items-center py-1.5 ${row.highlight ? 'border-t border-primary/30 pt-2' : 'border-b border-gold/50'}`}>
              <span className={`text-sm ${row.highlight ? 'font-bold' : 'text-muted-foreground'}`}>{row.label}</span>
              <span className={`text-sm ${row.highlight ? 'text-primary font-bold' : 'text-primary'}`}>{formatBRL(row.value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
