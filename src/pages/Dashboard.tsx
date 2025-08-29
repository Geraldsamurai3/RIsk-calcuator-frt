"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { riskApi } from "@/services/api"
import { localStorageService } from "@/services/localStorage"
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart"
import { CategoryChart } from "@/components/charts/CategoryChart"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getRiskLevelColor, getRiskCategoryLabel } from "@/lib/utils"
import type { Risk, RiskStats } from "@/types/risk"
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Database,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"

export function Dashboard() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [stats, setStats] = useState<RiskStats>({
    total: 0,
    byLevel: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    byCategory: {
      INVASION: 0,
      ABDUCTION: 0,
      VIRUS_XENO: 0,
      UFO_CRASH: 0,
      MIND_CONTROL: 0,
      QUANTUM_ANOMALY: 0,
    },
    averageRiskScore: 0,
  })
  const [localStats, setLocalStats] = useState(localStorageService.getStats())
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
    loadLocalStats()

    // Set up periodic refresh
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [risksResponse, statsResponse] = await Promise.all([
        riskApi.getAll({ page: 1, limit: 10 }),
        riskApi.getStats(),
      ])

      setRisks(risksResponse.data)
      setStats(statsResponse)
      setIsOnline(true)
    } catch (error) {
      console.error("Error loading data:", error)
      setIsOnline(false)
      toast({
        title: "Modo offline",
        description: "No se pudo conectar al servidor. Mostrando datos locales.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadLocalStats = () => {
    setLocalStats(localStorageService.getStats())
  }

  const handleDelete = async (id: string) => {
    try {
      await riskApi.delete(id)
      toast({ title: "Riesgo eliminado", description: "El riesgo ha sido eliminado del sistema" })
      loadData()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el riesgo", variant: "destructive" })
    }
  }

  const handleRefresh = () => {
    loadData()
    loadLocalStats()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Riesgos</h1>
          <p className="text-muted-foreground">Monitoreo en tiempo real de amenazas alienígenas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={() => navigate("/new")} variant="neon">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Riesgo
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-neon-green" />
            <span className="text-neon-green">Conectado al servidor</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400">Modo offline - Datos locales</span>
          </>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-neon-cyan" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Riesgos (Servidor)</h3>
          </div>
          <p className="text-2xl font-bold text-neon-cyan">{isOnline ? stats.total : "---"}</p>
          <p className="text-xs text-muted-foreground mt-1">Registros en base de datos</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-neon-pink" />
            <h3 className="text-sm font-medium text-muted-foreground">Críticos</h3>
          </div>
          <p className="text-2xl font-bold text-neon-pink">
            {isOnline ? stats.byLevel.CRITICAL : localStats.byLevel.CRITICAL}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Requieren acción inmediata</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-neon-green" />
            <h3 className="text-sm font-medium text-muted-foreground">Promedio</h3>
          </div>
          <p className="text-2xl font-bold text-neon-green">
            {isOnline ? stats.averageRiskScore : localStats.averageRiskScore}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Puntuación promedio</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-neon-purple" />
            <h3 className="text-sm font-medium text-muted-foreground">Historial Local</h3>
          </div>
          <p className="text-2xl font-bold text-neon-purple">{localStats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Snapshots guardados</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-neon-cyan" />
            Distribución por Nivel
          </h2>
          <RiskDistributionChart stats={isOnline ? stats : localStats} />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-neon-cyan" />
            Riesgos por Categoría
          </h2>
          <CategoryChart stats={isOnline ? stats : localStats} />
        </div>
      </div>

      {/* Recent Risks Table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-neon-cyan" />
            Riesgos Recientes
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-neon-cyan" />
            <p className="text-muted-foreground">Cargando riesgos...</p>
          </div>
        ) : risks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No hay riesgos registrados aún</p>
            <p className="text-sm mb-4">Comienza creando tu primer registro de amenaza alienígena</p>
            <Button onClick={() => navigate("/new")} variant="neon">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Riesgo
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Table Header */}
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-4">Título</div>
                <div className="col-span-2">Categoría</div>
                <div className="col-span-1">Nivel</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-2">Acciones</div>
              </div>
            </div>

            {/* Table Rows */}
            {risks.map((risk) => (
              <div key={risk.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="grid grid-cols-12 gap-4 text-sm">
                  <div className="col-span-4">
                    <div className="font-medium text-foreground">{risk.title}</div>
                    {risk.description && (
                      <div className="text-muted-foreground text-xs mt-1 truncate">{risk.description}</div>
                    )}
                  </div>
                  <div className="col-span-2 text-muted-foreground">{getRiskCategoryLabel(risk.category)}</div>
                  <div className="col-span-1">
                    <span className={`font-medium ${getRiskLevelColor(risk.riskLevel)}`}>{risk.riskLevel}</span>
                  </div>
                  <div className="col-span-1 font-mono text-neon-cyan">{risk.riskScore}/25</div>
                  <div className="col-span-2 text-muted-foreground text-xs">{formatDate(risk.createdAt)}</div>
                  <div className="col-span-2 flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/edit/${risk.id}`)} className="h-8 px-2">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/edit/${risk.id}`)} className="h-8 px-2">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(risk.id)}
                      className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {risks.length > 0 && (
          <div className="p-4 border-t border-border text-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Ver Todos los Riesgos
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
