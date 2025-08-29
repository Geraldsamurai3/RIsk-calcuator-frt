import { z } from "zod"
import { RiskCategory } from "@/types/risk"

export const riskFormSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título no puede exceder 200 caracteres"),
  description: z.string().max(1000, "La descripción no puede exceder 1000 caracteres").optional(),
  category: z.nativeEnum(RiskCategory, {
    required_error: "La categoría es requerida",
  }),
  likelihood: z.number().min(1, "La probabilidad debe ser entre 1 y 5").max(5, "La probabilidad debe ser entre 1 y 5"),
  impact: z.number().min(1, "El impacto debe ser entre 1 y 5").max(5, "El impacto debe ser entre 1 y 5"),
})

export type RiskFormData = z.infer<typeof riskFormSchema>
