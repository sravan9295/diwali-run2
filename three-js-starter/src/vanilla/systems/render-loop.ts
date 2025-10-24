import * as THREE from 'three'
import { RenderLoopSystem, PerformanceConfig } from '@/shared/types'

/**
 * Manages the animation loop with performance optimizations
 */
export class RenderLoop implements RenderLoopSystem {
  private animationId: number | null = null
  private lastTime = 0
  private frameCount = 0
  private fpsStartTime = 0
  private currentFPS = 0
  private isRunning = false

  constructor(
    private renderer: THREE.WebGLRenderer,
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera,
    private config: PerformanceConfig,
    private onUpdate?: (deltaTime: number) => void
  ) {}

  /**
   * Starts the render loop
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()
    this.fpsStartTime = this.lastTime
    this.frameCount = 0

    this.animate()
  }

  /**
   * Stops the render loop
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * Disposes of the render loop and cleans up resources
   */
  dispose(): void {
    this.stop()
  }

  /**
   * Gets the current FPS
   */
  getFPS(): number {
    return this.currentFPS
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    if (!this.isRunning) return

    this.animationId = requestAnimationFrame(this.animate)

    const currentTime = performance.now()
    let deltaTime = (currentTime - this.lastTime) / 1000

    // Clamp delta time to prevent animation spikes on slow frames
    deltaTime = Math.min(deltaTime, this.config.maxDeltaTime)

    // Update FPS counter
    this.updateFPS(currentTime)

    // Call update callback if provided
    if (this.onUpdate) {
      this.onUpdate(deltaTime)
    }

    // Render the scene
    this.renderer.render(this.scene, this.camera)

    this.lastTime = currentTime
  }

  /**
   * Updates FPS calculation
   */
  private updateFPS(currentTime: number): void {
    this.frameCount++

    const elapsed = currentTime - this.fpsStartTime
    if (elapsed >= 1000) {
      // Update FPS every second
      this.currentFPS = Math.round((this.frameCount * 1000) / elapsed)
      this.frameCount = 0
      this.fpsStartTime = currentTime

      // Log performance warnings in development
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        if (this.currentFPS < this.config.targetFPS * 0.8) {
          console.warn(
            `Low FPS detected: ${this.currentFPS}fps (target: ${this.config.targetFPS}fps)`
          )
        }
      }
    }
  }
}

/**
 * Creates a render loop system with default configuration
 */
export function createRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  config: PerformanceConfig,
  onUpdate?: (deltaTime: number) => void
): RenderLoop {
  return new RenderLoop(renderer, scene, camera, config, onUpdate)
}
