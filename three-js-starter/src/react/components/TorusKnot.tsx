import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface TorusKnotProps {
  position?: [number, number, number]
  onClick?: () => void
}

export function TorusKnot({ position = [0, 0, 0], onClick }: TorusKnotProps) {
  const meshRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  useFrame((_state, delta) => {
    // Rotate the torus knot
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 1

    // Handle click animation
    if (clicked) {
      const targetScale = meshRef.current.scale.x < 1.2 ? 1.2 : 1
      meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale } as any, delta * 10)
      
      if (Math.abs(meshRef.current.scale.x - 1) < 0.01) {
        setClicked(false)
        meshRef.current.scale.set(1, 1, 1)
      }
    }
  })

  const handleClick = () => {
    setClicked(true)
    onClick?.()
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <torusKnotGeometry args={[2, 0.6, 100, 16]} />
      <meshPhongMaterial 
        color={hovered ? '#00ff88' : '#0088ff'} 
        shininess={100}
      />
    </mesh>
  )
}