"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Html } from "@react-three/drei"
import type { Mesh, MeshStandardMaterial, Group } from "three"
import * as THREE from "three"

interface HeartProps {
  position: [number, number, number]
  scale?: number
  isActive: boolean
  onClick: () => void
  activePositions: number
}

export default function Heart({ position, scale = 1, isActive, onClick, activePositions }: HeartProps) {
  const heartRef = useRef<Group>(null)
  const mainRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  // Heart is metaphorical (not a real organelle), so we'll use red tones
  const heartColor = isActive ? "#F56565" : "#E53E3E" // Red
  const vesselColor = "#FC8181" // Lighter red for vessels

  // Pulse rate based on active positions
  const pulseRate = 1 + activePositions * 0.1

  // Create noise textures programmatically
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

  const roughnessTexture = useMemo(() => {
    const texture = new THREE.DataTexture(
      new Uint8Array(512 * 512).map(() => 128 + Math.random() * 128),
      512,
      512,
      THREE.RedFormat,
    )
    texture.needsUpdate = true
    return texture
  }, [])

  useFrame((state) => {
    if (heartRef.current) {
      // Gentle rotation
      heartRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    }

    if (mainRef.current) {
      // Enhanced heartbeat pulse effect
      const time = state.clock.getElapsedTime()
      const pulse = Math.pow(Math.sin(time * pulseRate), 10) * 0.2

      // More realistic heart contraction
      mainRef.current.scale.x = scale * (1 + pulse)
      mainRef.current.scale.y = scale * (1 + pulse * 1.2) // More vertical expansion
      mainRef.current.scale.z = scale * (1 + pulse * 0.8)
    }

    if (materialRef.current) {
      if (hovered || isActive) {
        materialRef.current.emissiveIntensity =
          0.8 + Math.pow(Math.sin(state.clock.getElapsedTime() * pulseRate), 10) * 0.5
      } else {
        materialRef.current.emissiveIntensity =
          0.3 + Math.pow(Math.sin(state.clock.getElapsedTime() * pulseRate), 10) * 0.3
      }
    }
  })

  return (
    <group
      ref={heartRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main heart structure - more muscle-like with texture */}
      <Sphere ref={mainRef} args={[1, 32, 32]} scale={[1, 1.1, 0.9]}>
        <meshStandardMaterial
          ref={materialRef}
          color={heartColor}
          emissive={heartColor}
          emissiveIntensity={0.3}
          roughness={0.7}
          metalness={0.2}
          displacementScale={0.05}
          displacementMap={noiseTexture}
          roughnessMap={roughnessTexture}
        />
      </Sphere>

      {/* Fibrous muscle texture overlay */}
      <Sphere args={[1.02, 32, 32]} scale={[1, 1.1, 0.9]}>
        <meshStandardMaterial color={heartColor} transparent opacity={0.3} wireframe={true} roughness={0.8} />
      </Sphere>

      {/* More complex vessel-like structures */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = 1.1
        const x = Math.cos(angle) * radius * 0.8
        const y = Math.sin(angle) * radius
        const z = Math.cos(angle + Math.PI / 4) * 0.3

        return (
          <group key={i} position={[x, y, z]}>
            {/* Main vessel */}
            <mesh scale={[0.1, 0.5, 0.1]} rotation={[0, 0, angle + Math.PI / 2]}>
              <cylinderGeometry args={[1, 0.7, 1, 16]} />
              <meshStandardMaterial
                color={vesselColor}
                emissive={vesselColor}
                emissiveIntensity={0.2}
                roughness={0.5}
                metalness={0.2}
              />
            </mesh>

            {/* Vessel branches */}
            {i % 2 === 0 && (
              <>
                <mesh
                  position={[x > 0 ? 0.2 : -0.2, 0.1, 0]}
                  scale={[0.07, 0.3, 0.07]}
                  rotation={[0, 0, x > 0 ? -Math.PI / 4 : Math.PI / 4]}
                >
                  <cylinderGeometry args={[1, 0.6, 1, 12]} />
                  <meshStandardMaterial
                    color={vesselColor}
                    emissive={vesselColor}
                    emissiveIntensity={0.2}
                    roughness={0.5}
                    metalness={0.2}
                  />
                </mesh>

                <mesh
                  position={[x > 0 ? 0.2 : -0.2, -0.1, 0]}
                  scale={[0.07, 0.25, 0.07]}
                  rotation={[0, 0, x > 0 ? Math.PI / 4 : -Math.PI / 4]}
                >
                  <cylinderGeometry args={[1, 0.6, 1, 12]} />
                  <meshStandardMaterial
                    color={vesselColor}
                    emissive={vesselColor}
                    emissiveIntensity={0.2}
                    roughness={0.5}
                    metalness={0.2}
                  />
                </mesh>
              </>
            )}
          </group>
        )
      })}

      {isActive && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {activePositions} active positions
          </div>
        </Html>
      )}
    </group>
  )
}

