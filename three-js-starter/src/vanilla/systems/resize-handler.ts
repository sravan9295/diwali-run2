import * as THREE from 'three'
import { ResizeHandlerSystem } from '@/shared/types'
import { updateCameraAspect } from '../scene/camera'

/**
 * Handles viewport changes and device orientation using ResizeObserver
 */
export class ResizeHandler implements ResizeHandlerSystem {
  private resizeObserver: ResizeObserver | null = null
  private orientationChangeHandler: (() => void) | null = null
  private isObserving = false

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.PerspectiveCamera,
    private onResize?: (width: number, height: number) => void
  ) {
    this.setupOrientationHandler()
  }

  /**
   * Starts observing the specified element for size changes
   */
  observe(element: HTMLElement): void {
    if (this.isObserving) {
      this.disconnect()
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.handleResize(entry)
      }
    })

    this.resizeObserver.observe(element)
    this.isObserving = true

    // Add orientation change listener
    if (this.orientationChangeHandler) {
      window.addEventListener('orientationchange', this.orientationChangeHandler)
    }
  }

  /**
   * Stops observing and disconnects the ResizeObserver
   */
  disconnect(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.orientationChangeHandler) {
      window.removeEventListener('orientationchange', this.orientationChangeHandler)
    }

    this.isObserving = false
  }

  /**
   * Disposes of the resize handler and cleans up resources
   */
  dispose(): void {
    this.disconnect()
    this.orientationChangeHandler = null
  }

  /**
   * Handles resize events from ResizeObserver
   */
  private handleResize(entry: ResizeObserverEntry): void {
    let width: number
    let height: number

    // Use contentBoxSize if available (more accurate)
    if (entry.contentBoxSize) {
      const contentBoxSize = Array.isArray(entry.contentBoxSize) 
        ? entry.contentBoxSize[0] 
        : entry.contentBoxSize
      
      width = contentBoxSize.inlineSize
      height = contentBoxSize.blockSize
    } else {
      // Fallback to contentRect
      width = entry.contentRect.width
      height = entry.contentRect.height
    }

    // Update camera aspect ratio
    updateCameraAspect(this.camera, width, height)

    // Update renderer size
    this.renderer.setSize(width, height)

    // Call custom resize callback if provided
    if (this.onResize) {
      this.onResize(width, height)
    }

    // Log resize in development
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`Viewport resized: ${width}x${height}`)
    }
  }

  /**
   * Sets up orientation change handling for mobile devices
   */
  private setupOrientationHandler(): void {
    this.orientationChangeHandler = () => {
      // Small delay to ensure the viewport has updated
      setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight
        
        updateCameraAspect(this.camera, width, height)
        this.renderer.setSize(width, height)
        
        if (this.onResize) {
          this.onResize(width, height)
        }
        
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log(`Orientation changed: ${width}x${height}`)
        }
      }, 100)
    }
  }
}

/**
 * Creates a resize handler system
 */
export function createResizeHandler(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  onResize?: (width: number, height: number) => void
): ResizeHandler {
  return new ResizeHandler(renderer, camera, onResize)
}