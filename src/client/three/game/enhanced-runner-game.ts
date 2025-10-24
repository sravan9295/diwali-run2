import * as THREE from 'three';
import { GameAssetLoader } from '../assets/GameAssetLoader';
import { ProfileManager } from '../assets/ProfileManager';

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  speed: number;
  lives: number;
  gameOver: boolean;
  theme: string;
}

export interface GameObject {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  update(deltaTime: number): void;
  dispose(): void;
}

export class EnhancedPlayer implements GameObject {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  private jumpForce = 15;
  private gravity = -50;
  private groundY = 0;
  private isGrounded = true;
  private lanes = [-2, 0, 2]; // Left, center, right lanes
  private currentLane = 1; // Start in center
  private targetX = 0;
  private moveSpeed = 8;
  private assetLoader: GameAssetLoader;
  private trailParticles?: THREE.Points;

  constructor(assetLoader: GameAssetLoader) {
    this.assetLoader = assetLoader;
    
    // Try to get runner asset, fallback to basic geometry
    const runnerAsset = this.assetLoader.getAsset('runner-idle');
    
    if (runnerAsset) {
      // Use loaded runner model/texture
      const geometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
      const material = new THREE.MeshStandardMaterial({ 
        map: runnerAsset,
        color: 0x00ff88 
      });
      this.mesh = new THREE.Mesh(geometry, material);
    } else {
      // Fallback to basic geometry with Diwali colors
      const geometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0xff6b35, // Diwali orange
        emissive: 0x331100,
        roughness: 0.3
      });
      this.mesh = new THREE.Mesh(geometry, material);
    }
    
    this.mesh.position.set(0, 1, 0);
    this.mesh.castShadow = true;
    this.velocity = new THREE.Vector3(0, 0, 0);
    
    this.createTrailEffect();
  }

  private createTrailEffect(): void {
    // Create sparkler trail effect for Diwali theme
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
      
      // Golden sparkler colors
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.8;
      colors[i3 + 2] = 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    this.trailParticles = new THREE.Points(geometry, material);
    this.mesh.add(this.trailParticles);
  }

  jump(): void {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      
      // Create jump sparkle effect
      this.createJumpEffect();
    }
  }

  private createJumpEffect(): void {
    // Create temporary sparkle effect on jump
    const sparkleCount = 10;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkleCount * 3);
    
    for (let i = 0; i < sparkleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = Math.random() * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 3,
      color: 0xffaa00,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    
    const sparkles = new THREE.Points(geometry, material);
    sparkles.position.copy(this.mesh.position);
    this.mesh.parent?.add(sparkles);
    
    // Animate and remove sparkles
    let opacity = 1.0;
    const animate = () => {
      opacity -= 0.05;
      material.opacity = opacity;
      sparkles.position.y += 0.1;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        this.mesh.parent?.remove(sparkles);
        geometry.dispose();
        material.dispose();
      }
    };
    animate();
  }

  moveLeft(): void {
    if (this.currentLane > 0) {
      this.currentLane--;
      this.targetX = this.lanes[this.currentLane]!;
    }
  }

  moveRight(): void {
    if (this.currentLane < this.lanes.length - 1) {
      this.currentLane++;
      this.targetX = this.lanes[this.currentLane]!;
    }
  }

  update(deltaTime: number): void {
    // Handle lane switching
    const dx = this.targetX - this.mesh.position.x;
    if (Math.abs(dx) > 0.1) {
      this.mesh.position.x += dx * this.moveSpeed * deltaTime;
    } else {
      this.mesh.position.x = this.targetX;
    }

    // Handle jumping and gravity
    if (!this.isGrounded) {
      this.velocity.y += this.gravity * deltaTime;
      this.mesh.position.y += this.velocity.y * deltaTime;

      if (this.mesh.position.y <= this.groundY + 0.6) {
        this.mesh.position.y = this.groundY + 0.6;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    // Add subtle running animation
    this.mesh.rotation.z = Math.sin(Date.now() * 0.01) * 0.1;
    
    // Update trail particles
    if (this.trailParticles) {
      const positions = this.trailParticles.geometry.attributes.position.array as Float32Array;
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] = Math.sin(time + i) * 0.3;
        positions[i + 1] = Math.cos(time + i) * 0.2 - 0.5;
        positions[i + 2] = Math.sin(time * 2 + i) * 0.2 - 1;
      }
      
      this.trailParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  dispose(): void {
    if (this.trailParticles) {
      this.trailParticles.geometry.dispose();
      (this.trailParticles.material as THREE.Material).dispose();
    }
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

export class DiwaliObstacle implements GameObject {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  private glowEffect?: THREE.PointLight;

  constructor(lane: number, z: number, assetLoader: GameAssetLoader) {
    // Try to get obstacle asset
    const obstacleAsset = assetLoader.getAsset('obstacle-barrier');
    
    if (obstacleAsset) {
      this.mesh = obstacleAsset.clone();
    } else {
      // Create Diwali-themed obstacle
      const geometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x8b0000, // Dark red
        emissive: 0x330000,
        roughness: 0.4,
        metalness: 0.1
      });
      this.mesh = new THREE.Mesh(geometry, material);
    }

    const lanes = [-2, 0, 2];
    this.mesh.position.set(lanes[lane]!, 0.75, z);
    this.mesh.castShadow = true;
    this.velocity = new THREE.Vector3(0, 0, 0);
    
    // Add subtle glow effect
    this.glowEffect = new THREE.PointLight(0xff4444, 0.5, 3);
    this.glowEffect.position.set(0, 0.5, 0);
    this.mesh.add(this.glowEffect);
  }

  update(deltaTime: number): void {
    // Obstacles move towards the player
    this.mesh.position.z += this.velocity.z * deltaTime;

    // Add rotation for visual effect
    this.mesh.rotation.y += 2 * deltaTime;
    
    // Animate glow
    if (this.glowEffect) {
      this.glowEffect.intensity = 0.3 + 0.2 * Math.sin(Date.now() * 0.005);
    }
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

export class DiwaliCollectible implements GameObject {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  private type: 'coin' | 'diya' | 'phooljhadi' | 'rangoli';
  private glowEffect?: THREE.PointLight;

  constructor(lane: number, z: number, assetLoader: GameAssetLoader, type?: string) {
    const lanes = [-2, 0, 2];
    
    // Determine collectible type
    const types = ['coin', 'diya', 'phooljhadi', 'rangoli'];
    this.type = (type as any) || types[Math.floor(Math.random() * types.length)] as any;
    
    // Try to get specific Diwali pickup asset
    const assetId = `pickup-${this.type === 'diya' ? 'share-diya' : this.type}`;
    const collectibleAsset = assetLoader.getAsset(assetId);
    
    if (collectibleAsset) {
      this.mesh = collectibleAsset.clone();
    } else {
      // Create themed collectible based on type
      let geometry: THREE.BufferGeometry;
      let material: THREE.Material;
      
      switch (this.type) {
        case 'diya':
          geometry = new THREE.CylinderGeometry(0.2, 0.3, 0.15, 8);
          material = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0x442200,
            roughness: 0.3
          });
          break;
          
        case 'phooljhadi':
          geometry = new THREE.ConeGeometry(0.05, 0.8, 6);
          material = new THREE.MeshStandardMaterial({
            color: 0xff6b35,
            emissive: 0x331100,
            roughness: 0.2
          });
          break;
          
        case 'rangoli':
          geometry = new THREE.RingGeometry(0.2, 0.4, 8);
          material = new THREE.MeshStandardMaterial({
            color: 0xff1493,
            emissive: 0x330033,
            transparent: true,
            opacity: 0.8
          });
          break;
          
        default: // coin
          geometry = new THREE.SphereGeometry(0.3, 8, 6);
          material = new THREE.MeshStandardMaterial({
            color: 0xffdd00,
            emissive: 0x443300,
            metalness: 0.8,
            roughness: 0.2
          });
      }
      
      this.mesh = new THREE.Mesh(geometry, material);
    }

    this.mesh.position.set(lanes[lane]!, 1, z);
    this.velocity = new THREE.Vector3(0, 0, 0);
    
    // Add glow effect based on type
    const glowColors = {
      coin: 0xffdd00,
      diya: 0xffaa00,
      phooljhadi: 0xff6b35,
      rangoli: 0xff1493
    };
    
    this.glowEffect = new THREE.PointLight(glowColors[this.type], 0.8, 4);
    this.glowEffect.position.set(0, 0, 0);
    this.mesh.add(this.glowEffect);
  }

  update(deltaTime: number): void {
    // Collectibles move towards the player
    this.mesh.position.z += this.velocity.z * deltaTime;

    // Add floating animation
    this.mesh.position.y = 1 + Math.sin(Date.now() * 0.005 + this.mesh.position.z) * 0.2;
    this.mesh.rotation.y += 3 * deltaTime;
    
    // Special animations based on type
    switch (this.type) {
      case 'diya':
        // Gentle flickering
        if (this.glowEffect) {
          this.glowEffect.intensity = 0.6 + 0.2 * Math.sin(Date.now() * 0.008);
        }
        break;
        
      case 'phooljhadi':
        // Sparkler effect
        this.mesh.rotation.z += 5 * deltaTime;
        break;
        
      case 'rangoli':
        // Pulsing effect
        const scale = 1 + 0.1 * Math.sin(Date.now() * 0.01);
        this.mesh.scale.setScalar(scale);
        break;
    }
  }

  getType(): string {
    return this.type;
  }

  getValue(): number {
    const values = { coin: 10, diya: 25, phooljhadi: 15, rangoli: 30 };
    return values[this.type] || 10;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

export class EnhancedRunnerGame {
  private scene: THREE.Scene;
  private player: EnhancedPlayer;
  private obstacles: DiwaliObstacle[] = [];
  private collectibles: DiwaliCollectible[] = [];
  private gameState: GameState;
  private spawnTimer = 0;
  private spawnInterval = 2; // seconds
  private ground!: THREE.Mesh;
  private assetLoader: GameAssetLoader;
  private profileManager: ProfileManager;

  constructor(scene: THREE.Scene, assetLoader: GameAssetLoader) {
    this.scene = scene;
    this.assetLoader = assetLoader;
    this.profileManager = ProfileManager.getInstance();
    
    this.gameState = {
      isPlaying: false,
      isPaused: false,
      score: 0,
      speed: 10,
      lives: 3,
      gameOver: false,
      theme: 'diwali-night',
    };

    this.setupScene();
    this.setupControls();
    
    // Create player after assets are loaded
    this.player = new EnhancedPlayer(this.assetLoader);
  }

  private setupScene(): void {
    // Add player to scene
    this.scene.add(this.player.mesh);

    // Create Diwali-themed ground
    const groundGeometry = new THREE.PlaneGeometry(20, 100);
    
    // Try to get Diwali ground texture
    const groundTexture = this.assetLoader.getAsset('diwali-ground');
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a1810, // Dark brown for night
      map: groundTexture || null,
      roughness: 0.8
    });
    
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = 0;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Create lane markers with Diwali styling
    for (let i = 0; i < 4; i++) {
      const lineGeometry = new THREE.BoxGeometry(0.1, 0.01, 100);
      const lineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffaa00, // Golden lines
        emissive: 0x221100
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(-3 + i * 2, 0.01, 0);
      this.scene.add(line);
    }

    // Add some decorative diyas along the path
    this.addPathDecorations();
  }

  private addPathDecorations(): void {
    // Add decorative diyas and rangoli patterns along the sides
    for (let i = 0; i < 20; i++) {
      const z = -50 + i * 5;
      
      // Left side diya
      const leftDiya = this.assetLoader.createPickup('diwali-share-diya', new THREE.Vector3(-4, 0.1, z));
      if (leftDiya) {
        leftDiya.scale.setScalar(0.5);
        this.scene.add(leftDiya);
        
        // Add point light for glow
        const light = new THREE.PointLight(0xffaa00, 0.3, 3);
        light.position.copy(leftDiya.position);
        light.position.y += 0.2;
        this.scene.add(light);
      }
      
      // Right side diya
      const rightDiya = this.assetLoader.createPickup('diwali-share-diya', new THREE.Vector3(4, 0.1, z));
      if (rightDiya) {
        rightDiya.scale.setScalar(0.5);
        this.scene.add(rightDiya);
        
        // Add point light for glow
        const light = new THREE.PointLight(0xffaa00, 0.3, 3);
        light.position.copy(rightDiya.position);
        light.position.y += 0.2;
        this.scene.add(light);
      }
    }
  }

  private setupControls(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!this.gameState.isPlaying || this.gameState.isPaused) return;

      switch (event.code) {
        case 'Space':
        case 'ArrowUp':
          event.preventDefault();
          this.player.jump();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          event.preventDefault();
          this.player.moveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          event.preventDefault();
          this.player.moveRight();
          break;
      }
    };

    // Touch controls for mobile
    const handleTouch = (event: TouchEvent) => {
      if (!this.gameState.isPlaying || this.gameState.isPaused) return;

      event.preventDefault();
      const touch = event.touches[0];
      if (!touch) return;

      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (y < centerY) {
        // Top half - jump
        this.player.jump();
      } else {
        // Bottom half - move left/right
        if (x < centerX) {
          this.player.moveLeft();
        } else {
          this.player.moveRight();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouch);
  }

  startGame(): void {
    this.gameState.isPlaying = true;
    this.gameState.isPaused = false;
    this.gameState.gameOver = false;
    this.gameState.score = 0;
    this.gameState.speed = 10;
    this.gameState.lives = 3;
    this.spawnTimer = 0;

    // Clear existing obstacles and collectibles
    this.clearGameObjects();
    
    console.log('🎆 Diwali Runner Game Started!');
  }

  pauseGame(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  stopGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.gameOver = true;
    this.clearGameObjects();
  }

  private clearGameObjects(): void {
    // Remove obstacles
    this.obstacles.forEach((obstacle) => {
      this.scene.remove(obstacle.mesh);
      obstacle.dispose();
    });
    this.obstacles = [];

    // Remove collectibles
    this.collectibles.forEach((collectible) => {
      this.scene.remove(collectible.mesh);
      collectible.dispose();
    });
    this.collectibles = [];
  }

  private spawnObjects(): void {
    // Randomly spawn obstacles and collectibles
    const lanes = [0, 1, 2];
    const availableLanes = [...lanes];

    // Spawn 1-2 obstacles (fewer for better gameplay)
    const obstacleCount = Math.random() < 0.6 ? 1 : 2;
    for (let i = 0; i < obstacleCount && availableLanes.length > 0; i++) {
      const laneIndex = Math.floor(Math.random() * availableLanes.length);
      const lane = availableLanes.splice(laneIndex, 1)[0]!;
      const obstacle = new DiwaliObstacle(lane, -50, this.assetLoader);
      obstacle.velocity.z = this.gameState.speed;
      this.obstacles.push(obstacle);
      this.scene.add(obstacle.mesh);
    }

    // Spawn Diwali collectibles in remaining lanes
    availableLanes.forEach(lane => {
      if (Math.random() < 0.7) { // Higher chance for collectibles
        const types = ['coin', 'diya', 'phooljhadi', 'rangoli'];
        const type = types[Math.floor(Math.random() * types.length)];
        const collectible = new DiwaliCollectible(lane, -50, this.assetLoader, type);
        collectible.velocity.z = this.gameState.speed;
        this.collectibles.push(collectible);
        this.scene.add(collectible.mesh);
      }
    });
  }

  private checkCollisions(): void {
    const playerPos = this.player.mesh.position;

    // Check obstacle collisions
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i]!;
      const distance = playerPos.distanceTo(obstacle.mesh.position);

      if (distance < 1) {
        // Collision detected
        this.gameState.lives--;
        this.scene.remove(obstacle.mesh);
        obstacle.dispose();
        this.obstacles.splice(i, 1);

        // Create collision effect
        this.createCollisionEffect(obstacle.mesh.position);

        if (this.gameState.lives <= 0) {
          this.stopGame();
        }
      }
    }

    // Check collectible collisions
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i]!;
      const distance = playerPos.distanceTo(collectible.mesh.position);

      if (distance < 0.8) {
        // Collectible picked up
        const value = collectible.getValue();
        this.gameState.score += value;
        
        // Create pickup effect
        this.createPickupEffect(collectible.mesh.position, collectible.getType());
        
        this.scene.remove(collectible.mesh);
        collectible.dispose();
        this.collectibles.splice(i, 1);
      }
    }
  }

  private createCollisionEffect(position: THREE.Vector3): void {
    // Create explosion effect
    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = position.x + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = position.y + Math.random() * 2;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
      
      colors[i3] = 1.0; // Red
      colors[i3 + 1] = 0.2;
      colors[i3 + 2] = 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    
    const explosion = new THREE.Points(geometry, material);
    this.scene.add(explosion);
    
    // Animate explosion
    let opacity = 1.0;
    const animate = () => {
      opacity -= 0.03;
      material.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(explosion);
        geometry.dispose();
        material.dispose();
      }
    };
    animate();
  }

  private createPickupEffect(position: THREE.Vector3, type: string): void {
    // Create pickup sparkle effect based on type
    const colors = {
      coin: [1.0, 0.8, 0.0],
      diya: [1.0, 0.6, 0.0],
      phooljhadi: [1.0, 0.4, 0.2],
      rangoli: [1.0, 0.1, 0.6]
    };
    
    const color = colors[type as keyof typeof colors] || [1.0, 1.0, 1.0];
    
    const particleCount = 15;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = position.x + (Math.random() - 0.5);
      positions[i3 + 1] = position.y + Math.random();
      positions[i3 + 2] = position.z + (Math.random() - 0.5);
      
      particleColors[i3] = color[0];
      particleColors[i3 + 1] = color[1];
      particleColors[i3 + 2] = color[2];
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    
    const sparkles = new THREE.Points(geometry, material);
    this.scene.add(sparkles);
    
    // Animate sparkles
    let opacity = 1.0;
    const animate = () => {
      opacity -= 0.05;
      material.opacity = opacity;
      sparkles.position.y += 0.05;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(sparkles);
        geometry.dispose();
        material.dispose();
      }
    };
    animate();
  }

  update(deltaTime: number): void {
    if (!this.gameState.isPlaying || this.gameState.isPaused) return;

    // Update player
    this.player.update(deltaTime);

    // Update obstacles (iterate backwards to safely remove items)
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i]!;
      obstacle.update(deltaTime);

      // Remove obstacles that are behind the player
      if (obstacle.mesh.position.z > 10) {
        this.scene.remove(obstacle.mesh);
        obstacle.dispose();
        this.obstacles.splice(i, 1);
      }
    }

    // Update collectibles (iterate backwards to safely remove items)
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i]!;
      collectible.update(deltaTime);

      // Remove collectibles that are behind the player
      if (collectible.mesh.position.z > 10) {
        this.scene.remove(collectible.mesh);
        collectible.dispose();
        this.collectibles.splice(i, 1);
      }
    }

    // Spawn new objects
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnObjects();
      this.spawnTimer = 0;

      // Gradually increase speed and decrease spawn interval
      this.gameState.speed += 0.1;
      this.spawnInterval = Math.max(1.2, this.spawnInterval - 0.02);
    }

    // Check collisions
    this.checkCollisions();

    // Update score based on time survived
    this.gameState.score += Math.floor(deltaTime * 5);
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  dispose(): void {
    this.clearGameObjects();
    this.scene.remove(this.player.mesh);
    this.scene.remove(this.ground);
    this.player.dispose();
    this.ground.geometry.dispose();
    (this.ground.material as THREE.Material).dispose();
  }
}