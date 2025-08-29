"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { RiskForm } from "@/components/forms/RiskForm"
import { riskApi } from "@/services/api"
import { localStorageService } from "@/services/localStorage"
import { useToast } from "@/hooks/use-toast"
import type { RiskFormData } from "@/lib/validations/risk"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewRisk() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (data: RiskFormData) => {
    setIsLoading(true)
    try {
      const newRisk = await riskApi.create(data)

      localStorageService.saveFromForm(data, "backend", newRisk)

      toast({
        title: "Riesgo creado exitosamente",
        description: `${newRisk.title} ha sido registrado en el sistema y guardado en el historial local`,
      })

      navigate("/")
    } catch (error) {
      console.error("Error creating risk:", error)

      try {
        localStorageService.saveFromForm(data, "frontend")
        toast({
          title: "Riesgo guardado localmente",
          description: "No se pudo conectar al servidor, pero el riesgo se guardó en el historial local",
        })
      } catch (localError) {
        toast({
          title: "Error al crear riesgo",
          description: "No se pudo guardar el riesgo. Intenta nuevamente.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Nuevo Riesgo</h1>
          <p className="text-muted-foreground">Registrar una nueva amenaza alienígena</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <RiskForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Crear Riesgo" />
      </div>
    </div>
  )
}
