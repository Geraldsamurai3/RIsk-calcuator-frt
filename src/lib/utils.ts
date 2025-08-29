import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-CR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getRiskLevelColor(level: string): string {
  switch (level) {
    case "LOW":
      return "text-neon-green"
    case "MEDIUM":
      return "text-yellow-400"
    case "HIGH":
      return "text-orange-400"
    case "CRITICAL":
      return "text-neon-pink"
    default:
      return "text-foreground"
  }
}

export function getRiskCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    INVASION: "Invasión",
    ABDUCTION: "Abducción",
    VIRUS_XENO: "Virus Xenomorfo",
    UFO_CRASH: "Accidente OVNI",
    MIND_CONTROL: "Control Mental",
    QUANTUM_ANOMALY: "Anomalía Cuántica",
  }
  return labels[category] || category
}

export function calculateRiskLevel(score: number): string {
  if (score >= 1 && score <= 4) return "LOW"
  if (score >= 5 && score <= 9) return "MEDIUM"
  if (score >= 10 && score <= 16) return "HIGH"
  if (score >= 17 && score <= 25) return "CRITICAL"
  return "LOW"
}
