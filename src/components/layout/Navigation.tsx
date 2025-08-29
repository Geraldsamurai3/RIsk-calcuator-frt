import { NavLink } from "react-router-dom"
import { Plus, Grid3X3, History, Radio, BookOpen, Info, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/new", icon: Plus, label: "Nuevo Riesgo" },
  { to: "/matrix", icon: Grid3X3, label: "Matriz de Riesgo" },
  { to: "/history", icon: History, label: "Historial" },
  { to: "/telemetry", icon: Radio, label: "Telemetría" },
  { to: "/lore", icon: BookOpen, label: "Glosario Alien" },
  { to: "/about", icon: Info, label: "Acerca de" },
]

export function Navigation() {
  return (
    <nav className="w-64 border-r border-border bg-card/30 backdrop-blur-sm min-h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground neon-glow-cyan"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
