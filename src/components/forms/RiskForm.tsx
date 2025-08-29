"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { riskFormSchema, type RiskFormData } from "@/lib/validations/risk"
import { RiskCategory } from "@/types/risk"
import { getRiskCategoryLabel, calculateRiskLevel } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Zap, AlertTriangle } from "lucide-react"

interface RiskFormProps {
  initialData?: Partial<RiskFormData>
  onSubmit: (data: RiskFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function RiskForm({ initialData, onSubmit, isLoading = false, submitLabel = "Guardar Riesgo" }: RiskFormProps) {
  const [riskScore, setRiskScore] = useState(0)
  const [riskLevel, setRiskLevel] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RiskFormData>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || RiskCategory.INVASION,
      likelihood: initialData?.likelihood || 1,
      impact: initialData?.impact || 1,
    },
  })

  const watchedLikelihood = watch("likelihood")
  const watchedImpact = watch("impact")

  // Calculate risk score and level when likelihood or impact changes
  useEffect(() => {
    const score = watchedLikelihood * watchedImpact
    const level = calculateRiskLevel(score)
    setRiskScore(score)
    setRiskLevel(level)
  }, [watchedLikelihood, watchedImpact])

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const categoryOptions = Object.values(RiskCategory).map((category) => ({
    value: category,
    label: getRiskCategoryLabel(category),
  }))

  const getRiskLevelDisplay = () => {
    const colors = {
      LOW: "text-neon-green",
      MEDIUM: "text-yellow-400",
      HIGH: "text-orange-400",
      CRITICAL: "text-neon-pink",
    }
    const labels = {
      LOW: "Bajo",
      MEDIUM: "Medio",
      HIGH: "Alto",
      CRITICAL: "Crítico",
    }
    return {
      color: colors[riskLevel as keyof typeof colors] || "text-foreground",
      label: labels[riskLevel as keyof typeof labels] || "Desconocido",
    }
  }

  const riskDisplay = getRiskLevelDisplay()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título del Riesgo *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ej: Nave nodriza detectada sobre la ciudad"
              className="mt-1"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe los detalles del riesgo alienígena..."
              className="mt-1 min-h-[100px]"
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select
              onValueChange={(value) => setValue("category", value as RiskCategory)}
              defaultValue={initialData?.category}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="likelihood">Probabilidad (1-5) *</Label>
              <Input
                id="likelihood"
                type="number"
                min="1"
                max="5"
                {...register("likelihood", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.likelihood && <p className="text-sm text-destructive mt-1">{errors.likelihood.message}</p>}
            </div>

            <div>
              <Label htmlFor="impact">Impacto (1-5) *</Label>
              <Input
                id="impact"
                type="number"
                min="1"
                max="5"
                {...register("impact", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.impact && <p className="text-sm text-destructive mt-1">{errors.impact.message}</p>}
            </div>
          </div>
        </div>

        {/* Right Column - Risk Calculator */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-neon-cyan" />
              <h3 className="text-lg font-semibold">Cálculo de Riesgo</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Probabilidad:</span>
                <span className="font-medium">{watchedLikelihood}/5</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Impacto:</span>
                <span className="font-medium">{watchedImpact}/5</span>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Puntuación:</span>
                  <span className="text-xl font-bold text-neon-cyan">{riskScore}/25</span>
                </div>

                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${riskDisplay.color}`} />
                  <span className="text-sm text-muted-foreground">Nivel:</span>
                  <span className={`font-bold ${riskDisplay.color}`}>{riskDisplay.label}</span>
                </div>
              </div>

              {riskLevel === "CRITICAL" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive font-medium">⚠️ Riesgo Crítico Detectado</p>
                  <p className="text-xs text-destructive/80 mt-1">Se requiere acción inmediata</p>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" variant="neon">
            {isLoading ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
