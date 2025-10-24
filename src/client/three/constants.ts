// Application constants
export const DEFAULT_CONFIG = {
  renderer: {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' as const,
    maxPixelRatio: 2,
  },
  scene: {
    background: null,
    fog: null,
    lighting: {
      ambient: {
        color: 0x404040,
        intensity: 0.4,
      },
      directional: {
        color: 0xffffff,
        intensity: 1,
        position: [10, 10, 5] as [number, number, number],
      },
    },
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5] as [number, number, number],
  },
  performance: {
    maxPixelRatio: 2,
    maxDeltaTime: 1 / 30, // Cap at 30fps minimum
    targetFPS: 60,
  },
} as const;
