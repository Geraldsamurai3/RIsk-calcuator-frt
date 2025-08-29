"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { RiskForm } from "@/components/forms/RiskForm"
import { riskApi } from "@/services/api"
import { localStorageService } from "@/services/localStorage"
import { useToast } from "@/hooks/use-toast"
import type { RiskFormData } from "@/lib/validations/risk"
import type { Risk } from "@/types/risk"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EditRisk() {
  const { id } = useParams<{ id: string }>()
  const [risk, setRisk] = useState<Risk | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRisk = async () => {
      if (!id) {
        navigate("/")
        return
      }

      try {
        const fetchedRisk = await riskApi.getById(id)
        setRisk(fetchedRisk)
      } catch (error) {
        console.error("Error fetching risk:", error)
        toast({
          title: "Error al cargar riesgo",
          description: "No se pudo cargar el riesgo solicitado",
          variant: "destructive",
        })
        navigate("/")
      } finally {
        setIsFetching(false)
      }
    }

    fetchRisk()
  }, [id, navigate, toast])

  const handleSubmit = async (data: RiskFormData) => {
    if (!id) return

    setIsLoading(true)
    try {
      const updatedRisk = await riskApi.update(id, data)

      localStorageService.saveFromForm(data, "backend", updatedRisk)

      toast({
        title: "Riesgo actualizado exitosamente",
        description: `${updatedRisk.title} ha sido actualizado y guardado en el historial local`,
      })

      navigate("/")
    } catch (error) {
      console.error("Error updating risk:", error)

      try {
        localStorageService.saveFromForm(data, "frontend")
        toast({
          title: "Cambios guardados localmente",
          description: "No se pudo conectar al servidor, pero los cambios se guardaron en el historial local",
        })
      } catch (localError) {
        toast({
          title: "Error al actualizar riesgo",
          description: "No se pudo actualizar el riesgo. Intenta nuevamente.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando riesgo...
        </div>
      </div>
    )
  }

  if (!risk) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Riesgo no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Editar Riesgo</h1>
          <p className="text-muted-foreground">Modificar: {risk.title}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <RiskForm
          initialData={{
            title: risk.title,
            description: risk.description,
            category: risk.category,
            likelihood: risk.likelihood,
            impact: risk.impact,
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Actualizar Riesgo"
        />
      </div>
    </div>
  )
}
