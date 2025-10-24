import * as THREE from 'three';
import { navigateTo } from '@devvit/client';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';

// Import our modular Three.js components
import { makeRenderer } from './three/scene/renderer';
import { makeScene, getMainObject } from './three/scene/scene';
import { makeCamera } from './three/scene/camera';
import { createRenderLoop } from './three/systems/render-loop';
import { createResizeHandler } from './three/systems/resize-handler';
import { setupHMRCleanup, hmrCleanup } from './three/utils/cleanup';
import { DEFAULT_CONFIG } from './three/constants';

// UI Elements
const titleElement = document.getElementById('title') as HTMLHeadingElement;
const counterValueElement = document.getElementById('counter-value') as HTMLSpanElement;

const docsLink = document.getElementById('docs-link');
const playtestLink = document.getElementById('playtest-link');
const discordLink = document.getElementById('discord-link');

docsLink?.addEventListener('click', () => navigateTo('https://developers.reddit.com/docs'));
playtestLink?.addEventListener('click', () => navigateTo('https://www.reddit.com/r/Devvit'));
discordLink?.addEventListener('click', () => navigateTo('https://discord.com/invite/R7yu2wh9Qz'));

let currentPostId: string | null = null;

// API Functions
async function fetchInitialCount(): Promise<void> {
  try {
    const response = await fetch('/api/init');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = (await response.json()) as InitResponse;
    if (data.type === 'init') {
      counterValueElement.textContent = data.count.toString();
      currentPostId = data.postId;
      titleElement.textContent = `Hey ${data.username} 👋`;
    } else {
      counterValueElement.textContent = 'Error';
    }
  } catch (err) {
    console.error('Error fetching initial count:', err);
    counterValueElement.textContent = 'Error';
  }
}

async function updateCounter(action: 'increment' | 'decrement'): Promise<void> {
  if (!currentPostId) return;
  try {
    const response = await fetch(`/api/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = (await response.json()) as IncrementResponse | DecrementResponse;
    counterValueElement.textContent = data.count.toString();
  } catch (err) {
    console.error(`Error ${action}ing count:`, err);
  }
}

/**
 * Enhanced Three.js Application using modular architecture
 */
class DevvitThreeJSApp {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderLoop: any = null;
  private resizeHandler: any = null;
  private mainObject: THREE.Mesh | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private scaleVelocity = 0;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    try {
      // Setup HMR cleanup
      setupHMRCleanup();
      
      // Create renderer using our modular system
      const container = canvas.parentElement!;
      this.renderer = makeRenderer(container, DEFAULT_CONFIG.renderer);
      hmrCleanup.add(() => this.renderer?.dispose());
      
      // Create scene with TorusKnot instead of Earth
      this.scene = makeScene(DEFAULT_CONFIG.scene);
      
      // Create camera
      const aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera = makeCamera(aspect, DEFAULT_CONFIG.camera);
      
      // Get main interactive object (TorusKnot)
      this.mainObject = getMainObject(this.scene);
      
      // Create render loop with update callback
      this.renderLoop = createRenderLoop(
        this.renderer,
        this.scene,
        this.camera,
        DEFAULT_CONFIG.performance,
        this.onUpdate.bind(this)
      );
      hmrCleanup.add(() => this.renderLoop?.dispose());
      
      // Create resize handler
      this.resizeHandler = createResizeHandler(
        this.renderer,
        this.camera
      );
      this.resizeHandler.observe(container);
      hmrCleanup.add(() => this.resizeHandler?.dispose());
      
      // Setup interaction
      this.setupInteraction(canvas);
      
      // Start render loop
      this.renderLoop.start();
      
      console.log('Devvit Three.js application initialized with modular architecture');
      
    } catch (error) {
      console.error('Failed to initialize Three.js application:', error);
      throw error;
    }
  }
  
  private onUpdate(_deltaTime: number): void {
    if (!this.mainObject) return;
    
    // Rotate the TorusKnot
    this.mainObject.rotation.x += 0.01;
    this.mainObject.rotation.y += 0.02;
    
    // Handle bounce animation
    if (this.scaleVelocity !== 0) {
      const currentScale = this.mainObject.scale.x;
      const newScale = currentScale + this.scaleVelocity;
      
      this.mainObject.scale.set(newScale, newScale, newScale);
      
      if (newScale >= 1.2) {
        this.scaleVelocity = -0.04;
      }
      if (newScale <= 1) {
        this.mainObject.scale.set(1, 1, 1);
        this.scaleVelocity = 0;
      }
    }
  }
  
  private setupInteraction(canvas: HTMLCanvasElement): void {
    const handleClick = (event: PointerEvent) => {
      if (!this.camera || !this.scene || !this.mainObject) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Perform raycasting
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObject(this.mainObject);
      
      if (intersects.length > 0) {
        // Start bounce animation
        this.scaleVelocity = 0.05;
        console.log('TorusKnot clicked! Incrementing counter...');
        
        // Update counter via API
        void updateCounter('increment');
      }
    };
    
    canvas.addEventListener('pointerdown', handleClick);
    hmrCleanup.add(() => canvas.removeEventListener('pointerdown', handleClick));
  }
  
  getFPS(): number {
    return this.renderLoop?.getFPS() || 0;
  }
  
  dispose(): void {
    hmrCleanup.cleanup();
  }
}

// Initialize the enhanced application
async function initApp(): Promise<void> {
  const canvas = document.getElementById('bg') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element #bg not found');
    return;
  }
  
  const app = new DevvitThreeJSApp();
  await app.init(canvas);
  
  // Make app globally available for debugging
  if (typeof window !== 'undefined') {
    (window as any).threeApp = app;
  }
  
  // Fetch initial data
  await fetchInitialCount();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  void initApp();
}
