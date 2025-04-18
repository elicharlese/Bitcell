"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Html } from "@react-three/drei"
import type { Mesh, MeshStandardMaterial, Group } from "three"

interface VacuoleProps {
  position: [number, number, number]
  scale?: number
  isOval?: boolean
  isActive: boolean
  onClick: () => void
  funds: number
  profits: number
  health: number
}

export default function Vacuole({
  position,
  scale = 1,
  isOval = false,
  isActive,
  onClick,
  funds,
  profits,
  health,
}: VacuoleProps) {
  const vacuoleRef = useRef<Group>(null)
  const outerRef = useRef<Mesh>(null)
  const fluidRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  // Update the color logic to use the health prop
  // Vacuole is typically clear/blue in real cells
  const getHealthColor = () => {
    if (health > 70) return isActive ? "#90CDF4" : "#63B3ED" // Healthy
    if (health > 40) return isActive ? "#F6AD55" : "#ED8936" // Warning
    return isActive ? "#FC8181" : "#F56565" // Unhealthy/Critical
  }

  const vacuoleColor = getHealthColor()
  const fluidColor = health > 50 ? "#34D399" : "#F56565" // Green when healthy, red when unhealthy

  // Update the useFrame function to maintain consistent size but change color and pulsing based on health
  useFrame((state) => {
    if (vacuoleRef.current) {
      // Gentle floating motion - keep this
      vacuoleRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime()) * 0.1
    }

    // Remove the size-changing pulse effect for the outer vacuole
    if (outerRef.current) {
      // Keep size consistent regardless of active state but make it larger
      outerRef.current.scale.set(isOval ? scale * 1.8 : scale * 1.2, scale * 1.2, scale * 1.2)
    }

    if (fluidRef.current && fluidRef.current.position) {
      // More dynamic fluid movement - keep this
      const time = state.clock.getElapsedTime()
      fluidRef.current.position.y = -0.5 + Math.sin(time * 0.5) * 0.05

      // Enhanced "sloshing" effect - keep this
      fluidRef.current.rotation.x = Math.sin(time * 0.3) * 0.08
      fluidRef.current.rotation.z = Math.cos(time * 0.4) * 0.08

      // Remove the scale pulsing for fluid but make it larger
      fluidRef.current.scale.x = isOval ? 1.8 : 1.2
      fluidRef.current.scale.z = 1.2
    }

    if (materialRef.current) {
      const isHealthy = health > 70

      // Pulsing effect based on health - faster and more intense when unhealthy
      const pulseRate = isHealthy ? 1 : 3
      const pulseIntensity = isHealthy ? 0.1 : 0.3

      if (hovered || isActive) {
        materialRef.current.emissiveIntensity =
          1.0 + Math.sin(state.clock.getElapsedTime() * pulseRate * 3) * pulseIntensity
      } else {
        materialRef.current.emissiveIntensity =
          0.8 + Math.sin(state.clock.getElapsedTime() * pulseRate) * pulseIntensity
      }
    }
  })

  // Calculate fill level based on funds and profits
  const fillLevel = Math.min(0.9, Math.max(0.2, (funds + profits) / 10000))

  return (
    <group
      ref={vacuoleRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Outer vacuole membrane with more texture - made larger */}
      <Sphere ref={outerRef} args={[1, 32, 32]} scale={[isOval ? scale * 1.8 : scale * 1.2, scale * 1.2, scale * 1.2]}>
        <meshStandardMaterial
          ref={materialRef}
          color={vacuoleColor}
          emissive={vacuoleColor}
          emissiveIntensity={0.8} // Increased emissive intensity
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.7}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
        />
      </Sphere>

      {/* Add outline to make vacuole more visible */}
      <Sphere args={[1.05, 32, 32]} scale={[isOval ? scale * 1.8 : scale * 1.2, scale * 1.2, scale * 1.2]}>
        <meshBasicMaterial color={vacuoleColor} wireframe={true} transparent opacity={0.3} />
      </Sphere>

      {/* Inner fluid representing funds with more realistic fluid appearance */}
      <Sphere
        ref={fluidRef}
        args={[fillLevel, 32, 32]}
        position={[0, -0.5 + fillLevel * 0.5, 0]}
        scale={[isOval ? scale * 1.8 : scale * 1.2, scale * 1.2, scale * 1.2]}
      >
        <meshStandardMaterial
          color={fluidColor}
          emissive={fluidColor}
          emissiveIntensity={0.8} // Increased emissive intensity
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.85}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </Sphere>

      {/* Add fluid surface tension effect at the top of the fluid */}
      <mesh
        position={[0, -0.5 + fillLevel, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[fillLevel * (isOval ? 1.77 : 1.18) * scale, fillLevel * 1.18 * scale, 1]}
      >
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial
          color={fluidColor}
          emissive={fluidColor}
          emissiveIntensity={0.8} // Increased emissive intensity
          transparent
          opacity={0.9}
          roughness={0}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Small vesicles inside the vacuole - more varied and numerous */}
      {[...Array(12)].map((_, i) => {
        // Increased from 8 to 12
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        const radius = fillLevel * 0.7 * Math.random()

        const x = radius * Math.sin(phi) * Math.cos(theta) * (isOval ? 1.8 : 1.2) * scale
        const y = -0.5 + fillLevel * 0.5 + radius * Math.sin(phi) * Math.sin(theta) * scale
        const z = radius * Math.cos(phi) * scale

        const vesicleScale = 0.08 + Math.random() * 0.12 // Increased size

        return (
          <Sphere key={i} args={[vesicleScale, 16, 16]} position={[x, y, z]}>
            <meshStandardMaterial
              color="#4FD1C5"
              emissive="#4FD1C5"
              emissiveIntensity={0.8} // Increased emissive intensity
              transparent
              opacity={0.7}
              roughness={0.1}
              metalness={0.1}
            />
          </Sphere>
        )
      })}

      {isActive && (
        <Html position={[0, 1.8 * scale, 0]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            ${(funds + profits).toFixed(2)}
          </div>
        </Html>
      )}
    </group>
  )
}

