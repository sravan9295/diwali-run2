import * as THREE from 'three'
import { CameraConfig } from '../types'

/**
 * Creates and configures a perspective camera
 * @param aspect - Initial aspect ratio (width/height)
 * @param config - Camera configuration options
 * @returns Configured perspective camera
 */
export function makeCamera(aspect: number, config?: CameraConfig): THREE.PerspectiveCamera {
  const cameraConfig = config || {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5]
  }
  
  const camera = new THREE.PerspectiveCamera(
    cameraConfig.fov,
    aspect,
    cameraConfig.near,
    cameraConfig.far
  )
  
  camera.position.set(...cameraConfig.position)
  camera.lookAt(0, 0, 0)
  
  return camera
}

/**
 * Updates camera aspect ratio and projection matrix
 * @param camera - Camera to update
 * @param width - New viewport width
 * @param height - New viewport height
 */
export function updateCameraAspect(
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
): void {
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

/**
 * Smoothly animates camera to a new position
 * @param camera - Camera to animate
 * @param targetPosition - Target position [x, y, z]
 * @param duration - Animation duration in milliseconds
 * @returns Promise that resolves when animation completes
 */
export function animateCameraTo(
  camera: THREE.PerspectiveCamera,
  targetPosition: [number, number, number],
  duration: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const startPosition = camera.position.clone()
    const endPosition = new THREE.Vector3(...targetPosition)
    const startTime = Date.now()
    
    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 3)
      
      camera.position.lerpVectors(startPosition, endPosition, eased)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve()
      }
    }
    
    animate()
  })
}