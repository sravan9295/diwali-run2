import * as THREE from 'three'

/**
 * Disposes of Three.js geometry resources
 */
export function disposeGeometry(geometry: THREE.BufferGeometry): void {
  geometry.dispose()
}

/**
 * Disposes of Three.js material resources
 */
export function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  if (Array.isArray(material)) {
    material.forEach(mat => mat.dispose())
  } else {
    material.dispose()
  }
}

/**
 * Disposes of Three.js texture resources
 */
export function disposeTexture(texture: THREE.Texture): void {
  texture.dispose()
}

/**
 * Recursively disposes of all resources in a Three.js object
 */
export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        disposeGeometry(child.geometry)
      }
      
      if (child.material) {
        disposeMaterial(child.material)
        
        // Dispose textures if they exist
        if (child.material instanceof THREE.Material) {
          Object.values(child.material).forEach((value) => {
            if (value instanceof THREE.Texture) {
              disposeTexture(value)
            }
          })
        }
      }
    }
  })
  
  // Remove from parent
  if (object.parent) {
    object.parent.remove(object)
  }
}

/**
 * Disposes of an entire Three.js scene
 */
export function disposeScene(scene: THREE.Scene): void {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      disposeObject(child)
    }
  })
  
  // Clear the scene
  scene.clear()
}

/**
 * Removes all event listeners from an element
 */
export function removeAllEventListeners(element: HTMLElement): void {
  const newElement = element.cloneNode(true) as HTMLElement
  element.parentNode?.replaceChild(newElement, element)
}

/**
 * HMR cleanup utility for development
 */
export class HMRCleanup {
  private cleanupFunctions: (() => void)[] = []
  
  /**
   * Adds a cleanup function to be called on HMR
   */
  add(cleanupFn: () => void): void {
    this.cleanupFunctions.push(cleanupFn)
  }
  
  /**
   * Executes all cleanup functions
   */
  cleanup(): void {
    this.cleanupFunctions.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.error('Error during HMR cleanup:', error)
      }
    })
    this.cleanupFunctions = []
  }
}

/**
 * Global HMR cleanup instance
 */
export const hmrCleanup = new HMRCleanup()

/**
 * Sets up HMR cleanup for development
 */
export function setupHMRCleanup(): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__ && import.meta.hot) {
    import.meta.hot.dispose(() => {
      hmrCleanup.cleanup()
    })
  }
}

/**
 * Memory usage monitoring utility
 */
export class MemoryMonitor {
  private intervalId: number | null = null
  
  /**
   * Starts monitoring memory usage
   */
  start(intervalMs: number = 5000): void {
    if (this.intervalId !== null) return
    
    this.intervalId = window.setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        })
      }
    }, intervalMs)
  }
  
  /**
   * Stops monitoring memory usage
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

/**
 * Global memory monitor instance
 */
export const memoryMonitor = new MemoryMonitor()