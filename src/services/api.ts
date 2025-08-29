import axios from "axios"
import type {
  Risk,
  CreateRiskDto,
  UpdateRiskDto,
  RiskQueryParams,
  PaginatedRiskResponse,
  RiskStats,
} from "@/types/risk"

const API_BASE_URL = import.meta.env.VITE_API_URL 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error("[API] Request error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} from ${response.config.url}`)
    return response
  },
  (error) => {
    console.error("[API] Response error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export const riskApi = {
  // Get all risks with pagination and filtering
  getAll: async (params?: RiskQueryParams): Promise<PaginatedRiskResponse> => {
    const response = await api.get("/risks", { params })
    return response.data
  },

  // Get risk by ID
  getById: async (id: string): Promise<Risk> => {
    const response = await api.get(`/risks/${id}`)
    return response.data
  },

  // Create new risk
  create: async (data: CreateRiskDto): Promise<Risk> => {
    const response = await api.post("/risks", data)
    return response.data
  },

  // Update risk
  update: async (id: string, data: UpdateRiskDto): Promise<Risk> => {
    const response = await api.patch(`/risks/${id}`, data)
    return response.data
  },

  // Delete risk
  delete: async (id: string): Promise<void> => {
    await api.delete(`/risks/${id}`)
  },

  // Get risk statistics
  getStats: async (): Promise<RiskStats> => {
    const response = await api.get("/risks/stats")
    return response.data
  },
}

export const healthApi = {
  check: async () => {
    const response = await api.get("/health")
    return response.data
  },
}

export default api
