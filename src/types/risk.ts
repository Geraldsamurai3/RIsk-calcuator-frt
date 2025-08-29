// src/types/risk.ts

export enum RiskCategory {
  INVASION = "INVASION",
  ABDUCTION = "ABDUCTION",
  VIRUS_XENO = "VIRUS_XENO",
  UFO_CRASH = "UFO_CRASH",
  MIND_CONTROL = "MIND_CONTROL",
  QUANTUM_ANOMALY = "QUANTUM_ANOMALY",
}

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface Risk {
  id: string
  title: string
  description?: string
  category: RiskCategory
  likelihood: number
  impact: number
  riskScore: number
  riskLevel: RiskLevel
  createdAt: string
  updatedAt: string
}

export interface CreateRiskDto {
  title: string
  description?: string
  category: RiskCategory
  likelihood: number
  impact: number
}

// ✅ Agregamos el tipo que te falta (usado por los formularios)
export type RiskFormData = CreateRiskDto & {
  tags?: string[]
  note?: string
}

export interface UpdateRiskDto extends Partial<CreateRiskDto> {}

export interface RiskQueryParams {
  page?: number
  limit?: number
  search?: string
  category?: RiskCategory
  level?: RiskLevel
}

export interface PaginatedRiskResponse {
  data: Risk[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface RiskStats {
  total: number
  byLevel: Record<RiskLevel, number>
  byCategory: Record<RiskCategory, number>
  averageRiskScore: number
}

// localStorage types
export interface SavedRiskSnapshot {
  id: string
  version: 1
  risk: {
    id?: string
    title: string
    description?: string
    category: RiskCategory
    likelihood: number
    impact: number
    riskScore: number
    riskLevel: RiskLevel
  }
  tags?: string[]
  note?: string
  createdAt: string
  updatedAt: string
  source: "frontend" | "backend"
}
