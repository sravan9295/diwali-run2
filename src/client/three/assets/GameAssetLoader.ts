import { AssetManager } from './AssetManager';
import { ProfileManager } from './ProfileManager';
import { DiwaliTheme } from './themes/DiwaliTheme';
import { CorePacks, AssetPack } from './packs/CorePacks';
import * as THREE from 'three';

export interface LoadingProgress {
  pack: string;
  loaded: number;
  total: number;
  percentage: number;
}

export class GameAssetLoader {
  private assetManager: AssetManager;
  private profileManager: ProfileManager;
  private scene: THREE.Scene;
  private currentTheme?: DiwaliTheme;
  private loadingCallbacks: ((progress: LoadingProgress) => void)[] = [];

  constructor(scene: THREE.Scene) {
    this.assetManager = AssetManager.getInstance();
    this.profileManager = ProfileManager.getInstance();
    this.scene = scene;
  }

  public onLoadingProgress(callback: (progress: LoadingProgress) => void): void {
    this.loadingCallbacks.push(callback);
  }

  private notifyProgress(pack: string, loaded: number, total: number): void {
    const progress: LoadingProgress = {
      pack,
      loaded,
      total,
      percentage: (loaded / total) * 100
    };
    
    this.loadingCallbacks.forEach(callback => callback(progress));
  }

  public async loadGameAssets(theme: string = 'diwali-night'): Promise<void> {
    console.log('Starting game asset loading...');
    
    // Set theme and profile
    this.assetManager.setTheme(theme);
    
    // Load core packs in dependency order
    const corePackNames = [
      'Runner_Core',
      'Lane_Tiles_Core', 
      'Obstacles_Core',
      'Pickups_Core',
      'UI_Core',
      'Audio_Core',
      'VFX_Core'
    ];

    // Load core assets
    for (const packName of corePackNames) {
      await this.loadAssetPack(packName);
    }

    // Load theme-specific assets
    if (theme === 'diwali-night') {
      await this.loadAssetPack('Diwali_Night');
      await this.initializeDiwaliTheme();
    }

    console.log('All game assets loaded successfully!');
  }

  private async loadAssetPack(packName: string): Promise<void> {
    const pack = CorePacks.getPack(packName);
    if (!pack) {
      console.warn(`Asset pack not found: ${packName}`);
      return;
    }

    console.log(`Loading asset pack: ${packName}`);
    
    const totalAssets = pack.assets.length;
    let loadedAssets = 0;

    for (const asset of pack.assets) {
      try {
        await this.loadIndividualAsset(asset, pack);
        loadedAssets++;
        this.notifyProgress(packName, loadedAssets, totalAssets);
      } catch (error) {
        console.warn(`Failed to load asset ${asset.id}:`, error);
        loadedAssets++; // Still count as processed
        this.notifyProgress(packName, loadedAssets, totalAssets);
      }
    }
  }

  private async loadIndividualAsset(asset: any, pack: AssetPack): Promise<void> {
    const profile = this.profileManager.getProfileConfig();
    
    switch (asset.type) {
      case 'texture':
        await this.loadTextureAsset(asset, profile);
        break;
      
      case 'model':
        await this.loadModelAsset(asset, profile);
        break;
      
      case 'audio':
        await this.loadAudioAsset(asset, profile);
        break;
      
      case 'geometry':
        await this.loadGeometryAsset(asset, profile);
        break;
      
      case 'material':
        await this.loadMaterialAsset(asset, profile);
        break;
      
      default:
        console.warn(`Unknown asset type: ${asset.type}`);
    }
  }

  private async loadTextureAsset(asset: any, profile: any): Promise<void> {
    const textureSize = this.profileManager.getTextureSize(2048);
    const texturePath = `${asset.path}_${textureSize}.jpg`;
    
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        texturePath,
        (texture) => {
          // Apply profile-specific settings
          texture.generateMipmaps = profile.lodLevel === 0;
          texture.minFilter = profile.lodLevel === 0 ? 
            THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
          
          // Store in asset manager
          this.assetManager['loadedAssets'].set(asset.id, texture);
          resolve();
        },
        undefined,
        (error) => {
          // Try fallback resolution
          this.loadFallbackTexture(asset.id).then(resolve).catch(reject);
        }
      );
    });
  }

  private async loadModelAsset(asset: any, profile: any): Promise<void> {
    // For now, create placeholder geometries
    // In a real implementation, you'd use GLTFLoader
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);
    
    this.assetManager['loadedAssets'].set(asset.id, mesh);
  }

  private async loadAudioAsset(asset: any, profile: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.AudioLoader();
      loader.load(
        `${asset.path}`,
        (audioBuffer) => {
          this.assetManager['loadedAssets'].set(asset.id, audioBuffer);
          resolve();
        },
        undefined,
        (error) => {
          console.warn(`Failed to load audio: ${asset.id}`);
          resolve(); // Don't fail the entire loading process
        }
      );
    });
  }

  private async loadGeometryAsset(asset: any, profile: any): Promise<void> {
    // Create procedural geometry based on metadata
    let geometry: THREE.BufferGeometry;
    
    if (asset.id.includes('pit')) {
      const { depth = 2, width = 3 } = asset.metadata || {};
      geometry = new THREE.BoxGeometry(width, depth, width);
    } else {
      geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    this.assetManager['loadedAssets'].set(asset.id, geometry);
  }

  private async loadMaterialAsset(asset: any, profile: any): Promise<void> {
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.0
    });
    
    this.assetManager['loadedAssets'].set(asset.id, material);
  }

  private async loadFallbackTexture(assetId: string): Promise<void> {
    // Create a procedural fallback texture
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Create a checkerboard pattern
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillRect(32, 32, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    this.assetManager['loadedAssets'].set(assetId, texture);
  }

  private async initializeDiwaliTheme(): Promise<void> {
    this.currentTheme = new DiwaliTheme(this.scene);
    await this.currentTheme.initialize();
    
    // Add skyline to scene
    const skyline = this.currentTheme.createSkylineSilhouette();
    this.scene.add(skyline);
  }

  public createPickup(type: string, position: THREE.Vector3): THREE.Mesh | null {
    if (this.currentTheme && type.startsWith('diwali-')) {
      const diwaliType = type.replace('diwali-', '') as any;
      return this.currentTheme.createDiwaliPickup(diwaliType, position);
    }
    
    // Create standard pickup
    const geometry = new THREE.SphereGeometry(0.3);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const pickup = new THREE.Mesh(geometry, material);
    pickup.position.copy(position);
    pickup.userData = { type };
    
    return pickup;
  }

  public getAsset(id: string): any {
    return this.assetManager['loadedAssets'].get(id);
  }

  public getMaterial(name: string): THREE.Material {
    return this.assetManager.getMaterial(name);
  }

  public update(deltaTime: number): void {
    if (this.currentTheme) {
      this.currentTheme.update(deltaTime);
    }
  }

  public dispose(): void {
    if (this.currentTheme) {
      this.currentTheme.dispose();
    }
    
    // Dispose all loaded assets
    this.assetManager['loadedAssets'].forEach((asset, key) => {
      if (asset.dispose) {
        asset.dispose();
      }
    });
    
    this.assetManager['loadedAssets'].clear();
  }

  public getLoadingStats(): { totalPacks: number; loadedPacks: number } {
    const totalPacks = CorePacks.getAllPacks().length;
    // This would track actual loading progress in a real implementation
    return { totalPacks, loadedPacks: totalPacks };
  }

  public preloadCriticalAssets(): Promise<void> {
    // Load only essential assets for immediate gameplay
    const criticalPacks = ['Runner_Core', 'Lane_Tiles_Core', 'UI_Core'];
    
    return Promise.all(
      criticalPacks.map(pack => this.loadAssetPack(pack))
    ).then(() => {
      console.log('Critical assets preloaded');
    });
  }

  public async optimizeForDevice(): Promise<void> {
    // Run performance benchmark and adjust settings
    await this.profileManager.optimizeForTarget(30);
    
    // Reload assets with new profile if needed
    const currentProfile = this.profileManager.getCurrentProfile();
    console.log(`Optimized for device, using profile: ${currentProfile}`);
  }
}