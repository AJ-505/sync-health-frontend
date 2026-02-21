import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  trend,
  className = "",
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; positive: boolean }
  className?: string
}) {
  return (
    <Card className={`border-border/50 bg-card/80 backdrop-blur-sm transition-smooth hover:border-primary/30 hover:shadow-lg ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="metric-value text-3xl font-bold tracking-tight">{value}</span>
              {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}>
                  {trend.positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
