import { Activity, AlertTriangle, TrendingDown } from "lucide-react"
import type { RiskLevel } from "@/lib/chowdeck-members"

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const config = {
    Low: {
      className: "bg-success/15 text-success border-success/30 glow-success",
      icon: <TrendingDown className="size-3" />,
    },
    Moderate: {
      className: "bg-warning/15 text-warning border-warning/30 glow-warning",
      icon: <Activity className="size-3" />,
    },
    High: {
      className: "bg-destructive/15 text-destructive border-destructive/30 glow-destructive",
      icon: <AlertTriangle className="size-3" />,
    },
  }
  
  const { className, icon } = config[risk]
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {icon}
      {risk}
    </span>
  )
}
