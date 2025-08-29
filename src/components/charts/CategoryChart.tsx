"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { RiskStats } from "@/types/risk"
import { getRiskCategoryLabel } from "@/lib/utils"

interface CategoryChartProps {
  stats: RiskStats
}

export function CategoryChart({ stats }: CategoryChartProps) {
  const data = Object.entries(stats.byCategory)
    .map(([category, count]) => ({
      category: getRiskCategoryLabel(category),
      count,
      fill: "#0FF4F2",
    }))
    .filter((item) => item.count > 0)

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar</div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="category" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
        <YAxis tick={{ fill: "#9CA3AF" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#F9FAFB",
          }}
        />
        <Bar dataKey="count" fill="#0FF4F2" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
