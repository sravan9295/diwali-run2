// Shared TypeScript definitions
import * as THREE from 'three';

export interface RendererConfig {
  antialias: boolean;
  alpha: boolean;
  powerPreference: 'high-performance' | 'low-power' | 'default';
  maxPixelRatio: number;
}

export interface SceneConfig {
  background: THREE.Color | null;
  fog: THREE.Fog | null;
  lighting: LightingConfig;
}

export interface LightingConfig {
  ambient: {
    color: number;
    intensity: number;
  };
  directional: {
    color: number;
    intensity: number;
    position: [number, number, number];
  };
}

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: [number, number, number];
}

export interface PerformanceConfig {
  maxPixelRatio: number;
  maxDeltaTime: number;
  targetFPS: number;
}

export interface AppConfig {
  renderer: RendererConfig;
  scene: SceneConfig;
  camera: CameraConfig;
  performance: PerformanceConfig;
}

export interface RenderLoopSystem {
  start(): void;
  stop(): void;
  dispose(): void;
}

export interface ResizeHandlerSystem {
  observe(element: HTMLElement): void;
  disconnect(): void;
  dispose(): void;
}

export interface AppState {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderLoop: RenderLoopSystem | null;
  resizeHandler: ResizeHandlerSystem | null;
  isInitialized: boolean;
}
