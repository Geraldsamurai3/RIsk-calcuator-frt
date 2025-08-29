export function About() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Acerca del Sistema</h1>
        <p className="text-muted-foreground">Información sobre la Calculadora de Riesgo de Invasión Alienígena</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-neon-cyan">Sistema de Evaluación de Amenazas Extraterrestres</h2>
        <p className="text-muted-foreground">Versión 1.0.0 - Desarrollado para la defensa planetaria</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <h3 className="font-medium text-foreground mb-2">Tecnologías</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• React 18 + TypeScript</li>
              <li>• Vite + Tailwind CSS</li>
              <li>• NestJS Backend</li>
              <li>• Framer Motion</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Características</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Cálculo automático de riesgos</li>
              <li>• Persistencia local</li>
              <li>• Matriz interactiva 5×5</li>
              <li>• Tema sci-fi/neón</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
