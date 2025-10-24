import * as THREE from 'three';
import { AssetManager } from '../AssetManager';

export interface AssetPack {
  name: string;
  version: string;
  dependencies: string[];
  assets: AssetDefinition[];
}

export interface AssetDefinition {
  id: string;
  type: 'texture' | 'geometry' | 'material' | 'audio' | 'model';
  path: string;
  metadata?: Record<string, any>;
}

export class CorePacks {
  private static packs: Map<string, AssetPack> = new Map();

  public static registerPack(pack: AssetPack): void {
    this.packs.set(pack.name, pack);
  }

  public static getPack(name: string): AssetPack | undefined {
    return this.packs.get(name);
  }

  public static getAllPacks(): AssetPack[] {
    return Array.from(this.packs.values());
  }

  public static initializeCorePacks(): void {
    // Runner Core Pack
    this.registerPack({
      name: 'Runner_Core',
      version: '1.0.0',
      dependencies: [],
      assets: [
        {
          id: 'runner-idle',
          type: 'texture',
          path: 'core/runner/idle',
          metadata: { frames: 4, fps: 8 }
        },
        {
          id: 'runner-run',
          type: 'texture',
          path: 'core/runner/run',
          metadata: { frames: 8, fps: 12 }
        },
        {
          id: 'runner-jump',
          type: 'texture',
          path: 'core/runner/jump',
          metadata: { frames: 6, fps: 10 }
        },
        {
          id: 'runner-slide',
          type: 'texture',
          path: 'core/runner/slide',
          metadata: { frames: 4, fps: 8 }
        },
        {
          id: 'runner-death',
          type: 'texture',
          path: 'core/runner/death',
          metadata: { frames: 6, fps: 8 }
        }
      ]
    });

    // Lane Tiles Core Pack
    this.registerPack({
      name: 'Lane_Tiles_Core',
      version: '1.0.0',
      dependencies: [],
      assets: [
        {
          id: 'lane-straight',
          type: 'model',
          path: 'core/lanes/straight.glb',
          metadata: { length: 10, width: 3 }
        },
        {
          id: 'lane-curve-left',
          type: 'model',
          path: 'core/lanes/curve-left.glb',
          metadata: { angle: -45, radius: 8 }
        },
        {
          id: 'lane-curve-right',
          type: 'model',
          path: 'core/lanes/curve-right.glb',
          metadata: { angle: 45, radius: 8 }
        },
        {
          id: 'lane-junction',
          type: 'model',
          path: 'core/lanes/junction.glb',
          metadata: { branches: 2 }
        },
        {
          id: 'lane-texture',
          type: 'texture',
          path: 'core/lanes/asphalt',
          metadata: { tiling: [4, 1] }
        }
      ]
    });

    // Obstacles Core Pack
    this.registerPack({
      name: 'Obstacles_Core',
      version: '1.0.0',
      dependencies: ['Lane_Tiles_Core'],
      assets: [
        {
          id: 'obstacle-barrier',
          type: 'model',
          path: 'core/obstacles/barrier.glb',
          metadata: { height: 1.5, destructible: false }
        },
        {
          id: 'obstacle-cone',
          type: 'model',
          path: 'core/obstacles/cone.glb',
          metadata: { height: 0.8, destructible: true }
        },
        {
          id: 'obstacle-truck',
          type: 'model',
          path: 'core/obstacles/truck.glb',
          metadata: { width: 2.5, moving: true, speed: 2 }
        },
        {
          id: 'obstacle-pit',
          type: 'geometry',
          path: 'core/obstacles/pit',
          metadata: { depth: 2, width: 3 }
        }
      ]
    });

    // Pickups Core Pack
    this.registerPack({
      name: 'Pickups_Core',
      version: '1.0.0',
      dependencies: [],
      assets: [
        {
          id: 'pickup-coin',
          type: 'model',
          path: 'core/pickups/coin.glb',
          metadata: { value: 10, animation: 'spin' }
        },
        {
          id: 'pickup-magnet',
          type: 'model',
          path: 'core/pickups/magnet.glb',
          metadata: { duration: 5, range: 3 }
        },
        {
          id: 'pickup-multiplier',
          type: 'model',
          path: 'core/pickups/multiplier.glb',
          metadata: { multiplier: 2, duration: 10 }
        },
        {
          id: 'pickup-shield',
          type: 'model',
          path: 'core/pickups/shield.glb',
          metadata: { duration: 8, invulnerable: true }
        }
      ]
    });

    // UI Core Pack
    this.registerPack({
      name: 'UI_Core',
      version: '1.0.0',
      dependencies: [],
      assets: [
        {
          id: 'ui-hud-background',
          type: 'texture',
          path: 'core/ui/hud-bg',
          metadata: { ninePatch: true }
        },
        {
          id: 'ui-button-play',
          type: 'texture',
          path: 'core/ui/btn-play',
          metadata: { states: ['normal', 'hover', 'pressed'] }
        },
        {
          id: 'ui-button-pause',
          type: 'texture',
          path: 'core/ui/btn-pause',
          metadata: { states: ['normal', 'hover', 'pressed'] }
        },
        {
          id: 'ui-score-display',
          type: 'texture',
          path: 'core/ui/score-bg',
          metadata: { font: 'digital', size: 24 }
        },
        {
          id: 'ui-progress-bar',
          type: 'texture',
          path: 'core/ui/progress',
          metadata: { fillDirection: 'horizontal' }
        }
      ]
    });

    // Audio Core Pack
    this.registerPack({
      name: 'Audio_Core',
      version: '1.0.0',
      dependencies: [],
      assets: [
        {
          id: 'audio-jump',
          type: 'audio',
          path: 'core/audio/jump.ogg',
          metadata: { volume: 0.7, category: 'sfx' }
        },
        {
          id: 'audio-coin',
          type: 'audio',
          path: 'core/audio/coin.ogg',
          metadata: { volume: 0.5, category: 'sfx' }
        },
        {
          id: 'audio-crash',
          type: 'audio',
          path: 'core/audio/crash.ogg',
          metadata: { volume: 0.8, category: 'sfx' }
        },
        {
          id: 'audio-powerup',
          type: 'audio',
          path: 'core/audio/powerup.ogg',
          metadata: { volume: 0.6, category: 'sfx' }
        },
        {
          id: 'audio-background',
          type: 'audio',
          path: 'core/audio/background.ogg',
          metadata: { volume: 0.3, category: 'music', loop: true }
        }
      ]
    });

    // VFX Core Pack
    this.registerPack({
      name: 'VFX_Core',
      version: '1.0.0',
      dependencies: [],
      assets: [
        {
          id: 'vfx-dust-particle',
          type: 'texture',
          path: 'core/vfx/dust',
          metadata: { particleCount: 50, lifetime: 2 }
        },
        {
          id: 'vfx-sparks-particle',
          type: 'texture',
          path: 'core/vfx/sparks',
          metadata: { particleCount: 30, lifetime: 1.5 }
        },
        {
          id: 'vfx-explosion-particle',
          type: 'texture',
          path: 'core/vfx/explosion',
          metadata: { particleCount: 100, lifetime: 3 }
        },
        {
          id: 'vfx-trail-particle',
          type: 'texture',
          path: 'core/vfx/trail',
          metadata: { particleCount: 20, lifetime: 1 }
        }
      ]
    });
  }
}

// Diwali Night Theme Pack
export const DiwaliNightPack: AssetPack = {
  name: 'Diwali_Night',
  version: '1.0.0',
  dependencies: ['Lane_Tiles_Core', 'Pickups_Core', 'VFX_Core', 'Audio_Core'],
  assets: [
    // Theme-specific lane overrides
    {
      id: 'diwali-lane-straight',
      type: 'model',
      path: 'themes/diwali-night/lanes/straight.glb',
      metadata: { diyas: 6, rangoli: true }
    },
    {
      id: 'diwali-lane-curve-left',
      type: 'model',
      path: 'themes/diwali-night/lanes/curve-left.glb',
      metadata: { diyas: 4, sparklers: 2 }
    },
    {
      id: 'diwali-lane-curve-right',
      type: 'model',
      path: 'themes/diwali-night/lanes/curve-right.glb',
      metadata: { diyas: 4, sparklers: 2 }
    },

    // Cultural pickups
    {
      id: 'pickup-share-diya',
      type: 'model',
      path: 'themes/diwali-night/pickups/share-diya.glb',
      metadata: { effect: 'heal', value: 25, glow: true }
    },
    {
      id: 'pickup-phooljhadi-boost',
      type: 'model',
      path: 'themes/diwali-night/pickups/phooljhadi.glb',
      metadata: { effect: 'speed-trail', duration: 8, sparkles: true }
    },
    {
      id: 'pickup-rangoli-shield',
      type: 'model',
      path: 'themes/diwali-night/pickups/rangoli.glb',
      metadata: { effect: 'aoe-protection', duration: 10, radius: 5 }
    },

    // Skyline and environment
    {
      id: 'diwali-skyline',
      type: 'model',
      path: 'themes/diwali-night/environment/skyline.glb',
      metadata: { buildings: 12, diyaLights: 30 }
    },
    {
      id: 'diwali-ground',
      type: 'texture',
      path: 'themes/diwali-night/environment/ground',
      metadata: { rangoli: true, tiling: [2, 2] }
    },

    // VFX overrides
    {
      id: 'vfx-sparkler-trail',
      type: 'texture',
      path: 'themes/diwali-night/vfx/sparkler',
      metadata: { particleCount: 80, color: 'gold', lifetime: 2.5 }
    },
    {
      id: 'vfx-firework-burst',
      type: 'texture',
      path: 'themes/diwali-night/vfx/firework',
      metadata: { particleCount: 150, colors: ['gold', 'magenta', 'red'], lifetime: 4 }
    },
    {
      id: 'vfx-diya-glow',
      type: 'texture',
      path: 'themes/diwali-night/vfx/diya-glow',
      metadata: { particleCount: 20, color: 'warm-orange', lifetime: 'infinite' }
    },

    // Audio stems
    {
      id: 'audio-shehnai-melody',
      type: 'audio',
      path: 'themes/diwali-night/audio/shehnai.ogg',
      metadata: { volume: 0.4, category: 'music', loop: true, cultural: true }
    },
    {
      id: 'audio-dhol-rhythm',
      type: 'audio',
      path: 'themes/diwali-night/audio/dhol.ogg',
      metadata: { volume: 0.3, category: 'music', loop: true, cultural: true }
    },
    {
      id: 'audio-firework-burst',
      type: 'audio',
      path: 'themes/diwali-night/audio/firework.ogg',
      metadata: { volume: 0.6, category: 'sfx', variations: 3 }
    },
    {
      id: 'audio-diya-light',
      type: 'audio',
      path: 'themes/diwali-night/audio/diya-light.ogg',
      metadata: { volume: 0.4, category: 'sfx', peaceful: true }
    }
  ]
};

// Initialize all core packs
CorePacks.initializeCorePacks();
CorePacks.registerPack(DiwaliNightPack);