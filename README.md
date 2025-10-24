# Diwali Night Runner 🪔

A 3D endless runner game built for Reddit using Devvit and Three.js, featuring Diwali-themed visuals and fast-paced gameplay.

## What is Diwali Night Runner?

Diwali Night Runner is a 3D endless runner that celebrates India's Festival of Lights. Players control a Diwali-themed character running through a night landscape, collecting golden coins while avoiding red obstacles in a Three.js-powered 3D environment.

The game runs within Reddit posts as a Devvit web app, providing an immersive gaming experience directly on the platform. Players navigate through three lanes, jumping over obstacles and collecting coins to achieve high scores.

### Core Game Features

- **3D Diwali-Themed World**: Night landscape with warm golden lighting and Diwali orange character design
- **Three-Lane Navigation**: Smooth lane switching between left (-2), center (0), and right (+2) positions
- **Simple Collectible System**: Golden coins worth +10 points each with metallic shine and rotation effects
- **Obstacle Avoidance**: Dark red cubic barriers that rotate and move toward the player
- **Physics-Based Jumping**: 15-unit jump force with -50 gravity for realistic movement
- **Progressive Difficulty**: Game speed increases over time, making survival more challenging
- **Lives System**: 3-life system with visual health bar and collision detection
- **Dual Scoring**: Survival points (5/second) + coin collection bonuses
- **Responsive Controls**: Desktop keyboard support with arrow keys and WASD
- **Clean Three.js Architecture**: Modular class-based design with proper resource management

## What Makes This Game Unique?

### 1. **Diwali-Themed 3D Experience**
- **Festival Atmosphere**: Dark night sky (0x1a1a2e) with warm golden lighting and Diwali orange character design
- **Cultural Character**: Player character with Diwali orange coloring (0xff6b35) and warm emissive lighting (0x331100)
- **Atmospheric Lighting**: Ambient lighting (0x2a1810) combined with directional lighting (0xff6b35) creates authentic festival ambiance
- **Golden Lane Markers**: Bright golden lane dividers (0xffaa00) guide the player through the three-lane system

### 2. **Smooth 3D Gameplay Mechanics**
- **Three-Lane System**: Navigate between left (-2), center (0), and right (+2) positions with smooth interpolation
- **Realistic Physics**: 15-unit jump force with -50 gravity provides satisfying jump mechanics
- **Progressive Difficulty**: Game speed increases by 0.1 units every spawn cycle, making survival increasingly challenging
- **Smart Object Spawning**: Obstacles spawn with 70% probability, collectibles fill remaining lanes with 60% chance

### 3. **Visual Polish & Effects**
- **Rotating Obstacles**: Dark red cubic barriers (0x8b0000) with continuous rotation animations
- **Spinning Collectibles**: Golden spherical coins (0xffdd00) with metallic materials and rotation effects
- **Health System Integration**: Visual health bar with heart indicators and screen flash damage effects
- **Responsive Design**: Automatic mobile detection with optimized rendering settings

### 4. **Reddit Integration**
- **Devvit Platform**: Built specifically for Reddit using Devvit's web app architecture
- **Seamless Experience**: Runs directly within Reddit posts without external navigation
- **Loading Screen**: Custom Diwali-themed loading screen with "Festival of Lights" branding
- **Social Gaming**: Designed for Reddit's community-focused environment

### 5. **Technical Architecture**
- **Three.js Foundation**: Modern WebGL-based 3D rendering with optimized performance
- **Class-Based Design**: Clean object-oriented architecture with Player, Obstacle, and Collectible classes
- **Resource Management**: Proper disposal of Three.js objects to prevent memory leaks
- **Cross-Platform Support**: Responsive controls and mobile-optimized rendering settings

## How to Play

### Getting Started

1. **Launch the Game**: Open the Diwali Night Runner app within a Reddit post - the game loads directly in your browser
2. **Wait for Loading**: The game displays a "Loading Festival of Lights..." screen while Three.js initializes
3. **Start Playing**: Click the "🎮 Start Game" button to begin your endless runner journey
4. **Monitor Your Progress**: Watch your score in the game stats display during gameplay

### Desktop Controls

- **Movement Controls**:
  - ⬅️ **Left Arrow or A Key**: Move to left lane (-2 X position) with smooth interpolation
  - ➡️ **Right Arrow or D Key**: Move to right lane (+2 X position) with smooth interpolation  
  - ⬆️ **Up Arrow or Spacebar**: Jump with realistic physics (15-unit force, -50 gravity)
- **Game Controls**:
  - **Start Game Button**: Begin a new game session
  - **Play Again Button**: Restart after game over

### Gameplay Mechanics

#### Core Objectives

1. **Survive the Run**: Keep running without losing all your lives in this endless 3D experience
2. **Avoid Red Obstacles**: Navigate around dark red cubic barriers by switching lanes or jumping over them
3. **Collect Golden Coins**: Gather spinning golden coins worth +10 points each
4. **Maximize Your Score**: Earn points through survival (5 points/second) and coin collection

#### Game Progression & Difficulty

- **Starting State**: Begin in the center lane (position 0) with 3 lives and initial speed of 10 units per second
- **Three-Lane System**: Navigate between left (-2), center (0), and right (+2) positions with golden lane markers
- **Dynamic Spawning**: Red obstacles spawn every 2.5 seconds initially, positioned 50 units ahead
- **Progressive Difficulty**: Game speed increases by 0.1 units every spawn cycle for continuous challenge

#### Player Mechanics

- **Character Design**: Diwali-themed capsule character with orange coloring (0xff6b35) and warm emissive glow
- **Lane Navigation**: Smooth interpolation between lanes at 8 units/second with target-based movement
- **Jump Physics**: 15-unit jump force with -50 gravity and ground detection at Y=0.6
- **Collision System**: Distance-based detection - 1 unit radius for obstacles, 0.8 units for collectibles

#### Lives and Game Over

- **3 Lives System**: Start with 3 lives, lose 1 per obstacle collision
- **Visual Health Bar**: Heart-based health display at the top center of the screen
- **Screen Flash Effect**: Red flash effect when taking damage
- **Game Over State**: Triggered when all lives are lost, showing final score and restart option

### Scoring System

- **Survival Points**: Earn 5 points per second of continuous gameplay
- **Coin Collection**: +10 points for each golden coin collected
- **Real-time Display**: Score updates continuously in the game stats panel
- **Final Score**: Displayed on game over screen with restart option

### Strategy Tips

- **Lane Management**: Stay in the center lane for maximum movement options
- **Timing Jumps**: Jump early when obstacles approach, accounting for increasing game speed
- **Coin Priority**: Collect coins when safe, but prioritize survival over risky collection attempts
- **Speed Adaptation**: As the game speeds up, plan your movements further ahead
- **Pattern Recognition**: Learn the spawn timing (every 2.5 seconds) to anticipate obstacles

## Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for immersive apps with Redis persistence
- **[Three.js](https://threejs.org/)**: 3D graphics and physics engine with WebGL rendering
- **[Vite](https://vite.dev/)**: Fast build tool and development server with Hot Module Replacement
- **[Express](https://expressjs.com/)**: Backend API server with RESTful endpoints
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development with strict checking and project references

## Development Commands

- `npm run dev`: Start development server with live Reddit integration
- `npm run build`: Build client and server for production
- `npm run deploy`: Upload new version to Reddit
- `npm run launch`: Publish app for Reddit review
- `npm run check`: Run type checking, linting, and formatting

## Technical Implementation

### Architecture Overview

- **Client-Side**: Enterprise-grade modular Three.js 3D engine with clean separation of concerns, dependency injection, and comprehensive asset management
- **Server-Side**: Express.js API with Reddit integration via Devvit platform, Redis persistence, and RESTful score management endpoints
- **Shared Types**: Comprehensive TypeScript interfaces ensuring type-safe client-server communication and API contracts
- **Build System**: Vite with TypeScript project references, Hot Module Replacement support, and optimized production builds with asset bundling

### Three.js Architecture

#### Core Systems
- **Scene Setup** (`src/client/main.ts`): 
  - WebGL renderer with mobile optimization (antialias disabled on mobile)
  - Pixel ratio capping and responsive canvas sizing
  - Dark night sky background (0x1a1a2e) with Diwali-themed lighting
- **Lighting System**: 
  - Ambient lighting (0x2a1810, 0.4 intensity) for base illumination
  - Directional lighting (0xff6b35, 0.8 intensity) for warm Diwali glow
  - Strategic light positioning at (5, 10, 5) for optimal scene visibility
- **Camera System**: 
  - Perspective camera (75° FOV) positioned at (0, 3, 8) for optimal gameplay view
  - Automatic aspect ratio updates on window resize
  - Fixed camera position providing consistent 3D perspective

#### Game Components
- **Player Class**: 
  - Capsule geometry (0.3 radius, 1.2 height) with Diwali orange material (0xff6b35)
  - Warm emissive lighting (0x331100) for authentic festival glow
  - Three-lane navigation system with smooth interpolation (8 units/second)
  - Physics-based jumping with 15-unit force and -50 gravity
- **Obstacle Class**: 
  - Cubic geometry (0.8×1.5×0.8 units) with dark red material (0x8b0000)
  - Continuous rotation animation (2 radians/second) for visual interest
  - Dynamic spawning at -50 Z position with current game speed movement
- **Collectible Class**: 
  - Spherical geometry (0.3 radius) with golden metallic material (0xffdd00)
  - High metalness (0.8) for realistic coin appearance
  - Rotation animation (3 radians/second) and elevated positioning (Y=1)
- **Ground System**: 
  - Large plane geometry (20×100 units) with brown material (0x2a1810)
  - Golden lane markers (0xffaa00) dividing the three-lane system
  - Proper ground collision detection at Y=0.6

#### UI & Controls
- **Health Bar Component** (`src/client/health-bar.js`): 
  - Heart-based visual display with ❤️ and 🖤 indicators
  - Screen flash damage effects with red overlay animation
  - Centered positioning with backdrop blur and Diwali-themed borders
- **Game State Management**: 
  - Loading screen with "Festival of Lights" branding
  - Start screen with gradient text effects and styled buttons
  - Game over screen with final score display and restart functionality
- **Input Handling**: 
  - Keyboard controls (Arrow keys, WASD, Spacebar) for desktop
  - Mobile device detection for future touch control implementation
  - Event prevention to avoid page scrolling during gameplay

#### Performance & Memory Management
- **Resource Disposal**: 
  - Proper cleanup of Three.js geometries and materials
  - Automatic removal of objects that move beyond the play area
  - Memory-efficient object pooling for obstacles and collectibles
- **Mobile Optimization**: 
  - Conditional antialiasing based on device detection
  - Pixel ratio capping to prevent performance issues
  - Optimized rendering settings for mobile browsers

## Getting Started

### Development Setup

> Requires Node.js 22+

1. **Clone and Install**:

   ```bash
   git clone <repository-url>
   cd diwali-night-runner
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Test in Reddit**:
   - Open the provided Reddit playtest URL
   - Click "Launch App" in the Reddit post
   - The 3D game opens in a webview with loading screen

4. **Local Testing**:
   ```bash
   npm run local
   ```
   - Opens at `http://localhost:3000`
   - Useful for testing game mechanics without Reddit integration

### Production Deployment

```bash
npm run build    # Build client and server
npm run deploy   # Deploy to Reddit
npm run launch   # Submit for Reddit review
```

The game appears as an interactive post on Reddit with a "Launch App" button that opens the 3D runner experience.
