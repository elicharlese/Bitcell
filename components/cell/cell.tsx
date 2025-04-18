"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Text, Html } from "@react-three/drei"
import type { Group } from "three"
import { useMobile } from "@/hooks/use-mobile"
import { Eye, EyeOff } from "lucide-react"

import Nucleus from "./organelles/nucleus"
import Vacuole from "./organelles/vacuole"
import Mitochondria from "./organelles/mitochondria"
import LipidMembrane from "./organelles/lipid-membrane"

interface CellProps {
  setActiveOrganelle: (name: string | null) => void
  activeOrganelle: string | null
  botData: any
}

export default function Cell({ setActiveOrganelle, activeOrganelle, botData }: CellProps) {
  const groupRef = useRef<Group>(null)
  const isMobile = useMobile()
  const { camera } = useThree()
  const [xRayMode, setXRayMode] = useState(true) // Start with x-ray mode enabled

  // Set initial camera position to ensure all organelles are visible
  useEffect(() => {
    if (camera && camera.position) {
      // Position camera to see all organelles
      camera.position.set(0, 0, 12)
      camera.lookAt(0, 0, 0)
    }
  }, [camera])

  // Gentle rotation of the entire cell
  useFrame((state) => {
    if (groupRef.current && !activeOrganelle) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  // Toggle x-ray mode
  const toggleXRayMode = () => {
    setXRayMode(!xRayMode)
  }

  return (
    <>
      {/* X-Ray Mode Toggle Button - now with eye icon */}
      <Html position={[-5, 4, 0]}>
        <button
          onClick={toggleXRayMode}
          className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
          title={xRayMode ? "Show Membrane" : "Hide Membrane"}
        >
          {xRayMode ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </Html>

      <group ref={groupRef}>
        {/* Cell membrane (semi-transparent outer layer) - only show if not in x-ray mode or if active */}
        {(!xRayMode || activeOrganelle === "Lipid Membrane") && (
          <LipidMembrane
            isActive={activeOrganelle === "Lipid Membrane"}
            onClick={() => setActiveOrganelle("Lipid Membrane")}
            health={botData.health}
          />
        )}

        {/* Enhanced lighting for better visibility of organelles */}
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={10} color="#ffffff" />
        <pointLight position={[0, 3, 0]} intensity={1.0} distance={8} color="#4c9aff" />
        <pointLight position={[-3, -3, 0]} intensity={1.0} distance={8} color="#ff9f7e" />

        {/* Only render organelles if in X-ray mode or if the specific organelle is active */}
        {(xRayMode || activeOrganelle === "Nucleus") && (
          <Nucleus
            position={[0, 2, 0]}
            isActive={activeOrganelle === "Nucleus"}
            onClick={() => setActiveOrganelle("Nucleus")}
            health={botData.health}
          />
        )}

        {(xRayMode || activeOrganelle === "Vacuole") && (
          <Vacuole
            position={[3, 0, 0]}
            scale={1.2}
            isOval={true}
            isActive={activeOrganelle === "Vacuole"}
            onClick={() => setActiveOrganelle("Vacuole")}
            funds={botData.lockedFunds}
            profits={botData.availableProfits}
            health={botData.health}
          />
        )}

        {(xRayMode || activeOrganelle === "Mitochondria") && (
          <Mitochondria
            position={[-1.5, -1.5, 0]}
            scale={0.5}
            isActive={activeOrganelle === "Mitochondria"}
            onClick={() => setActiveOrganelle("Mitochondria")}
            activePositions={botData.activePositions}
            health={botData.health}
          />
        )}

        {/* Labels for each organelle - made more visible */}
        {!isMobile && (
          <>
            <Text
              position={[0, 4.5, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
              renderOrder={2}
              depthTest={false}
            >
              Nucleus
            </Text>

            <Text
              position={[3, -2.0, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
              renderOrder={1}
              depthTest={false}
            >
              Vacuole
            </Text>

            <Text
              position={[-1.5, -2.6, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
              renderOrder={1}
              depthTest={false}
            >
              Mitochondria
            </Text>

            {!xRayMode && (
              <Text
                position={[0, 6.0, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                renderOrder={1}
                depthTest={false}
              >
                Lipid Membrane
              </Text>
            )}
          </>
        )}
      </group>
    </>
  )
}

