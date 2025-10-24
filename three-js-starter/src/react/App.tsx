import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { Scene } from './components/Scene'
import { useResize } from './hooks/useResize'

export default function App() {
  const [clickCount, setClickCount] = useState(0)
  const { width, height } = useResize()

  const handleObjectClick = useCallback(() => {
    setClickCount(prev => prev + 1)
    console.log('TorusKnot clicked in React!')
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Three.js Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <Scene onObjectClick={handleObjectClick} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
        />
        <Stats />
      </Canvas>

      {/* UI Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          padding: 20,
          borderRadius: 10,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 10, color: '#00ff88' }}>
          Three.js Starter
        </h1>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 5 }}>
          React Three Fiber Implementation
        </p>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 5 }}>
          Click the TorusKnot to interact!
        </p>
        <p style={{ fontSize: 14, opacity: 0.8 }}>Clicks: {clickCount}</p>
      </div>

      {/* Viewport info */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          padding: 10,
          borderRadius: 5,
          color: 'white',
          fontFamily: 'monospace',
          fontSize: 12,
        }}
      >
        {width}x{height}
      </div>
    </div>
  )
}
