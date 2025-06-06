"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"
import { useTheme } from "next-themes"

export default function GridBackdrop() {
  const backdropRef = useRef<THREE.Group>(null)
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === "dark"

  useFrame(({ clock }) => {
    if (backdropRef.current) {
      // Very subtle rotation for a bit of movement
      backdropRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.1
    }
  })

  return (
    <group ref={backdropRef}>
      {/* Floating particles */}
      <ParticleField isDarkMode={isDarkMode} />

      {/* Token elements */}
      <TokenElements isDarkMode={isDarkMode} />
    </group>
  )
}

function ParticleField({ isDarkMode }: { isDarkMode: boolean }) {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 200
  const particleColor = isDarkMode ? "#3b82f6" : "#FF9F7E"

  // Create particles with random positions
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 50
      positions[i3 + 1] = (Math.random() - 0.5) * 50
      positions[i3 + 2] = (Math.random() - 0.5) * 50 - 10 // Push back a bit
    }
    return positions
  }, [particleCount])

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
      <pointsMaterial size={0.2} color={particleColor} transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function TokenElements({ isDarkMode }: { isDarkMode: boolean }) {
  const elementsRef = useRef<THREE.Group>(null)
  const primaryColor = isDarkMode ? "#3b82f6" : "#FF9F7E"
  const secondaryColor = isDarkMode ? "#1e40af" : "#E87A55"

  // Square data
  const squares = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const radius = 20 + Math.random() * 10
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      const z = -30 - Math.random() * 20
      const scale = 0.8 + Math.random() * 1.2

      return {
        position: [x, y, z] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale,
        speed: 0.2 + Math.random() * 0.3,
        color: i % 3 === 0 ? primaryColor : secondaryColor,
      }
    })
  }, [primaryColor, secondaryColor])

  useFrame(({ clock }) => {
    if (elementsRef.current) {
      elementsRef.current.children.forEach((child, i) => {
        const time = clock.getElapsedTime()
        const square = squares[i]

        // Gentle floating and rotation
        child.position.y += Math.sin(time * square.speed) * 0.01
        child.rotation.x += 0.001 * square.speed
        child.rotation.y += 0.002 * square.speed
      })
    }
  })

  return (
    <group ref={elementsRef}>
      {squares.map((square, i) => (
        <mesh key={i} position={square.position} rotation={square.rotation} scale={[square.scale, square.scale, 0.1]}>
          <boxGeometry args={[1, 1, 0.1]} />
          <meshStandardMaterial color={square.color} transparent opacity={0.2} roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}
