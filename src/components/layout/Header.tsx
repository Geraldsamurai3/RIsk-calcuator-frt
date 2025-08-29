import { Activity, Zap } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="h-8 w-8 text-neon-cyan animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 text-neon-cyan opacity-50 animate-ping" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Calculadora de Riesgo Alienígena</h1>
              <p className="text-sm text-muted-foreground">Sistema de Evaluación de Amenazas Extraterrestres</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-neon-green animate-pulse" />
            <span className="text-sm text-neon-green font-medium">Sistema Activo</span>
          </div>
        </div>
      </div>
    </header>
  )
}
