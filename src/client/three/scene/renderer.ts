import * as THREE from 'three'
import { RendererConfig } from '../types'

/**
 * Creates and configures a WebGL renderer with optimal settings
 * @param container - HTML element to attach the canvas to
 * @param config - Renderer configuration options
 * @returns Configured WebGL renderer
 */
export function makeRenderer(container: HTMLElement, config: RendererConfig): THREE.WebGLRenderer {
  const canvas = container.querySelector('canvas') || document.createElement('canvas')
  
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: config.antialias,
    alpha: config.alpha,
    powerPreference: config.powerPreference,
  })

  // Cap pixel ratio for mobile performance
  const pixelRatio = Math.min(window.devicePixelRatio || 1, config.maxPixelRatio)
  renderer.setPixelRatio(pixelRatio)
  
  // Set initial size
  const { clientWidth, clientHeight } = container
  renderer.setSize(clientWidth, clientHeight)
  
  // Configure renderer settings
  renderer.setClearColor(0x000000, 1)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  
  // Append canvas if not already in container
  if (!container.contains(canvas)) {
    container.appendChild(canvas)
  }
  
  return renderer
}

/**
 * Disposes of WebGL renderer resources
 * @param renderer - Renderer to dispose
 */
export function disposeRenderer(renderer: THREE.WebGLRenderer): void {
  renderer.dispose()
  renderer.forceContextLoss()
}