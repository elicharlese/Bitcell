"use client"

import { Button } from "@/components/ui/button"
import { Activity, Database, Battery, Shield, X } from "lucide-react"

interface CellControlsProps {
  setActiveOrganelle: (name: string | null) => void
  activeOrganelle: string | null
}

export default function CellControls({ setActiveOrganelle, activeOrganelle }: CellControlsProps) {
  return (
    <div className="flex flex-row gap-2">
      {activeOrganelle ? (
        <Button variant="secondary" size="icon" onClick={() => setActiveOrganelle(null)}>
          <X className="h-4 w-4" />
        </Button>
      ) : (
        <>
          <Button variant="secondary" size="icon" onClick={() => setActiveOrganelle("Nucleus")} title="Nucleus">
            <Activity className="h-4 w-4" />
          </Button>

          <Button variant="secondary" size="icon" onClick={() => setActiveOrganelle("Vacuole")} title="Vacuole">
            <Database className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setActiveOrganelle("Mitochondria")}
            title="Mitochondria"
          >
            <Battery className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setActiveOrganelle("Lipid Membrane")}
            title="Lipid Membrane"
          >
            <Shield className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}

