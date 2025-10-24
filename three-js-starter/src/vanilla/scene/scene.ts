import * as THREE from 'three'
import { SceneConfig } from '@/shared/types'

/**
 * Creates a 3D scene with lighting and example objects
 * @param config - Scene configuration options
 * @returns Configured Three.js scene
 */
export function makeScene(config: SceneConfig): THREE.Scene {
  const scene = new THREE.Scene()

  // Set background
  if (config.background) {
    scene.background = config.background
  } else {
    scene.background = new THREE.Color(0x000000)
  }

  // Add fog if configured
  if (config.fog) {
    scene.fog = config.fog
  }

  // Add ambient lighting
  const ambientLight = new THREE.AmbientLight(
    config.lighting.ambient.color,
    config.lighting.ambient.intensity
  )
  scene.add(ambientLight)

  // Add directional lighting
  const directionalLight = new THREE.DirectionalLight(
    config.lighting.directional.color,
    config.lighting.directional.intensity
  )
  directionalLight.position.set(...config.lighting.directional.position)
  directionalLight.castShadow = true

  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 50

  scene.add(directionalLight)

  // Create TorusKnot geometry as specified in requirements
  const torusKnotGeometry = new THREE.TorusKnotGeometry(2, 0.6, 100, 16)
  const torusKnotMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff88,
    shininess: 100,
  })
  const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial)
  torusKnot.castShadow = true
  torusKnot.receiveShadow = true

  // Create a group for the main object
  const mainGroup = new THREE.Group()
  mainGroup.add(torusKnot)
  scene.add(mainGroup)

  // Add some background stars for visual interest
  addStars(scene, 200)

  return scene
}

/**
 * Adds stars to the scene for visual enhancement
 * @param scene - Scene to add stars to
 * @param count - Number of stars to add
 */
function addStars(scene: THREE.Scene, count: number): void {
  const starGeometry = new THREE.SphereGeometry(0.25, 8, 8)
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

  for (let i = 0; i < count; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial)

    const x = THREE.MathUtils.randFloatSpread(200)
    const y = THREE.MathUtils.randFloatSpread(200)
    const z = THREE.MathUtils.randFloatSpread(200)

    star.position.set(x, y, z)
    scene.add(star)
  }
}

/**
 * Gets the main interactive object from the scene
 * @param scene - Scene containing the object
 * @returns The main TorusKnot mesh or null if not found
 */
export function getMainObject(scene: THREE.Scene): THREE.Mesh | null {
  const mainGroup = scene.getObjectByName('mainGroup') as THREE.Group
  if (!mainGroup) {
    // Fallback: find first TorusKnot mesh
    let torusKnot: THREE.Mesh | null = null
    scene.traverse(child => {
      if (
        child instanceof THREE.Mesh &&
        child.geometry instanceof THREE.TorusKnotGeometry
      ) {
        torusKnot = child
      }
    })
    return torusKnot
  }

  return mainGroup.children[0] as THREE.Mesh
}
