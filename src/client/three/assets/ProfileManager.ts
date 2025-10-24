import { AssetManager, ProfileConfig } from './AssetManager';

export interface DeviceCapabilities {
  gpu: string;
  memory: number;
  cores: number;
  isMobile: boolean;
  supportsWebGL2: boolean;
}

export class ProfileManager {
  private static instance: ProfileManager;
  private assetManager: AssetManager;
  private currentProfile: string = 'mid-range';
  private deviceCapabilities: DeviceCapabilities;

  private constructor() {
    this.assetManager = AssetManager.getInstance();
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.autoSelectProfile();
  }

  public static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    const capabilities: DeviceCapabilities = {
      gpu: 'unknown',
      memory: (navigator as any).deviceMemory || 4, // GB, fallback to 4GB
      cores: navigator.hardwareConcurrency || 4,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      supportsWebGL2: !!canvas.getContext('webgl2')
    };

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        capabilities.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
      }
    }

    return capabilities;
  }

  private autoSelectProfile(): void {
    const { gpu, memory, cores, isMobile } = this.deviceCapabilities;
    
    // Mobile devices default to low-end
    if (isMobile) {
      this.setProfile('low-end');
      return;
    }

    // Desktop profiling based on specs
    const gpuScore = this.getGPUScore(gpu);
    const memoryScore = memory >= 8 ? 2 : memory >= 4 ? 1 : 0;
    const coreScore = cores >= 8 ? 2 : cores >= 4 ? 1 : 0;
    
    const totalScore = gpuScore + memoryScore + coreScore;
    
    if (totalScore >= 5) {
      this.setProfile('high-end');
    } else if (totalScore >= 3) {
      this.setProfile('mid-range');
    } else {
      this.setProfile('low-end');
    }
  }

  private getGPUScore(gpu: string): number {
    const gpuLower = gpu.toLowerCase();
    
    // High-end GPUs
    if (gpuLower.includes('rtx') || 
        gpuLower.includes('gtx 1080') || 
        gpuLower.includes('gtx 1070') ||
        gpuLower.includes('rx 6') ||
        gpuLower.includes('rx 7')) {
      return 3;
    }
    
    // Mid-range GPUs
    if (gpuLower.includes('gtx 1060') || 
        gpuLower.includes('gtx 1050') ||
        gpuLower.includes('rx 5') ||
        gpuLower.includes('intel iris')) {
      return 2;
    }
    
    // Low-end or integrated
    if (gpuLower.includes('intel hd') || 
        gpuLower.includes('intel uhd') ||
        gpuLower.includes('vega')) {
      return 1;
    }
    
    return 0; // Unknown or very low-end
  }

  public setProfile(profileName: string): void {
    this.currentProfile = profileName;
    this.assetManager.setProfile(profileName);
    console.log(`Performance profile set to: ${profileName}`);
    this.logProfileDetails();
  }

  public getCurrentProfile(): string {
    return this.currentProfile;
  }

  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  public getProfileConfig(profileName?: string): ProfileConfig {
    const profile = profileName || this.currentProfile;
    const manifest = (this.assetManager as any).manifest;
    return manifest.profiles[profile];
  }

  public shouldUseFeature(feature: string): boolean {
    const config = this.getProfileConfig();
    
    switch (feature) {
      case 'bloom':
        return config.enableBloom;
      
      case 'shadows':
        return config.shadowQuality !== 'low';
      
      case 'particles':
        return config.particleCount > 50;
      
      case 'antialiasing':
        return this.currentProfile !== 'low-end';
      
      case 'postprocessing':
        return this.currentProfile === 'high-end';
      
      default:
        return true;
    }
  }

  public getParticleCount(baseCount: number): number {
    const config = this.getProfileConfig();
    const multiplier = config.particleCount / 100; // Base is 100 particles
    return Math.floor(baseCount * multiplier);
  }

  public getTextureSize(baseSize: number): number {
    const config = this.getProfileConfig();
    return Math.min(baseSize, config.textureSize);
  }

  public getLODLevel(): number {
    const config = this.getProfileConfig();
    return config.lodLevel;
  }

  public getShadowMapSize(): number {
    const config = this.getProfileConfig();
    
    switch (config.shadowQuality) {
      case 'low': return 512;
      case 'medium': return 1024;
      case 'high': return 2048;
      default: return 1024;
    }
  }

  public getAntialiasing(): boolean {
    return this.currentProfile !== 'low-end';
  }

  public adaptForPerformance<T>(options: {
    lowEnd: T;
    midRange: T;
    highEnd: T;
  }): T {
    switch (this.currentProfile) {
      case 'low-end': return options.lowEnd;
      case 'mid-range': return options.midRange;
      case 'high-end': return options.highEnd;
      default: return options.midRange;
    }
  }

  private logProfileDetails(): void {
    const config = this.getProfileConfig();
    const caps = this.deviceCapabilities;
    
    console.group('Performance Profile Details');
    console.log('Profile:', this.currentProfile);
    console.log('Device Capabilities:', caps);
    console.log('Profile Config:', config);
    console.log('Features Enabled:', {
      bloom: this.shouldUseFeature('bloom'),
      shadows: this.shouldUseFeature('shadows'),
      particles: this.shouldUseFeature('particles'),
      antialiasing: this.shouldUseFeature('antialiasing'),
      postprocessing: this.shouldUseFeature('postprocessing')
    });
    console.groupEnd();
  }

  public benchmarkPerformance(): Promise<string> {
    return new Promise((resolve) => {
      // Simple performance benchmark
      const startTime = performance.now();
      let frames = 0;
      
      const benchmark = () => {
        frames++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < 1000) {
          requestAnimationFrame(benchmark);
        } else {
          const fps = frames / (elapsed / 1000);
          let recommendedProfile: string;
          
          if (fps >= 50) {
            recommendedProfile = 'high-end';
          } else if (fps >= 30) {
            recommendedProfile = 'mid-range';
          } else {
            recommendedProfile = 'low-end';
          }
          
          console.log(`Benchmark: ${fps.toFixed(1)} FPS, recommended: ${recommendedProfile}`);
          resolve(recommendedProfile);
        }
      };
      
      requestAnimationFrame(benchmark);
    });
  }

  public async optimizeForTarget(targetFPS: number = 30): Promise<void> {
    const currentProfile = this.getCurrentProfile();
    const benchmarkProfile = await this.benchmarkPerformance();
    
    // If benchmark suggests lower profile than current, switch
    const profiles = ['low-end', 'mid-range', 'high-end'];
    const currentIndex = profiles.indexOf(currentProfile);
    const benchmarkIndex = profiles.indexOf(benchmarkProfile);
    
    if (benchmarkIndex < currentIndex) {
      this.setProfile(benchmarkProfile);
      console.log(`Automatically downgraded to ${benchmarkProfile} for better performance`);
    }
  }
}