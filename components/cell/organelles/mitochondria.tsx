"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Html } from "@react-three/drei"
import type { Mesh, MeshStandardMaterial, Group } from "three"
import * as THREE from "three"

interface MitochondriaProps {
  position: [number, number, number]
  scale?: number
  isActive: boolean
  onClick: () => void
  activePositions: number
  health: number
}

export default function Mitochondria({
  position,
  scale = 1,
  isActive,
  onClick,
  activePositions,
  health,
}: MitochondriaProps) {
  const mitoRef = useRef<Group>(null)
  const mainRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  // Update the color logic to use the health prop
  // Mitochondria are typically reddish-brown in real cells
  const getHealthColor = () => {
    if (health > 70) return isActive ? "#F56565" : "#E53E3E" // Healthy
    if (health > 40) return isActive ? "#FC8181" : "#F56565" // Warning
    return isActive ? "#FF0000" : "#DC143C" // Unhealthy/Critical
  }

  const mitoColor = getHealthColor()
  const cristaeColor = health > 50 ? "#FC8181" : "#FF6347" // Lighter red when healthy, brighter red when unhealthy

  // Activity rate based on active positions
  const activityRate = 1 + activePositions * 0.1

  // Create noise texture programmatically
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

  // Update the useFrame function to use health for pulsing intensity
  useFrame((state) => {
    if (mitoRef.current) {
      // Gentle rotation
      mitoRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    }

    if (mainRef.current) {
      // Keep size consistent but make it larger
      mainRef.current.scale.x = scale * 2.2 // Increased from 1.8 to 2.2
      mainRef.current.scale.y = scale * 1.1 // Increased from 0.9 to 1.1
      mainRef.current.scale.z = scale * 1.1 // Increased from 0.9 to 1.1
    }

    if (materialRef.current) {
      const isHealthy = health > 70

      // Pulsing effect based on health - faster and more intense when unhealthy
      const pulseRate = isHealthy ? activityRate : activityRate * 2
      const pulseIntensity = isHealthy ? 0.3 : 0.5

      if (hovered || isActive) {
        materialRef.current.emissiveIntensity =
          1.2 + Math.pow(Math.sin(state.clock.getElapsedTime() * pulseRate), 10) * pulseIntensity
      } else {
        materialRef.current.emissiveIntensity =
          1.0 + Math.pow(Math.sin(state.clock.getElapsedTime() * pulseRate), 10) * pulseIntensity
      }
    }
  })

  return (
    <group
      ref={mitoRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main mitochondrial structure - oval shaped - made larger */}
      <Sphere ref={mainRef} args={[1, 32, 32]} scale={[2.2 * scale, 1.1 * scale, 1.1 * scale]}>
        <meshStandardMaterial
          ref={materialRef}
          color={mitoColor}
          emissive={mitoColor}
          emissiveIntensity={1.0} // Increased emissive intensity
          roughness={0.6}
          metalness={0.2}
          displacementScale={0.05}
          displacementMap={noiseTexture}
        />
      </Sphere>

      {/* Add outline to make mitochondria more visible */}
      <Sphere args={[1.05, 32, 32]} scale={[2.2 * scale, 1.1 * scale, 1.1 * scale]}>
        <meshBasicMaterial color={mitoColor} wireframe={true} transparent opacity={0.3} />
      </Sphere>

      {/* Outer membrane */}
      <Sphere args={[1.02, 32, 32]} scale={[2.2 * scale, 1.1 * scale, 1.1 * scale]}>
        <meshStandardMaterial color={mitoColor} transparent opacity={0.2} wireframe={true} roughness={0.7} />
      </Sphere>

      {/* Inner cristae structures - characteristic of mitochondria */}
      {[...Array(5)].map((_, i) => {
        const y = -0.6 + i * 0.3
        return (
          <mesh
            key={i}
            position={[0, y * scale, 0]}
            scale={[1.8 * scale, 0.06 * scale, 0.8 * scale]}
            rotation={[0, 0, 0]}
          >
            <boxGeometry args={[1, 1, 1, 1]} />
            <meshStandardMaterial
              color={cristaeColor}
              emissive={cristaeColor}
              emissiveIntensity={1.0} // Increased emissive intensity
              roughness={0.5}
              metalness={0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Additional smaller mitochondria nearby to form a cluster - spaced further apart */}
      <group position={[-1.8 * scale, 0.8 * scale, 0]} scale={0.5 * scale}>
        <Sphere args={[1, 24, 24]} scale={[1.8, 0.9, 0.9]}>
          <meshStandardMaterial
            color={mitoColor}
            emissive={mitoColor}
            emissiveIntensity={1.0} // Increased emissive intensity
            roughness={0.6}
            metalness={0.2}
          />
        </Sphere>
        {[...Array(3)].map((_, i) => {
          const y = -0.4 + i * 0.4
          return (
            <mesh key={i} position={[0, y, 0]} scale={[1.5, 0.05, 0.7]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={cristaeColor}
                emissive={cristaeColor}
                emissiveIntensity={1.0} // Increased emissive intensity
                roughness={0.5}
                metalness={0.2}
                transparent
                opacity={0.8}
              />
            </mesh>
          )
        })}
      </group>

      <group position={[1.8 * scale, -0.8 * scale, 0]} scale={0.5 * scale}>
        <Sphere args={[1, 24, 24]} scale={[1.8, 0.9, 0.9]}>
          <meshStandardMaterial
            color={mitoColor}
            emissive={mitoColor}
            emissiveIntensity={1.0} // Increased emissive intensity
            roughness={0.6}
            metalness={0.2}
          />
        </Sphere>
        {[...Array(3)].map((_, i) => {
          const y = -0.4 + i * 0.4
          return (
            <mesh key={i} position={[0, y, 0]} scale={[1.5, 0.05, 0.7]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={cristaeColor}
                emissive={cristaeColor}
                emissiveIntensity={1.0} // Increased emissive intensity
                roughness={0.5}
                metalness={0.2}
                transparent
                opacity={0.8}
              />
            </mesh>
          )
        })}
      </group>

      {isActive && (
        <Html position={[0, 1.5 * scale, 0]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {activePositions} active positions
          </div>
        </Html>
      )}
    </group>
  )
}

