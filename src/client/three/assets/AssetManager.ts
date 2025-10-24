import * as THREE from 'three';

export interface AssetManifest {
  core: CoreAssets;
  themes: Record<string, ThemeAssets>;
  profiles: Record<string, ProfileConfig>;
}

export interface CoreAssets {
  runner: string[];
  lanes: string[];
  obstacles: string[];
  pickups: string[];
  ui: string[];
  audio: string[];
  vfx: string[];
}

export interface ThemeAssets {
  overrides: string[];
  additions: string[];
  materials: Record<string, MaterialConfig>;
  lighting: LightingConfig;
  skybox?: string;
}

export interface ProfileConfig {
  textureSize: number;
  lodLevel: number;
  particleCount: number;
  enableBloom: boolean;
  shadowQuality: 'low' | 'medium' | 'high';
}

export interface MaterialConfig {
  diffuse?: string;
  normal?: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
}

export interface LightingConfig {
  ambient: { color: string; intensity: number };
  directional: { color: string; intensity: number; position: [number, number, number] };
  point?: Array<{ color: string; intensity: number; position: [number, number, number] }>;
}

export class AssetManager {
  private static instance: AssetManager;
  private manifest: AssetManifest;
  private loadedAssets: Map<string, any> = new Map();
  private currentTheme: string = 'default';
  private currentProfile: string = 'mid-range';
  private textureLoader: THREE.TextureLoader;
  private audioLoader: THREE.AudioLoader;

  private constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.manifest = this.getDefaultManifest();
  }

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  public setTheme(theme: string): void {
    this.currentTheme = theme;
  }

  public setProfile(profile: string): void {
    this.currentProfile = profile;
  }

  public async loadAssetPack(packName: keyof CoreAssets): Promise<void> {
    const coreAssets = this.manifest.core[packName];
    const themeOverrides = this.manifest.themes[this.currentTheme]?.overrides || [];
    const profile = this.manifest.profiles[this.currentProfile];

    for (const assetName of coreAssets) {
      await this.loadAsset(packName, assetName, profile);
    }

    // Load theme overrides
    for (const override of themeOverrides) {
      if (coreAssets.includes(override)) {
        await this.loadThemeAsset(packName, override, profile);
      }
    }
  }

  private async loadAsset(pack: string, asset: string, profile: ProfileConfig): Promise<void> {
    const assetKey = `${pack}/${asset}`;
    
    if (this.loadedAssets.has(assetKey)) {
      return;
    }

    try {
      const assetPath = this.getAssetPath(pack, asset, profile);
      
      if (pack === 'audio') {
        const audioBuffer = await this.loadAudio(assetPath);
        this.loadedAssets.set(assetKey, audioBuffer);
      } else {
        const texture = await this.loadTexture(assetPath, profile);
        this.loadedAssets.set(assetKey, texture);
      }
    } catch (error) {
      console.warn(`Failed to load asset ${assetKey}:`, error);
      // Load fallback asset
      await this.loadFallbackAsset(pack, asset);
    }
  }

  private async loadThemeAsset(pack: string, asset: string, profile: ProfileConfig): Promise<void> {
    const themeAssetKey = `${this.currentTheme}/${pack}/${asset}`;
    const assetPath = this.getThemeAssetPath(pack, asset, profile);
    
    try {
      if (pack === 'audio') {
        const audioBuffer = await this.loadAudio(assetPath);
        this.loadedAssets.set(themeAssetKey, audioBuffer);
      } else {
        const texture = await this.loadTexture(assetPath, profile);
        this.loadedAssets.set(themeAssetKey, texture);
      }
    } catch (error) {
      console.warn(`Failed to load theme asset ${themeAssetKey}:`, error);
    }
  }

  private async loadTexture(path: string, profile: ProfileConfig): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          // Apply profile settings
          texture.generateMipmaps = profile.lodLevel === 0;
          texture.minFilter = profile.lodLevel === 0 ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  private async loadAudio(path: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(path, resolve, undefined, reject);
    });
  }

  private async loadFallbackAsset(pack: string, asset: string): Promise<void> {
    const fallbackKey = `fallback/${pack}/${asset}`;
    // Create a simple colored texture as fallback
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ff00ff'; // Magenta to indicate missing asset
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    this.loadedAssets.set(`${pack}/${asset}`, texture);
  }

  public getAsset(pack: string, asset: string): any {
    // Try theme-specific asset first
    const themeAssetKey = `${this.currentTheme}/${pack}/${asset}`;
    if (this.loadedAssets.has(themeAssetKey)) {
      return this.loadedAssets.get(themeAssetKey);
    }
    
    // Fall back to core asset
    const coreAssetKey = `${pack}/${asset}`;
    return this.loadedAssets.get(coreAssetKey);
  }

  public getMaterial(materialName: string): THREE.Material {
    const themeConfig = this.manifest.themes[this.currentTheme];
    const materialConfig = themeConfig?.materials[materialName];
    
    if (!materialConfig) {
      return new THREE.MeshStandardMaterial({ color: 0xffffff });
    }

    const material = new THREE.MeshStandardMaterial({
      roughness: materialConfig.roughness || 0.5,
      metalness: materialConfig.metalness || 0.0,
    });

    if (materialConfig.diffuse) {
      material.map = this.getAsset('materials', materialConfig.diffuse);
    }

    if (materialConfig.normal) {
      material.normalMap = this.getAsset('materials', materialConfig.normal);
    }

    if (materialConfig.emissive) {
      material.emissiveMap = this.getAsset('materials', materialConfig.emissive);
      material.emissive = new THREE.Color(0x444444);
    }

    return material;
  }

  private getAssetPath(pack: string, asset: string, profile: ProfileConfig): string {
    const size = profile.textureSize;
    return `/assets/core/${pack}/${asset}_${size}.jpg`;
  }

  private getThemeAssetPath(pack: string, asset: string, profile: ProfileConfig): string {
    const size = profile.textureSize;
    return `/assets/themes/${this.currentTheme}/${pack}/${asset}_${size}.jpg`;
  }

  private getDefaultManifest(): AssetManifest {
    return {
      core: {
        runner: ['idle', 'run', 'jump', 'slide', 'death'],
        lanes: ['straight', 'curve-left', 'curve-right', 'junction'],
        obstacles: ['barrier', 'cone', 'truck', 'pit'],
        pickups: ['coin', 'magnet', 'multiplier', 'shield'],
        ui: ['hud-bg', 'button-play', 'button-pause', 'score-bg'],
        audio: ['jump', 'coin', 'crash', 'powerup', 'background'],
        vfx: ['dust', 'sparks', 'explosion', 'trail']
      },
      themes: {
        'diwali-night': {
          overrides: ['straight', 'curve-left', 'curve-right'],
          additions: ['diya', 'firework', 'rangoli', 'sparkler'],
          materials: {
            'diya-glow': {
              diffuse: 'diya-base',
              emissive: 'diya-glow',
              roughness: 0.3,
              metalness: 0.1
            },
            'firework-trail': {
              emissive: 'firework-particle',
              roughness: 0.0,
              metalness: 0.0
            }
          },
          lighting: {
            ambient: { color: '#2a1810', intensity: 0.3 },
            directional: { color: '#ff6b35', intensity: 0.8, position: [5, 10, 5] },
            point: [
              { color: '#ffaa00', intensity: 1.0, position: [0, 2, 0] },
              { color: '#ff4444', intensity: 0.5, position: [-3, 1, 2] }
            ]
          }
        },
        'default': {
          overrides: [],
          additions: [],
          materials: {},
          lighting: {
            ambient: { color: '#404040', intensity: 0.4 },
            directional: { color: '#ffffff', intensity: 1.0, position: [5, 10, 5] }
          }
        }
      },
      profiles: {
        'low-end': {
          textureSize: 512,
          lodLevel: 1,
          particleCount: 50,
          enableBloom: false,
          shadowQuality: 'low'
        },
        'mid-range': {
          textureSize: 1024,
          lodLevel: 0,
          particleCount: 100,
          enableBloom: true,
          shadowQuality: 'medium'
        },
        'high-end': {
          textureSize: 2048,
          lodLevel: 0,
          particleCount: 200,
          enableBloom: true,
          shadowQuality: 'high'
        }
      }
    };
  }
}