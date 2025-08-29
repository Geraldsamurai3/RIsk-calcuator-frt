import { v4 as uuidv4 } from "uuid"
import type { SavedRiskSnapshot, RiskFormData, Risk } from "@/types/risk"
import { calculateRiskLevel } from "@/lib/utils"

const STORAGE_KEY = "alien-risk:v1:calculations"
const STORAGE_VERSION = 1

export class LocalStorageService {
  private static instance: LocalStorageService

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService()
    }
    return LocalStorageService.instance
  }

  private constructor() {}

  // Get all saved snapshots
  getAll(): SavedRiskSnapshot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []

      const snapshots = JSON.parse(data) as SavedRiskSnapshot[]
      return snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return []
    }
  }

  // Get snapshot by ID
  getById(id: string): SavedRiskSnapshot | null {
    const snapshots = this.getAll()
    return snapshots.find((snapshot) => snapshot.id === id) || null
  }

  // Save a new snapshot from form data
  saveFromForm(
    formData: RiskFormData,
    source: "frontend" | "backend" = "frontend",
    backendRisk?: Risk,
  ): SavedRiskSnapshot {
    const riskScore = formData.likelihood * formData.impact
    const riskLevel = calculateRiskLevel(riskScore)

    const snapshot: SavedRiskSnapshot = {
      id: uuidv4(),
      version: STORAGE_VERSION,
      risk: {
        id: backendRisk?.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        likelihood: formData.likelihood,
        impact: formData.impact,
        riskScore,
        riskLevel: riskLevel as any,
      },
      tags: [],
      note: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source,
    }

    this.save(snapshot)
    return snapshot
  }

  // Save a snapshot
  save(snapshot: SavedRiskSnapshot): void {
    try {
      const snapshots = this.getAll()
      const existingIndex = snapshots.findIndex((s) => s.id === snapshot.id)

      if (existingIndex >= 0) {
        snapshots[existingIndex] = { ...snapshot, updatedAt: new Date().toISOString() }
      } else {
        snapshots.unshift(snapshot)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      throw new Error("No se pudo guardar en el historial local")
    }
  }

  // Update snapshot
  update(id: string, updates: Partial<SavedRiskSnapshot>): SavedRiskSnapshot | null {
    try {
      const snapshots = this.getAll()
      const index = snapshots.findIndex((s) => s.id === id)

      if (index === -1) return null

      const updated = {
        ...snapshots[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      snapshots[index] = updated
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots))
      return updated
    } catch (error) {
      console.error("Error updating localStorage:", error)
      return null
    }
  }

  // Delete snapshot
  delete(id: string): boolean {
    try {
      const snapshots = this.getAll()
      const filtered = snapshots.filter((s) => s.id !== id)

      if (filtered.length === snapshots.length) return false

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error("Error deleting from localStorage:", error)
      return false
    }
  }

  // Delete multiple snapshots
  deleteMultiple(ids: string[]): number {
    try {
      const snapshots = this.getAll()
      const filtered = snapshots.filter((s) => !ids.includes(s.id))
      const deletedCount = snapshots.length - filtered.length

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return deletedCount
    } catch (error) {
      console.error("Error deleting multiple from localStorage:", error)
      return 0
    }
  }

  // Clear all snapshots
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }

  // Export snapshots as JSON
  export(): string {
    const snapshots = this.getAll()
    return JSON.stringify(
      {
        version: STORAGE_VERSION,
        exportDate: new Date().toISOString(),
        count: snapshots.length,
        data: snapshots,
      },
      null,
      2,
    )
  }

  // Import snapshots from JSON
  import(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const importData = JSON.parse(jsonData)
      const errors: string[] = []
      let imported = 0

      if (!importData.data || !Array.isArray(importData.data)) {
        return { success: false, imported: 0, errors: ["Formato de archivo inválido"] }
      }

      const existingSnapshots = this.getAll()
      const existingIds = new Set(existingSnapshots.map((s) => s.id))

      for (const snapshot of importData.data) {
        try {
          // Validate snapshot structure
          if (!snapshot.id || !snapshot.risk || !snapshot.version) {
            errors.push(`Snapshot inválido: ${snapshot.id || "ID desconocido"}`)
            continue
          }

          // Skip duplicates
          if (existingIds.has(snapshot.id)) {
            errors.push(`Snapshot duplicado omitido: ${snapshot.risk?.title || snapshot.id}`)
            continue
          }

          // Add to existing snapshots
          existingSnapshots.push(snapshot)
          imported++
        } catch (error) {
          errors.push(`Error procesando snapshot: ${error}`)
        }
      }

      if (imported > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSnapshots))
      }

      return { success: imported > 0, imported, errors }
    } catch (error) {
      return { success: false, imported: 0, errors: [`Error de formato: ${error}`] }
    }
  }

  // Search snapshots
  search(query: string): SavedRiskSnapshot[] {
    const snapshots = this.getAll()
    const searchTerm = query.toLowerCase()

    return snapshots.filter(
      (snapshot) =>
        snapshot.risk.title.toLowerCase().includes(searchTerm) ||
        snapshot.risk.description?.toLowerCase().includes(searchTerm) ||
        snapshot.note?.toLowerCase().includes(searchTerm) ||
        snapshot.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)),
    )
  }

  // Filter snapshots
  filter(filters: {
    category?: string
    level?: string
    source?: string
    dateFrom?: string
    dateTo?: string
  }): SavedRiskSnapshot[] {
    let snapshots = this.getAll()

    if (filters.category) {
      snapshots = snapshots.filter((s) => s.risk.category === filters.category)
    }

    if (filters.level) {
      snapshots = snapshots.filter((s) => s.risk.riskLevel === filters.level)
    }

    if (filters.source) {
      snapshots = snapshots.filter((s) => s.source === filters.source)
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      snapshots = snapshots.filter((s) => new Date(s.createdAt) >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      snapshots = snapshots.filter((s) => new Date(s.createdAt) <= toDate)
    }

    return snapshots
  }

  // Get statistics
  getStats() {
    const snapshots = this.getAll()

    const stats = {
      total: snapshots.length,
      byLevel: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      byCategory: {
        INVASION: 0,
        ABDUCTION: 0,
        VIRUS_XENO: 0,
        UFO_CRASH: 0,
        MIND_CONTROL: 0,
        QUANTUM_ANOMALY: 0,
      },
      bySource: { frontend: 0, backend: 0 },
      averageRiskScore: 0,
    }

    if (snapshots.length > 0) {
      let totalScore = 0

      snapshots.forEach((snapshot) => {
        stats.byLevel[snapshot.risk.riskLevel as keyof typeof stats.byLevel]++
        stats.byCategory[snapshot.risk.category as keyof typeof stats.byCategory]++
        stats.bySource[snapshot.source]++
        totalScore += snapshot.risk.riskScore
      })

      stats.averageRiskScore = Math.round((totalScore / snapshots.length) * 100) / 100
    }

    return stats
  }
}

export const localStorageService = LocalStorageService.getInstance()
