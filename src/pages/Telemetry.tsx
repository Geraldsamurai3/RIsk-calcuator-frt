"use client"

import { useState, useEffect } from "react"
import { Activity, Zap, Radio, Wifi, Database, Clock } from "lucide-react"

export function Telemetry() {
  const [telemetryData, setTelemetryData] = useState({
    systemStatus: "ACTIVE",
    signalStrength: 87,
    dataTransmission: 1.2,
    lastUpdate: new Date(),
    alienActivity: 23,
    quantumFlux: 0.45,
    dimensionalStability: 98.7,
    threatLevel: "MODERATE",
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData((prev) => ({
        ...prev,
        signalStrength: Math.max(60, Math.min(100, prev.signalStrength + (Math.random() - 0.5) * 10)),
        dataTransmission: Math.max(0.1, Math.min(5.0, prev.dataTransmission + (Math.random() - 0.5) * 0.5)),
        lastUpdate: new Date(),
        alienActivity: Math.max(0, Math.min(100, prev.alienActivity + (Math.random() - 0.5) * 5)),
        quantumFlux: Math.max(0, Math.min(1, prev.quantumFlux + (Math.random() - 0.5) * 0.1)),
        dimensionalStability: Math.max(90, Math.min(100, prev.dimensionalStability + (Math.random() - 0.5) * 2)),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-neon-green"
      case "WARNING":
        return "text-yellow-400"
      case "CRITICAL":
        return "text-neon-pink"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Telemetría</h1>
        <p className="text-muted-foreground">Lecturas de sensores y monitoreo en tiempo real</p>
      </div>

      {/* System Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-neon-cyan animate-pulse" />
            <h2 className="text-lg font-semibold">Estado del Sistema</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
            <span className={`font-medium ${getStatusColor(telemetryData.systemStatus)}`}>
              {telemetryData.systemStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Wifi className="h-8 w-8 mx-auto mb-2 text-neon-cyan" />
            <div className="text-2xl font-bold text-neon-cyan">{telemetryData.signalStrength}%</div>
            <div className="text-sm text-muted-foreground">Fuerza de Señal</div>
          </div>
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-neon-green" />
            <div className="text-2xl font-bold text-neon-green">{telemetryData.dataTransmission.toFixed(1)} GB/s</div>
            <div className="text-sm text-muted-foreground">Transmisión de Datos</div>
          </div>
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-neon-purple" />
            <div className="text-2xl font-bold text-neon-purple">{telemetryData.lastUpdate.toLocaleTimeString()}</div>
            <div className="text-sm text-muted-foreground">Última Actualización</div>
          </div>
        </div>
      </div>

      {/* Sensor Readings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="h-5 w-5 text-neon-pink" />
            <h3 className="font-semibold">Actividad Alienígena</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nivel detectado:</span>
              <span className="font-medium">{telemetryData.alienActivity}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-neon-pink h-2 rounded-full transition-all duration-500"
                style={{ width: `${telemetryData.alienActivity}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">Sensores electromagnéticos activos</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-neon-cyan" />
            <h3 className="font-semibold">Flujo Cuántico</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Intensidad:</span>
              <span className="font-medium">{telemetryData.quantumFlux.toFixed(3)} QU</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-neon-cyan h-2 rounded-full transition-all duration-500"
                style={{ width: `${telemetryData.quantumFlux * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">Detectores de partículas subatómicas</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-neon-green" />
            <h3 className="font-semibold">Estabilidad Dimensional</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Coherencia:</span>
              <span className="font-medium">{telemetryData.dimensionalStability.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-neon-green h-2 rounded-full transition-all duration-500"
                style={{ width: `${telemetryData.dimensionalStability}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">Matriz espacio-temporal estable</div>
          </div>
        </div>
      </div>

      {/* Alert System */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="h-5 w-5 text-neon-cyan animate-pulse" />
          <h2 className="text-lg font-semibold">Sistema de Alertas</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-neon-green">Sistema Operativo</div>
              <div className="text-xs text-muted-foreground">Todos los sensores funcionando correctamente</div>
            </div>
            <div className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-400">Fluctuación Cuántica Detectada</div>
              <div className="text-xs text-muted-foreground">Variación menor en el sector 7-Alpha</div>
            </div>
            <div className="text-xs text-muted-foreground">{new Date(Date.now() - 300000).toLocaleTimeString()}</div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-muted-foreground">Calibración Completada</div>
              <div className="text-xs text-muted-foreground">Sensores recalibrados exitosamente</div>
            </div>
            <div className="text-xs text-muted-foreground">{new Date(Date.now() - 1800000).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
