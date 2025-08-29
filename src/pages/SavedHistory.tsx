"use client"

import { useState, useEffect, useMemo } from "react"
import { localStorageService } from "@/services/localStorage"
import type { SavedRiskSnapshot } from "@/types/risk"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getRiskLevelColor, getRiskCategoryLabel } from "@/lib/utils"
import {
  Search,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  FileText,
  Calendar,
  Tag,
  AlertTriangle,
  CheckSquare,
  Square,
} from "lucide-react"

export function SavedHistory() {
  const [snapshots, setSnapshots] = useState<SavedRiskSnapshot[]>([])
  const [filteredSnapshots, setFilteredSnapshots] = useState<SavedRiskSnapshot[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSnapshots, setSelectedSnapshots] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    category: "all",
    level: "all",
    source: "all",
    dateFrom: "",
    dateTo: "",
  })
  const [editingSnapshot, setEditingSnapshot] = useState<SavedRiskSnapshot | null>(null)
  const [viewingSnapshot, setViewingSnapshot] = useState<SavedRiskSnapshot | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState("")
  const { toast } = useToast()

  // Load snapshots on mount
  useEffect(() => {
    loadSnapshots()
  }, [])

  // Apply search and filters
  useEffect(() => {
    let filtered = snapshots

    // Apply search
    if (searchQuery.trim()) {
      filtered = localStorageService.search(searchQuery.trim())
    }

    // Apply filters
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "all"))

    if (Object.keys(activeFilters).length > 0) {
      filtered = localStorageService.filter(activeFilters)
    }

    setFilteredSnapshots(filtered)
  }, [snapshots, searchQuery, filters])

  const loadSnapshots = () => {
    const data = localStorageService.getAll()
    setSnapshots(data)
    setSelectedSnapshots(new Set())
  }

  const handleDelete = async (id: string) => {
    if (localStorageService.delete(id)) {
      toast({ title: "Snapshot eliminado", description: "El registro ha sido eliminado del historial" })
      loadSnapshots()
    } else {
      toast({ title: "Error", description: "No se pudo eliminar el registro", variant: "destructive" })
    }
  }

  const handleDeleteSelected = async () => {
    const count = localStorageService.deleteMultiple(Array.from(selectedSnapshots))
    if (count > 0) {
      toast({ title: "Snapshots eliminados", description: `${count} registros eliminados del historial` })
      loadSnapshots()
    }
  }

  const handleEdit = (snapshot: SavedRiskSnapshot) => {
    setEditingSnapshot({ ...snapshot })
  }

  const handleSaveEdit = () => {
    if (!editingSnapshot) return

    const updated = localStorageService.update(editingSnapshot.id, editingSnapshot)
    if (updated) {
      toast({ title: "Snapshot actualizado", description: "Los cambios han sido guardados" })
      loadSnapshots()
      setEditingSnapshot(null)
    } else {
      toast({ title: "Error", description: "No se pudo actualizar el registro", variant: "destructive" })
    }
  }

  const handleExport = () => {
    try {
      const exportData = localStorageService.export()
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `alien-risk-history-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({ title: "Exportación exitosa", description: "El historial ha sido descargado" })
    } catch (error) {
      toast({ title: "Error de exportación", description: "No se pudo exportar el historial", variant: "destructive" })
    }
  }

  const handleImport = () => {
    try {
      const result = localStorageService.import(importData)
      if (result.success) {
        toast({
          title: "Importación exitosa",
          description: `${result.imported} registros importados. ${result.errors.length} errores.`,
        })
        loadSnapshots()
        setShowImportDialog(false)
        setImportData("")
      } else {
        toast({
          title: "Error de importación",
          description: result.errors.join(", "),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({ title: "Error de importación", description: "Formato de archivo inválido", variant: "destructive" })
    }
  }

  const toggleSelectSnapshot = (id: string) => {
    const newSelected = new Set(selectedSnapshots)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedSnapshots(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedSnapshots.size === filteredSnapshots.length) {
      setSelectedSnapshots(new Set())
    } else {
      setSelectedSnapshots(new Set(filteredSnapshots.map((s) => s.id)))
    }
  }

  const stats = useMemo(() => localStorageService.getStats(), [snapshots])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Historial Guardado</h1>
        <p className="text-muted-foreground">Gestión de cálculos de riesgo guardados localmente</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neon-cyan" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold text-neon-cyan">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-neon-pink" />
            <span className="text-sm text-muted-foreground">Críticos</span>
          </div>
          <p className="text-2xl font-bold text-neon-pink">{stats.byLevel.CRITICAL}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-neon-green" />
            <span className="text-sm text-muted-foreground">Promedio</span>
          </div>
          <p className="text-2xl font-bold text-neon-green">{stats.averageRiskScore}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neon-purple" />
            <span className="text-sm text-muted-foreground">Frontend</span>
          </div>
          <p className="text-2xl font-bold text-neon-purple">{stats.bySource.frontend}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar en título, descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Categoría</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters((f) => ({ ...f, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="INVASION">Invasión</SelectItem>
                <SelectItem value="ABDUCTION">Abducción</SelectItem>
                <SelectItem value="VIRUS_XENO">Virus Xenomorfo</SelectItem>
                <SelectItem value="UFO_CRASH">Accidente OVNI</SelectItem>
                <SelectItem value="MIND_CONTROL">Control Mental</SelectItem>
                <SelectItem value="QUANTUM_ANOMALY">Anomalía Cuántica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nivel</Label>
            <Select value={filters.level} onValueChange={(value) => setFilters((f) => ({ ...f, level: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="LOW">Bajo</SelectItem>
                <SelectItem value="MEDIUM">Medio</SelectItem>
                <SelectItem value="HIGH">Alto</SelectItem>
                <SelectItem value="CRITICAL">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Origen</Label>
            <Select value={filters.source} onValueChange={(value) => setFilters((f) => ({ ...f, source: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar Historial</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-data">Datos JSON</Label>
                    <Textarea
                      id="import-data"
                      placeholder="Pega aquí el contenido del archivo JSON..."
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImport} disabled={!importData.trim()}>
                    Importar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSnapshots.size > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{selectedSnapshots.size} elemento(s) seleccionado(s)</span>
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Seleccionados
            </Button>
          </div>
        </div>
      )}

      {/* Snapshots List */}
      <div className="bg-card border border-border rounded-lg">
        {filteredSnapshots.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {snapshots.length === 0 ? "No hay registros guardados aún" : "No se encontraron registros"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Header */}
            <div className="p-4 bg-muted/50">
              <div className="flex items-center gap-4">
                <button onClick={toggleSelectAll} className="flex items-center">
                  {selectedSnapshots.size === filteredSnapshots.length ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Título</div>
                  <div className="col-span-2">Categoría</div>
                  <div className="col-span-1">Nivel</div>
                  <div className="col-span-1">Score</div>
                  <div className="col-span-2">Fecha</div>
                  <div className="col-span-1">Origen</div>
                  <div className="col-span-1">Acciones</div>
                </div>
              </div>
            </div>

            {/* Rows */}
            {filteredSnapshots.map((snapshot) => (
              <div key={snapshot.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleSelectSnapshot(snapshot.id)} className="flex items-center">
                    {selectedSnapshots.has(snapshot.id) ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 grid grid-cols-12 gap-4 text-sm">
                    <div className="col-span-4">
                      <div className="font-medium text-foreground">{snapshot.risk.title}</div>
                      {snapshot.risk.description && (
                        <div className="text-muted-foreground text-xs mt-1 truncate">{snapshot.risk.description}</div>
                      )}
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {getRiskCategoryLabel(snapshot.risk.category)}
                    </div>
                    <div className="col-span-1">
                      <span className={`font-medium ${getRiskLevelColor(snapshot.risk.riskLevel)}`}>
                        {snapshot.risk.riskLevel}
                      </span>
                    </div>
                    <div className="col-span-1 font-mono text-neon-cyan">{snapshot.risk.riskScore}/25</div>
                    <div className="col-span-2 text-muted-foreground text-xs">{formatDate(snapshot.createdAt)}</div>
                    <div className="col-span-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          snapshot.source === "backend"
                            ? "bg-neon-green/20 text-neon-green"
                            : "bg-neon-purple/20 text-neon-purple"
                        }`}
                      >
                        {snapshot.source}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingSnapshot(snapshot)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(snapshot)} className="h-8 w-8 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(snapshot.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingSnapshot} onOpenChange={() => setViewingSnapshot(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Snapshot</DialogTitle>
          </DialogHeader>
          {viewingSnapshot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Título</Label>
                  <p className="text-sm">{viewingSnapshot.risk.title}</p>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <p className="text-sm">{getRiskCategoryLabel(viewingSnapshot.risk.category)}</p>
                </div>
                <div>
                  <Label>Probabilidad</Label>
                  <p className="text-sm">{viewingSnapshot.risk.likelihood}/5</p>
                </div>
                <div>
                  <Label>Impacto</Label>
                  <p className="text-sm">{viewingSnapshot.risk.impact}/5</p>
                </div>
                <div>
                  <Label>Puntuación</Label>
                  <p className="text-sm font-mono text-neon-cyan">{viewingSnapshot.risk.riskScore}/25</p>
                </div>
                <div>
                  <Label>Nivel</Label>
                  <p className={`text-sm font-medium ${getRiskLevelColor(viewingSnapshot.risk.riskLevel)}`}>
                    {viewingSnapshot.risk.riskLevel}
                  </p>
                </div>
              </div>
              {viewingSnapshot.risk.description && (
                <div>
                  <Label>Descripción</Label>
                  <p className="text-sm text-muted-foreground">{viewingSnapshot.risk.description}</p>
                </div>
              )}
              {viewingSnapshot.note && (
                <div>
                  <Label>Nota</Label>
                  <p className="text-sm text-muted-foreground">{viewingSnapshot.note}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>Creado: {formatDate(viewingSnapshot.createdAt)}</div>
                <div>Actualizado: {formatDate(viewingSnapshot.updatedAt)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSnapshot} onOpenChange={() => setEditingSnapshot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Snapshot</DialogTitle>
          </DialogHeader>
          {editingSnapshot && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-note">Nota</Label>
                <Textarea
                  id="edit-note"
                  value={editingSnapshot.note || ""}
                  onChange={(e) => setEditingSnapshot({ ...editingSnapshot, note: e.target.value })}
                  placeholder="Añade una nota personal..."
                />
              </div>
              <div>
                <Label htmlFor="edit-tags">Etiquetas (separadas por comas)</Label>
                <Input
                  id="edit-tags"
                  value={editingSnapshot.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingSnapshot({
                      ...editingSnapshot,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="etiqueta1, etiqueta2, etiqueta3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSnapshot(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
