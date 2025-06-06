"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import type { Mesh, MeshStandardMaterial } from "three"

interface LipidMembraneProps {
  isActive: boolean
  onClick: () => void
  health: number
}

export default function LipidMembrane({ isActive, onClick, health }: LipidMembraneProps) {
  const membraneRef = useRef<Mesh>(null)
  const outerMaterialRef = useRef<MeshStandardMaterial>(null)
  const innerMaterialRef = useRef<MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  // Lipid membranes are typically yellowish/amber in real cells
  const getHealthColor = () => {
    // Base amber color for the membrane
    const baseColor = "#F6E05E" // Amber/yellow for lipids

    // Adjust opacity based on health
    if (health > 80) return isActive ? baseColor : "#ECC94B"
    if (health > 50) return isActive ? "#F6AD55" : "#ED8936" // More orange when health is lower
    return isActive ? "#FC8181" : "#F56565" // Red when health is critical
  }

  useFrame((state) => {
    if (membraneRef.current) {
      // Gentle pulsing effect
      const pulse = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.03
      membraneRef.current.scale.x = 1 + pulse
      membraneRef.current.scale.y = 1 + pulse
      membraneRef.current.scale.z = 1 + pulse
    }

    if (outerMaterialRef.current) {
      // Update fresnel effect parameters
      if (hovered || isActive) {
        outerMaterialRef.current.opacity = 0.9 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
        outerMaterialRef.current.transmission = 0.1 // Much less transparent when active or hovered
      } else {
        // Make it completely opaque when not in X-ray mode
        outerMaterialRef.current.opacity = 0.85
        outerMaterialRef.current.transmission = 0.15 // Much less transparent
      }
    }

    if (innerMaterialRef.current) {
      // Make inner membrane more opaque too
      innerMaterialRef.current.opacity = 0.7
    }
  })

  return (
    <group>
      {/* Outer lipid layer - now much more opaque */}
      <Sphere
        ref={membraneRef}
        args={[5, 64, 64]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhysicalMaterial
          ref={outerMaterialRef}
          color={getHealthColor()}
          emissive={getHealthColor()}
          emissiveIntensity={0.05}
          transparent
          opacity={0.85} // Much higher opacity
          roughness={0.3}
          metalness={0.2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          ior={1.5}
          transmission={0.15} // Much lower transmission to hide interior
          wireframe={isActive ? true : false}
        />
      </Sphere>

      {/* Wireframe overlay to help define the membrane shape */}
      <Sphere args={[5, 32, 32]}>
        <meshBasicMaterial
          color={getHealthColor()}
          wireframe={true}
          transparent
          opacity={0.1} // Increased from 0.02
        />
      </Sphere>

      {/* Inner lipid layer - now more opaque */}
      <Sphere args={[4.85, 64, 64]}>
        <meshPhysicalMaterial
          ref={innerMaterialRef}
          color={getHealthColor()}
          transparent
          opacity={0.7} // Much higher opacity
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.5}
          side={1} // BackSide
        />
      </Sphere>

      {/* Lipid bilayer representation - only show when active */}
      {isActive &&
        [...Array(80)].map((_, i) => {
          // Distribute points evenly on a sphere
          const phi = Math.acos(-1 + (2 * i) / 80)
          const theta = Math.sqrt(80 * Math.PI) * phi

          const x = 5 * Math.cos(theta) * Math.sin(phi)
          const y = 5 * Math.sin(theta) * Math.sin(phi)
          const z = 5 * Math.cos(phi)

          // Calculate normal vector for orientation
          const nx = x / 5
          const ny = y / 5
          const nz = z / 5

          return (
            <group key={i} position={[x, y, z]} rotation={[0, 0, Math.random() * Math.PI * 2]}>
              {/* Phospholipid head */}
              <Sphere args={[0.12, 8, 8]}>
                <meshStandardMaterial
                  color={getHealthColor()}
                  emissive={getHealthColor()}
                  emissiveIntensity={0.2}
                  roughness={0.3}
                />
              </Sphere>

              {/* Phospholipid tail - pointing inward */}
              <mesh
                position={[-nx * 0.15, -ny * 0.15, -nz * 0.15]}
                scale={[0.03, 0.03, 0.3]}
                rotation={[Math.atan2(Math.sqrt(nx * nx + nz * nz), ny), Math.atan2(nz, nx), 0]}
              >
                <cylinderGeometry args={[1, 0.5, 1, 8]} />
                <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} roughness={0.4} />
              </mesh>
            </group>
          )
        })}
    </group>
  )
}
