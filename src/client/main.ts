import * as THREE from 'three';
import { HealthBar } from './health-bar';

// Game State
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    speed: 10,
    lives: 3,
    gameOver: false
};

// Device Detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Three.js Setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });

// Function to get proper viewport height
function getViewportHeight() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
}

// Set initial size
function updateRendererSize() {
    const width = window.innerWidth;
    const height = getViewportHeight();
    
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

updateRendererSize();
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0x2a1810, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff6b35, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Game Objects
let player: Player;
let obstacles: Obstacle[] = [];
let collectibles: Collectible[] = [];
let healthBar: HealthBar;
let spawnTimer = 0;
const spawnInterval = 2.5;

// Player Class
class Player {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    lanes: number[];
    currentLane: number;
    targetX: number;
    isGrounded: boolean;

    constructor() {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff6b35,
            emissive: 0x331100
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0.6, 0);
        scene.add(this.mesh);

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.lanes = [-2, 0, 2];
        this.currentLane = 1;
        this.targetX = 0;
        this.isGrounded = true;
    }

    jump() {
        if (this.isGrounded) {
            this.velocity.y = 15;
            this.isGrounded = false;
        }
    }

    moveLeft() {
        if (this.currentLane > 0) {
            this.currentLane--;
            this.targetX = this.lanes[this.currentLane];
        }
    }

    moveRight() {
        if (this.currentLane < this.lanes.length - 1) {
            this.currentLane++;
            this.targetX = this.lanes[this.currentLane];
        }
    }

    update(deltaTime: number) {
        // Lane switching
        const dx = this.targetX - this.mesh.position.x;
        if (Math.abs(dx) > 0.1) {
            this.mesh.position.x += dx * 8 * deltaTime;
        }

        // Jumping and gravity
        if (!this.isGrounded) {
            this.velocity.y -= 50 * deltaTime;
            this.mesh.position.y += this.velocity.y * deltaTime;

            if (this.mesh.position.y <= 0.6) {
                this.mesh.position.y = 0.6;
                this.velocity.y = 0;
                this.isGrounded = true;
            }
        }
    }
}

// Obstacle Class
class Obstacle {
    mesh: THREE.Mesh;
    velocity: number;

    constructor(lane: number, z: number) {
        const geometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);
        const material = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set([-2, 0, 2][lane], 0.75, z);
        this.velocity = gameState.speed;
        scene.add(this.mesh);
    }

    update(deltaTime: number) {
        this.mesh.position.z += this.velocity * deltaTime;
        this.mesh.rotation.y += 2 * deltaTime;
    }

    dispose() {
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
    }
}

// Collectible Class
class Collectible {
    mesh: THREE.Mesh;
    velocity: number;

    constructor(lane: number, z: number) {
        const geometry = new THREE.SphereGeometry(0.3, 8, 6);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffdd00,
            metalness: 0.8
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set([-2, 0, 2][lane], 1, z);
        this.velocity = gameState.speed;
        scene.add(this.mesh);
    }

    update(deltaTime: number) {
        this.mesh.position.z += this.velocity * deltaTime;
        this.mesh.rotation.y += 3 * deltaTime;
    }

    dispose() {
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
    }
}

// Create Ground
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(20, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1810 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Lane markers
    for (let i = 0; i < 4; i++) {
        const lineGeometry = new THREE.BoxGeometry(0.1, 0.02, 100);
        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(-3 + i * 2, 0.01, 0);
        scene.add(line);
    }
}

// Game Functions
function startGame() {
    gameState.isPlaying = true;
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.speed = 10; // Reset speed
    spawnTimer = 0;

    // Clear objects
    obstacles.forEach(obs => obs.dispose());
    collectibles.forEach(col => col.dispose());
    obstacles = [];
    collectibles = [];

    // Show health bar and game stats
    healthBar.setHealth(gameState.lives);
    healthBar.show();
    
    const gameStats = document.getElementById('gameStats');
    if (gameStats) gameStats.style.display = 'block';

    // Hide all screens
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    
    if (startScreen) startScreen.style.display = 'none';
    if (gameOverScreen) gameOverScreen.style.display = 'none';

    updateUI();
}

function gameOver() {
    gameState.gameOver = true;
    gameState.isPlaying = false;
    healthBar.hide();

    // Hide game stats
    const gameStats = document.getElementById('gameStats');
    if (gameStats) gameStats.style.display = 'none';

    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScore = document.getElementById('finalScore');
    
    console.log('GameOver called - showing screen');
    
    if (gameOverScreen) {
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.visibility = 'visible';
        gameOverScreen.style.zIndex = '9999';
        console.log('Game over screen should be visible now');
    }
    
    if (finalScore) {
        finalScore.textContent = `Final Score: ${gameState.score}`;
    }
}

function spawnObjects() {
    const lanes = [0, 1, 2];
    const availableLanes = [...lanes];

    // Spawn obstacle
    if (Math.random() < 0.7) {
        const lane = availableLanes.splice(Math.floor(Math.random() * availableLanes.length), 1)[0];
        obstacles.push(new Obstacle(lane, -50));
    }

    // Spawn collectibles
    availableLanes.forEach(lane => {
        if (Math.random() < 0.6) {
            collectibles.push(new Collectible(lane, -50));
        }
    });
}

function checkCollisions() {
    const playerPos = player.mesh.position;

    // Check obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        const distance = playerPos.distanceTo(obstacle.mesh.position);

        if (distance < 1.0) {
            gameState.lives--;
            healthBar.takeDamage(1);

            obstacle.dispose();
            obstacles.splice(i, 1);

            if (gameState.lives <= 0) {
                gameOver();
                return;
            }
        }
    }

    // Check collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        const distance = playerPos.distanceTo(collectible.mesh.position);

        if (distance < 0.8) {
            gameState.score += 10;
            collectible.dispose();
            collectibles.splice(i, 1);
        }
    }
}

function updateUI() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `${gameState.score}`;
    }
}

// Controls
function setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        if (!gameState.isPlaying || gameState.gameOver) return;

        switch (event.code) {
            case 'Space':
            case 'ArrowUp':
                event.preventDefault();
                player.jump();
                break;
            case 'ArrowLeft':
            case 'KeyA':
                event.preventDefault();
                player.moveLeft();
                break;
            case 'ArrowRight':
            case 'KeyD':
                event.preventDefault();
                player.moveRight();
                break;
        }
    });

    // Touch controls for mobile
    let touchStartY = 0;
    let touchStartX = 0;

    document.addEventListener('touchstart', (event) => {
        if (!gameState.isPlaying || gameState.gameOver) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        if (!touch) return;

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: false });

    document.addEventListener('touchend', (event) => {
        if (!gameState.isPlaying || gameState.gameOver) return;
        
        event.preventDefault();
        
        const touch = event.changedTouches[0];
        if (!touch) return;

        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        const minSwipeDistance = 30;
        
        // Determine if it's a swipe or tap
        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
            // Swipe gesture
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    player.moveRight();
                } else {
                    player.moveLeft();
                }
            } else {
                // Vertical swipe
                if (deltaY < 0) {
                    player.jump();
                }
            }
        } else {
            // Tap gesture - jump
            player.jump();
        }
    }, { passive: false });

    // Prevent scrolling and other touch behaviors on mobile
    document.addEventListener('touchmove', (event) => {
        event.preventDefault();
    }, { passive: false });

    // Prevent context menu on long press
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // UI Buttons
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    
    if (startBtn) startBtn.addEventListener('click', startGame);
    if (restartBtn) restartBtn.addEventListener('click', startGame);
}

// Game Loop
let lastTime = 0;
function animate(currentTime: number) {
    requestAnimationFrame(animate);

    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (gameState.isPlaying && !gameState.gameOver) {
        // Update player
        player.update(deltaTime);

        // Update obstacles
        obstacles.forEach((obstacle, index) => {
            obstacle.update(deltaTime);
            if (obstacle.mesh.position.z > 10) {
                obstacle.dispose();
                obstacles.splice(index, 1);
            }
        });

        // Update collectibles
        collectibles.forEach((collectible, index) => {
            collectible.update(deltaTime);
            if (collectible.mesh.position.z > 10) {
                collectible.dispose();
                collectibles.splice(index, 1);
            }
        });

        // Spawn objects
        spawnTimer += deltaTime;
        if (spawnTimer >= spawnInterval) {
            spawnObjects();
            spawnTimer = 0;
            gameState.speed += 0.1;
        }

        // Check collisions
        checkCollisions();

        // Update score
        gameState.score += Math.floor(deltaTime * 5);
        updateUI();
    }

    renderer.render(scene, camera);
}

// Resize handler
function onWindowResize() {
    updateRendererSize();
}

window.addEventListener('resize', () => {
    setViewportHeight();
    onWindowResize();
});

// Handle visual viewport changes (mobile keyboard, etc.)
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        setViewportHeight();
        onWindowResize();
    });
}

// Fix viewport height for mobile
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initialize
function init() {
    // Set proper viewport height
    setViewportHeight();
    
    // Show loading screen initially
    showLoadingScreen();
    
    // Simulate loading time and initialize game components
    setTimeout(() => {
        healthBar = new HealthBar({ maxHealth: 3, currentHealth: 3 });
        healthBar.hide(); // Hide until game starts
        
        createGround();
        player = new Player();
        setupControls();
        animate(performance.now());
        
        // Hide loading screen and show start screen
        hideLoadingScreen();
        showStartScreen();
    }, 2000); // 2 second loading time
}

// Loading screen functions
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) loadingScreen.style.display = 'block';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) loadingScreen.style.display = 'none';
}

function showStartScreen() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.style.display = 'block';
}

// Start the game
init();