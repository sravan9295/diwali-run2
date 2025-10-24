import * as THREE from 'three'
import { makeRenderer } from './scene/renderer'
import { makeScene, getMainObject } from './scene/scene'
import { makeCamera } from './scene/camera'
import { createRenderLoop } from './systems/render-loop'
import { createResizeHandler } from './systems/resize-handler'
import { setupHMRCleanup, hmrCleanup, memoryMonitor } from './utils/cleanup'
import { DEFAULT_CONFIG } from '@/shared/constants'

/**
 * Main Three.js application class
 */
class ThreeJSApp {
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private renderLoop: any = null
  private resizeHandler: any = null
  private mainObject: THREE.Mesh | null = null
  private raycaster = new THREE.Raycaster()
  private mouse = new THREE.Vector2()
  private scaleVelocity = 0

  /**
   * Initializes the Three.js application
   */
  async init(container: HTMLElement): Promise<void> {
    try {
      // Setup HMR cleanup
      setupHMRCleanup()
      
      // Create renderer
      this.renderer = makeRenderer(container, DEFAULT_CONFIG.renderer)
      hmrCleanup.add(() => this.renderer?.dispose())
      
      // Create scene
      this.scene = makeScene(DEFAULT_CONFIG.scene)
      
      // Create camera
      const aspect = container.clientWidth / container.clientHeight
      this.camera = makeCamera(aspect, DEFAULT_CONFIG.camera)
      
      // Get main interactive object
      this.mainObject = getMainObject(this.scene)
      
      // Create render loop with update callback
      this.renderLoop = createRenderLoop(
        this.renderer,
        this.scene,
        this.camera,
        DEFAULT_CONFIG.performance,
        this.onUpdate.bind(this)
      )
      hmrCleanup.add(() => this.renderLoop?.dispose())
      
      // Create resize handler
      this.resizeHandler = createResizeHandler(
        this.renderer,
        this.camera,
        this.onResize.bind(this)
      )
      this.resizeHandler.observe(container)
      hmrCleanup.add(() => this.resizeHandler?.dispose())
      
      // Setup interaction
      this.setupInteraction(container)
      
      // Start render loop
      this.renderLoop.start()
      
      // Start memory monitoring in development
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        memoryMonitor.start()
        hmrCleanup.add(() => memoryMonitor.stop())
      }
      
      console.log('Three.js application initialized successfully')
      
    } catch (error) {
      console.error('Failed to initialize Three.js application:', error)
      throw error
    }
  }
  
  /**
   * Update callback called on each frame
   */
  private onUpdate(_deltaTime: number): void {
    if (!this.mainObject) return
    
    // Rotate the main object
    this.mainObject.rotation.x += 0.01
    this.mainObject.rotation.y += 0.02
    
    // Handle bounce animation
    if (this.scaleVelocity !== 0) {
      const currentScale = this.mainObject.scale.x
      const newScale = currentScale + this.scaleVelocity
      
      this.mainObject.scale.set(newScale, newScale, newScale)
      
      if (newScale >= 1.2) {
        this.scaleVelocity = -0.04
      }
      if (newScale <= 1) {
        this.mainObject.scale.set(1, 1, 1)
        this.scaleVelocity = 0
      }
    }
  }
  
  /**
   * Resize callback
   */
  private onResize(width: number, height: number): void {
    console.log(`Canvas resized to ${width}x${height}`)
  }
  
  /**
   * Sets up mouse/touch interaction
   */
  private setupInteraction(container: HTMLElement): void {
    const handleClick = (event: PointerEvent) => {
      if (!this.camera || !this.scene || !this.mainObject) return
      
      // Calculate mouse position in normalized device coordinates
      const rect = container.getBoundingClientRect()
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      // Perform raycasting
      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.raycaster.intersectObject(this.mainObject)
      
      if (intersects.length > 0) {
        // Start bounce animation
        this.scaleVelocity = 0.05
        console.log('TorusKnot clicked!')
        
        // Dispatch custom event for external handling
        container.dispatchEvent(new CustomEvent('objectClicked', {
          detail: { object: this.mainObject, intersection: intersects[0] }
        }))
      }
    }
    
    container.addEventListener('pointerdown', handleClick)
    hmrCleanup.add(() => container.removeEventListener('pointerdown', handleClick))
  }
  
  /**
   * Gets the current FPS
   */
  getFPS(): number {
    return this.renderLoop?.getFPS() || 0
  }
  
  /**
   * Disposes of the application and cleans up resources
   */
  dispose(): void {
    hmrCleanup.cleanup()
  }
}

/**
 * Initialize the application when DOM is ready
 */
function initApp(): void {
  const container = document.getElementById('app')
  if (!container) {
    console.error('Container element #app not found')
    return
  }
  
  const app = new ThreeJSApp()
  app.init(container).catch(console.error)
  
  // Make app globally available for debugging
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    ;(window as any).threeApp = app
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}