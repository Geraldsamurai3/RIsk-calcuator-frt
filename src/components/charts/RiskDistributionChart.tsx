"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { RiskStats } from "@/types/risk"

interface RiskDistributionChartProps {
  stats: RiskStats
}

const COLORS = {
  LOW: "#00FFA3",
  MEDIUM: "#FACC15",
  HIGH: "#FB923C",
  CRITICAL: "#FF5EDB",
}

export function RiskDistributionChart({ stats }: RiskDistributionChartProps) {
  const data = [
    { name: "Bajo", value: stats.byLevel.LOW, color: COLORS.LOW },
    { name: "Medio", value: stats.byLevel.MEDIUM, color: COLORS.MEDIUM },
    { name: "Alto", value: stats.byLevel.HIGH, color: COLORS.HIGH },
    { name: "Crítico", value: stats.byLevel.CRITICAL, color: COLORS.CRITICAL },
  ].filter((item) => item.value > 0)

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar</div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
