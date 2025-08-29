import { Routes, Route } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { Layout } from "@/components/layout/Layout"
import { Dashboard } from "@/pages/Dashboard"
import { NewRisk } from "@/pages/NewRisk"
import { EditRisk } from "@/pages/EditRisk"
import { RiskMatrix } from "@/pages/RiskMatrix"
import { SavedHistory } from "@/pages/SavedHistory"
import { Telemetry } from "@/pages/Telemetry"
import { AlienLore } from "@/pages/AlienLore"
import { About } from "@/pages/About"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewRisk />} />
          <Route path="/edit/:id" element={<EditRisk />} />
          <Route path="/matrix" element={<RiskMatrix />} />
          <Route path="/history" element={<SavedHistory />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/lore" element={<AlienLore />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
      <Toaster />
    </div>
  )
}

export default App
