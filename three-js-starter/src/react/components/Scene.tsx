import { Suspense } from 'react'
import { Stars } from '@react-three/drei'
import { TorusKnot } from './TorusKnot'

interface SceneProps {
  onObjectClick?: () => void
}

export function Scene({ onObjectClick }: SceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Main interactive object */}
      <Suspense fallback={null}>
        <TorusKnot onClick={onObjectClick} />
      </Suspense>

      {/* Ground plane for shadows */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshPhongMaterial color="#333333" transparent opacity={0.3} />
      </mesh>
    </>
  )
}