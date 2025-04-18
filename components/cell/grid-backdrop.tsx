"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

export default function GridBackdrop() {
  const gridRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (gridRef.current) {
      // Very subtle rotation for a bit of movement
      gridRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.1
    }
  })

  return (
    <group ref={gridRef}>
      {/* Main grid */}
      <gridHelper
        args={[40, 40, "#1e40af", "#1e293b"]}
        position={[0, -6, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 1, 0.1]}
      />

      {/* Secondary grid for depth */}
      <gridHelper
        args={[40, 20, "#1e40af", "#1e293b"]}
        position={[0, -12, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 1, 0.1]}
      />

      {/* Floating particles */}
      <ParticleField />
    </group>
  )
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 100

  // Create particles with random positions
  const particlesPosition = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    particlesPosition[i3] = (Math.random() - 0.5) * 30
    particlesPosition[i3 + 1] = (Math.random() - 0.5) * 30
    particlesPosition[i3 + 2] = (Math.random() - 0.5) * 30 - 10 // Push back a bit
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      // Gentle floating motion
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.02
      particlesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={particlesPosition} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#3b82f6" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

