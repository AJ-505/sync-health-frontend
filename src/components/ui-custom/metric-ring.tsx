import type { RiskLevel } from "@/lib/chowdeck-members"

export function MetricRing({ 
  value, 
  maxValue = 100, 
  size = 80, 
  strokeWidth = 6,
  risk,
}: { 
  value: number
  maxValue?: number
  size?: number
  strokeWidth?: number
  risk: RiskLevel
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / maxValue, 1)
  const offset = circumference * (1 - progress)
  
  const colorMap = {
    Low: "stroke-success",
    Moderate: "stroke-warning",
    High: "stroke-destructive",
  }
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${colorMap[risk]} animate-ring-fill`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="metric-value text-lg font-semibold">{value}%</span>
      </div>
    </div>
  )
}
