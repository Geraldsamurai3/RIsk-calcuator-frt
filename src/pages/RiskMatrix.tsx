"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { riskApi } from "@/services/api"
import { localStorageService } from "@/services/localStorage"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getRiskCategoryLabel } from "@/lib/utils"
import type { Risk, SavedRiskSnapshot } from "@/types/risk"
import { ArrowLeft, Info, Zap, AlertTriangle, Eye } from "lucide-react"

interface MatrixRisk {
  id: string
  title: string
  category: string
  likelihood: number
  impact: number
  riskScore: number
  riskLevel: string
  source: "api" | "local"
  createdAt: string
}

export function RiskMatrix() {
  const [matrixRisks, setMatrixRisks] = useState<MatrixRisk[]>([])
  const [selectedRisk, setSelectedRisk] = useState<MatrixRisk | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadMatrixData()
  }, [])

  const loadMatrixData = async () => {
    try {
      setIsLoading(true)
      const risks: MatrixRisk[] = []

      // Load from API
      try {
        const apiResponse = await riskApi.getAll({ page: 1, limit: 100 })
        const apiRisks = apiResponse.data.map((risk: Risk) => ({
          id: risk.id,
          title: risk.title,
          category: risk.category,
          likelihood: risk.likelihood,
          impact: risk.impact,
          riskScore: risk.riskScore,
          riskLevel: risk.riskLevel,
          source: "api" as const,
          createdAt: risk.createdAt,
        }))
        risks.push(...apiRisks)
      } catch (error) {
        console.error("Error loading API risks:", error)
      }

      // Load from localStorage
      const localSnapshots = localStorageService.getAll()
      const localRisks = localSnapshots.map((snapshot: SavedRiskSnapshot) => ({
        id: snapshot.id,
        title: snapshot.risk.title,
        category: snapshot.risk.category,
        likelihood: snapshot.risk.likelihood,
        impact: snapshot.risk.impact,
        riskScore: snapshot.risk.riskScore,
        riskLevel: snapshot.risk.riskLevel,
        source: "local" as const,
        createdAt: snapshot.createdAt,
      }))
      risks.push(...localRisks)

      setMatrixRisks(risks)
    } catch (error) {
      toast({
        title: "Error cargando datos",
        description: "No se pudieron cargar todos los riesgos para la matriz",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-neon-green/20 border-neon-green text-neon-green"
      case "MEDIUM":
        return "bg-yellow-400/20 border-yellow-400 text-yellow-400"
      case "HIGH":
        return "bg-orange-400/20 border-orange-400 text-orange-400"
      case "CRITICAL":
        return "bg-neon-pink/20 border-neon-pink text-neon-pink"
      default:
        return "bg-muted border-border text-muted-foreground"
    }
  }

  const getCellColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact
    if (score >= 17) return "bg-neon-pink/10 border-neon-pink/30"
    if (score >= 10) return "bg-orange-400/10 border-orange-400/30"
    if (score >= 5) return "bg-yellow-400/10 border-yellow-400/30"
    return "bg-neon-green/10 border-neon-green/30"
  }

  const getRisksInCell = (likelihood: number, impact: number) => {
    return matrixRisks.filter((risk) => risk.likelihood === likelihood && risk.impact === impact)
  }

  const impactLabels = ["", "Muy Bajo", "Bajo", "Medio", "Alto", "Muy Alto"]
  const likelihoodLabels = ["", "Muy Baja", "Baja", "Media", "Alta", "Muy Alta"]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Matriz de Riesgo 5×5</h1>
          <p className="text-muted-foreground">Visualización interactiva de riesgos por probabilidad e impacto</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-neon-cyan" />
          <h2 className="text-lg font-semibold">Leyenda de Niveles de Riesgo</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-neon-green/20 border border-neon-green"></div>
            <span className="text-sm">Bajo (1-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400/20 border border-yellow-400"></div>
            <span className="text-sm">Medio (5-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-400/20 border border-orange-400"></div>
            <span className="text-sm">Alto (10-16)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-neon-pink/20 border border-neon-pink"></div>
            <span className="text-sm">Crítico (17-25)</span>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-neon-cyan" />
          <h2 className="text-lg font-semibold">Matriz Interactiva</h2>
          <span className="text-sm text-muted-foreground">({matrixRisks.length} riesgos total)</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Zap className="h-8 w-8 animate-pulse mx-auto mb-2 text-neon-cyan" />
              <p className="text-muted-foreground">Cargando matriz...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Matrix Grid */}
              <div className="grid grid-cols-6 gap-1">
                {/* Header Row */}
                <div className="p-4 text-center font-medium text-muted-foreground"></div>
                {[1, 2, 3, 4, 5].map((likelihood) => (
                  <div key={likelihood} className="p-4 text-center font-medium text-muted-foreground">
                    <div className="text-sm">{likelihoodLabels[likelihood]}</div>
                    <div className="text-xs opacity-70">({likelihood})</div>
                  </div>
                ))}

                {/* Matrix Rows */}
                {[5, 4, 3, 2, 1].map((impact) => (
                  <>
                    {/* Row Header */}
                    <div key={`header-${impact}`} className="p-4 text-center font-medium text-muted-foreground">
                      <div className="text-sm">{impactLabels[impact]}</div>
                      <div className="text-xs opacity-70">({impact})</div>
                    </div>

                    {/* Matrix Cells */}
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const cellRisks = getRisksInCell(likelihood, impact)
                      const score = likelihood * impact
                      return (
                        <div
                          key={`${likelihood}-${impact}`}
                          className={`
                            relative min-h-[120px] border-2 rounded-lg p-2 cursor-pointer transition-all
                            hover:scale-105 hover:shadow-lg
                            ${getCellColor(likelihood, impact)}
                          `}
                          onClick={() => cellRisks.length > 0 && setSelectedRisk(cellRisks[0])}
                        >
                          <div className="text-xs text-center mb-2 opacity-70">{score}</div>
                          <div className="space-y-1">
                            {cellRisks.slice(0, 3).map((risk, index) => (
                              <div
                                key={risk.id}
                                className={`
                                  text-xs p-1 rounded border truncate
                                  ${getRiskColor(risk.riskLevel)}
                                `}
                                title={risk.title}
                              >
                                {risk.title}
                              </div>
                            ))}
                            {cellRisks.length > 3 && (
                              <div className="text-xs text-center text-muted-foreground">
                                +{cellRisks.length - 3} más
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>

              {/* Axis Labels */}
              <div className="mt-6 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">Probabilidad →</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-muted-foreground">
                  ← Impacto
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Risk Details */}
      {selectedRisk && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-neon-cyan" />
              <h2 className="text-lg font-semibold">Detalles del Riesgo</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedRisk(null)}>
              ×
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-1">{selectedRisk.title}</h3>
                <p className="text-sm text-muted-foreground">{getRiskCategoryLabel(selectedRisk.category)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Probabilidad:</span>
                  <p className="font-medium">{selectedRisk.likelihood}/5</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Impacto:</span>
                  <p className="font-medium">{selectedRisk.impact}/5</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Puntuación:</span>
                  <p className="text-xl font-bold text-neon-cyan">{selectedRisk.riskScore}/25</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nivel:</span>
                  <p className={`font-bold ${getRiskColor(selectedRisk.riskLevel).split(" ")[2]}`}>
                    {selectedRisk.riskLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Origen: {selectedRisk.source === "api" ? "Servidor" : "Local"}</span>
                <span>•</span>
                <span>{formatDate(selectedRisk.createdAt)}</span>
              </div>

              {selectedRisk.source === "api" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/edit/${selectedRisk.id}`)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver/Editar Riesgo
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
