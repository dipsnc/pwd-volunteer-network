
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: "primary" | "orange" | "green" | "red" | "blue" | "purple"
  trend?: string
}

const colorClasses: Record<string, string> = {
  primary: "text-primary bg-primary/10",
  orange: "text-orange-500 bg-orange-500/10",
  green: "text-green-500 bg-green-500/10",
  red: "text-red-500 bg-red-500/10",
  blue: "text-blue-500 bg-blue-500/10",
  purple: "text-purple-500 bg-purple-500/10"
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "primary",
  trend
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group p-4 md:p-5 rounded-2xl border bg-card shadow-sm flex items-center justify-between",
        "transition-all duration-300 hover:shadow-md border-border/60"
      )}
    >
      <div className="space-y-1">
        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-bold">
          {label}
        </p>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
          {value}
        </h3>
      </div>

      <div
        className={cn(
          "p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm",
          colorClasses[color]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}
