import * as THREE from 'three';
import { GameAssetLoader } from './GameAssetLoader';
import { ProfileManager } from './ProfileManager';

// Example usage of the modular asset system
export class GameInitializer {
  private scene: THREE.Scene;
  private assetLoader: GameAssetLoader;
  private profileManager: ProfileManager;

  constructor() {
    this.scene = new THREE.Scene();
    this.assetLoader = new GameAssetLoader(this.scene);
    this.profileManager = ProfileManager.getInstance();
  }

  public async initializeGame(): Promise<void> {
    // Setup loading progress tracking
    this.assetLoader.onLoadingProgress((progress) => {
      console.log(`Loading ${progress.pack}: ${progress.percentage.toFixed(1)}%`);
      this.updateLoadingUI(progress);
    });

    try {
      // 1. Detect device capabilities and set optimal profile
      console.log('Device capabilities:', this.profileManager.getDeviceCapabilities());
      console.log('Selected profile:', this.profileManager.getCurrentProfile());

      // 2. Preload critical assets for immediate gameplay
      await this.assetLoader.preloadCriticalAssets();
      this.showGameUI(); // Can start showing basic UI

      // 3. Load all game assets with Diwali theme
      await this.assetLoader.loadGameAssets('diwali-night');

      // 4. Optimize performance based on actual device performance
      await this.assetLoader.optimizeForDevice();

      // 5. Game is ready to play
      this.startGame();

    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showErrorUI();
    }
  }

  private updateLoadingUI(progress: any): void {
    // Update loading screen with progress
    const loadingElement = document.getElementById('loading-progress');
    if (loadingElement) {
      loadingElement.textContent = `Loading ${progress.pack}... ${progress.percentage.toFixed(0)}%`;
    }
  }

  private showGameUI(): void {
    // Show basic game UI elements
    console.log('Basic UI ready');
  }

  private startGame(): void {
    console.log('🎮 Game ready to play!');
    
    // Example: Create some Diwali-themed pickups
    this.createExamplePickups();
    
    // Start game loop
    this.gameLoop();
  }

  private createExamplePickups(): void {
    // Create Diwali-themed pickups using the asset system
    const positions = [
      new THREE.Vector3(2, 1, 0),
      new THREE.Vector3(-2, 1, 5),
      new THREE.Vector3(0, 1, 10)
    ];

    const pickupTypes = ['share-diya', 'phooljhadi-boost', 'rangoli-shield'];

    positions.forEach((position, index) => {
      const pickup = this.assetLoader.createPickup(
        `diwali-${pickupTypes[index]}`, 
        position
      );
      if (pickup) {
        this.scene.add(pickup);
        console.log(`Created ${pickupTypes[index]} pickup at`, position);
      }
    });
  }

  private gameLoop(): void {
    const animate = () => {
      const deltaTime = 0.016; // 60fps
      
      // Update asset systems (particles, animations, etc.)
      this.assetLoader.update(deltaTime);
      
      // Continue game loop
      requestAnimationFrame(animate);
    };
    animate();
  }

  private showErrorUI(): void {
    console.error('Game failed to load');
  }

  public dispose(): void {
    this.assetLoader.dispose();
  }
}

// Performance profile examples
export function demonstrateProfileAdaptation(): void {
  const profileManager = ProfileManager.getInstance();
  
  console.log('=== Performance Profile Adaptation ===');
  
  // Example: Adapting particle count based on device
  const baseParticleCount = 200;
  const adaptedCount = profileManager.getParticleCount(baseParticleCount);
  console.log(`Base particles: ${baseParticleCount}, Adapted: ${adaptedCount}`);
  
  // Example: Adapting texture size
  const baseTextureSize = 2048;
  const adaptedSize = profileManager.getTextureSize(baseTextureSize);
  console.log(`Base texture: ${baseTextureSize}px, Adapted: ${adaptedSize}px`);
  
  // Example: Feature availability
  const features = ['bloom', 'shadows', 'particles', 'antialiasing', 'postprocessing'];
  features.forEach(feature => {
    const enabled = profileManager.shouldUseFeature(feature);
    console.log(`${feature}: ${enabled ? '✅' : '❌'}`);
  });
  
  // Example: Adaptive configuration
  const renderSettings = profileManager.adaptForPerformance({
    lowEnd: { shadowMapSize: 512, antialias: false, bloom: false },
    midRange: { shadowMapSize: 1024, antialias: true, bloom: true },
    highEnd: { shadowMapSize: 2048, antialias: true, bloom: true }
  });
  console.log('Render settings:', renderSettings);
}

// Asset loading examples
export function demonstrateAssetLoading(): void {
  console.log('=== Asset Loading Examples ===');
  
  const scene = new THREE.Scene();
  const loader = new GameAssetLoader(scene);
  
  // Track loading progress
  loader.onLoadingProgress((progress) => {
    console.log(`📦 ${progress.pack}: ${progress.loaded}/${progress.total} (${progress.percentage.toFixed(1)}%)`);
  });
  
  // Load specific theme
  loader.loadGameAssets('diwali-night').then(() => {
    console.log('🎆 Diwali theme loaded successfully!');
    
    // Access loaded assets
    const diyaTexture = loader.getAsset('pickup-share-diya');
    const sparklerMaterial = loader.getMaterial('firework-trail');
    
    console.log('Assets available:', {
      diyaTexture: !!diyaTexture,
      sparklerMaterial: !!sparklerMaterial
    });
  });
}

// Usage in main game file:
/*
import { GameInitializer } from './assets/usage-example';

const gameInit = new GameInitializer();
gameInit.initializeGame().then(() => {
  console.log('Game initialized successfully!');
});
*/