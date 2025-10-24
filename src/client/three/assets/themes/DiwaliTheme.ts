import * as THREE from 'three';
import { AssetManager } from '../AssetManager';

export interface DiwaliPickup {
  type: 'share-diya' | 'phooljhadi-boost' | 'rangoli-shield';
  effect: 'heal' | 'speed-trail' | 'aoe-protection';
  duration?: number;
  value?: number;
}

export class DiwaliTheme {
  private assetManager: AssetManager;
  private scene: THREE.Scene;
  private particleSystems: Map<string, THREE.Points> = new Map();
  private audioContext?: AudioContext;

  constructor(scene: THREE.Scene) {
    this.assetManager = AssetManager.getInstance();
    this.scene = scene;
    this.assetManager.setTheme('diwali-night');
  }

  public async initialize(): Promise<void> {
    // Load theme-specific assets
    await this.loadDiwaliAssets();
    
    // Setup theme lighting
    this.setupDiwaliLighting();
    
    // Initialize particle systems
    this.initializeParticleSystems();
    
    // Setup audio stems
    this.setupAudioStems();
  }

  private async loadDiwaliAssets(): Promise<void> {
    const packs = ['lanes', 'obstacles', 'pickups', 'vfx', 'audio'];
    
    for (const pack of packs) {
      await this.assetManager.loadAssetPack(pack as any);
    }
  }

  private setupDiwaliLighting(): void {
    // Remove existing lights
    const existingLights = this.scene.children.filter(child => child instanceof THREE.Light);
    existingLights.forEach(light => this.scene.remove(light));

    // Warm ambient lighting for night atmosphere
    const ambientLight = new THREE.AmbientLight(0x2a1810, 0.3);
    this.scene.add(ambientLight);

    // Main directional light (moonlight with warm tint)
    const directionalLight = new THREE.DirectionalLight(0xff6b35, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Diya point lights for warm glow
    const diyaLight1 = new THREE.PointLight(0xffaa00, 1.0, 10);
    diyaLight1.position.set(0, 2, 0);
    this.scene.add(diyaLight1);

    const diyaLight2 = new THREE.PointLight(0xff4444, 0.5, 8);
    diyaLight2.position.set(-3, 1, 2);
    this.scene.add(diyaLight2);

    // Animated flickering for diya lights
    this.animateDiyaLights([diyaLight1, diyaLight2]);
  }

  private animateDiyaLights(lights: THREE.PointLight[]): void {
    const animate = () => {
      lights.forEach((light, index) => {
        const time = Date.now() * 0.001;
        const flicker = 0.8 + 0.2 * Math.sin(time * 5 + index * Math.PI);
        light.intensity = light.intensity * 0.9 + flicker * 0.1;
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  private initializeParticleSystems(): void {
    // Sparkler trail particles
    this.createSparklerSystem();
    
    // Firework particles
    this.createFireworkSystem();
    
    // Floating diya embers
    this.createEmberSystem();
  }

  private createSparklerSystem(): void {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = Math.random() * 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Golden sparkler colors
      colors[i3] = 1.0; // R
      colors[i3 + 1] = 0.7 + Math.random() * 0.3; // G
      colors[i3 + 2] = 0.2; // B

      sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const sparklers = new THREE.Points(geometry, material);
    this.scene.add(sparklers);
    this.particleSystems.set('sparklers', sparklers);
  }

  private createFireworkSystem(): void {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Start at explosion point
      positions[i3] = 0;
      positions[i3 + 1] = 10;
      positions[i3 + 2] = -20;

      // Random explosion velocities
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const speed = Math.random() * 5 + 2;

      velocities[i3] = Math.sin(theta) * Math.cos(phi) * speed;
      velocities[i3 + 1] = Math.cos(theta) * speed;
      velocities[i3 + 2] = Math.sin(theta) * Math.sin(phi) * speed;

      // Firework colors (magenta, gold, red)
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 1.0; colors[i3 + 1] = 0.0; colors[i3 + 2] = 1.0; // Magenta
      } else if (colorChoice < 0.66) {
        colors[i3] = 1.0; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.0; // Gold
      } else {
        colors[i3] = 1.0; colors[i3 + 1] = 0.2; colors[i3 + 2] = 0.2; // Red
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const fireworks = new THREE.Points(geometry, material);
    this.scene.add(fireworks);
    this.particleSystems.set('fireworks', fireworks);

    // Animate firework explosion
    this.animateFireworks(fireworks, velocities);
  }

  private createEmberSystem(): void {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = Math.random() * 3;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      // Warm ember colors
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.3 + Math.random() * 0.4;
      colors[i3 + 2] = 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const embers = new THREE.Points(geometry, material);
    this.scene.add(embers);
    this.particleSystems.set('embers', embers);

    // Gentle floating animation
    this.animateEmbers(embers);
  }

  private animateFireworks(fireworks: THREE.Points, velocities: Float32Array): void {
    let time = 0;
    const animate = () => {
      time += 0.016; // ~60fps
      const positions = fireworks.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const index = i / 3;
        positions[i] += velocities[index * 3] * 0.016;
        positions[i + 1] += velocities[index * 3 + 1] * 0.016 - 9.8 * time * time * 0.5;
        positions[i + 2] += velocities[index * 3 + 2] * 0.016;
      }
      
      fireworks.geometry.attributes.position.needsUpdate = true;
      
      if (time < 3) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  private animateEmbers(embers: THREE.Points): void {
    const animate = () => {
      const positions = embers.geometry.attributes.position.array as Float32Array;
      const time = Date.now() * 0.001;
      
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.01; // Gentle floating
      }
      
      embers.geometry.attributes.position.needsUpdate = true;
      requestAnimationFrame(animate);
    };
    animate();
  }

  private setupAudioStems(): void {
    // Setup shehnai and dhol audio stems for cultural atmosphere
    // This would integrate with the game's audio system
  }

  public createDiwaliPickup(type: DiwaliPickup['type'], position: THREE.Vector3): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (type) {
      case 'share-diya':
        geometry = new THREE.CylinderGeometry(0.3, 0.5, 0.2, 8);
        material = this.assetManager.getMaterial('diya-glow');
        break;
      
      case 'phooljhadi-boost':
        geometry = new THREE.ConeGeometry(0.1, 1, 6);
        material = this.assetManager.getMaterial('firework-trail');
        break;
      
      case 'rangoli-shield':
        geometry = new THREE.RingGeometry(0.3, 0.8, 8);
        material = new THREE.MeshStandardMaterial({
          color: 0xff6b35,
          transparent: true,
          opacity: 0.7
        });
        break;
      
      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    }

    const pickup = new THREE.Mesh(geometry, material);
    pickup.position.copy(position);
    pickup.userData = { type, effect: this.getPickupEffect(type) };

    return pickup;
  }

  private getPickupEffect(type: DiwaliPickup['type']): DiwaliPickup['effect'] {
    switch (type) {
      case 'share-diya': return 'heal';
      case 'phooljhadi-boost': return 'speed-trail';
      case 'rangoli-shield': return 'aoe-protection';
      default: return 'heal';
    }
  }

  public createSkylineSilhouette(): THREE.Group {
    const skyline = new THREE.Group();
    
    // Create building silhouettes with diya lights
    for (let i = 0; i < 10; i++) {
      const buildingHeight = Math.random() * 5 + 2;
      const buildingWidth = Math.random() * 2 + 1;
      
      const geometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, 0.5);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0.8
      });
      
      const building = new THREE.Mesh(geometry, material);
      building.position.set(i * 3 - 15, buildingHeight / 2, -25);
      
      // Add diya lights to building
      const diyaCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < diyaCount; j++) {
        const diyaLight = new THREE.PointLight(0xffaa00, 0.5, 3);
        diyaLight.position.set(
          (Math.random() - 0.5) * buildingWidth,
          Math.random() * buildingHeight,
          0.3
        );
        building.add(diyaLight);
      }
      
      skyline.add(building);
    }
    
    return skyline;
  }

  public update(deltaTime: number): void {
    // Update particle systems
    this.particleSystems.forEach((system, name) => {
      if (name === 'sparklers') {
        system.rotation.y += deltaTime * 0.5;
      }
    });
  }

  public dispose(): void {
    this.particleSystems.forEach(system => {
      this.scene.remove(system);
      system.geometry.dispose();
      (system.material as THREE.Material).dispose();
    });
    this.particleSystems.clear();
  }
}