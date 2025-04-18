"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import type { Mesh, MeshStandardMaterial, Group } from "three"
import * as THREE from "three"

interface NucleusProps {
  position: [number, number, number]
  isActive: boolean
  onClick: () => void
  health: number
}

export default function Nucleus({ position, isActive, onClick, health }: NucleusProps) {
  const nucleusRef = useRef<Group>(null)
  const sphereRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  // Update the color logic to use the health prop
  // Nucleus is typically purplish-blue in real cells, but we'll use a peach variant for our theme
  const getHealthColor = () => {
    if (health > 70) return isActive ? "#E87A55" : "#FF9F7E" // Healthy
    if (health > 40) return isActive ? "#FFA07A" : "#FF7F50" // Warning
    return isActive ? "#FF4500" : "#FF0000" // Unhealthy/Critical
  }

  const nucleusColor = getHealthColor()

  // Create noise texture programmatically for subtle surface variation
  const noiseTexture = useMemo(() => {
    const texture = new THREE.DataTexture(
      new Uint8Array(512 * 512 * 4).map(() => Math.random() * 255),
      512,
      512,
      THREE.RGBAFormat,
    )
    texture.needsUpdate = true
    return texture
  }, [])

  // Update the useFrame function for simple pulsing based on health
  useFrame((state) => {
    if (nucleusRef.current) {
      // Gentle rotation
      nucleusRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
    }

    if (materialRef.current) {
      const isHealthy = health > 70

      // Pulsing effect based on health - faster and more intense when unhealthy
      const pulseRate = isHealthy ? 1 : 3
      const pulseIntensity = isHealthy ? 0.2 : 0.5

      if (hovered || isActive) {
        materialRef.current.emissiveIntensity =
          1.5 + Math.sin(state.clock.getElapsedTime() * pulseRate * 3) * pulseIntensity
      } else {
        materialRef.current.emissiveIntensity =
          1.2 + Math.sin(state.clock.getElapsedTime() * pulseRate) * pulseIntensity
      }
    }
  })

  return (
    <group
      ref={nucleusRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Simple nucleus structure - just a sphere */}
      <Sphere ref={sphereRef} args={[1.8, 32, 32]}>
        <meshStandardMaterial
          ref={materialRef}
          color={nucleusColor}
          emissive={nucleusColor}
          emissiveIntensity={1.2}
          roughness={0.7}
          metalness={0.2}
          displacementScale={0.05}
          displacementMap={noiseTexture}
        />
      </Sphere>

      {/* Add subtle outline to make nucleus more visible */}
      <Sphere args={[1.85, 32, 32]}>
        <meshBasicMaterial color={nucleusColor} wireframe={true} transparent opacity={0.2} />
      </Sphere>
    </group>
  )
}

