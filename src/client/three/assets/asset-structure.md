# Game Assets Structure

## Core Asset Organization

```
src/client/three/assets/
├── core/                    # Core game mechanics assets
│   ├── runner/             # Runner character assets
│   ├── lanes/              # Lane and tile systems
│   ├── obstacles/          # Obstacle variations
│   ├── pickups/            # Collectible items
│   ├── ui/                 # UI elements and icons
│   ├── audio/              # Sound effects and music
│   └── vfx/                # Visual effects
├── themes/                 # Theme-specific overrides
│   ├── diwali-night/       # Diwali theme assets
│   ├── default/            # Fallback theme
│   └── [future-themes]/    # Extensible theme slots
├── profiles/               # Performance profiles
│   ├── low-end/            # Optimized for low-end devices
│   ├── mid-range/          # Balanced quality/performance
│   └── high-end/           # Maximum quality
└── shared/                 # Common utilities and base classes
    ├── materials/          # Shared material definitions
    ├── geometries/         # Reusable geometry templates
    └── shaders/            # Custom shader programs
```

## Asset Loading Strategy

### 1. Modular Pack System
- Each core pack is self-contained with fallbacks
- Theme packs override core assets selectively
- Performance profiles adjust quality automatically

### 2. Asset Manifest Structure
```json
{
  "core": {
    "runner": ["idle", "run", "jump", "slide"],
    "lanes": ["straight", "curve-left", "curve-right"],
    "obstacles": ["static", "moving", "destructible"],
    "pickups": ["coin", "power-up", "special"],
    "ui": ["hud", "menus", "buttons"],
    "audio": ["sfx", "music", "ambient"],
    "vfx": ["particles", "trails", "explosions"]
  },
  "themes": {
    "diwali-night": {
      "overrides": ["skyline", "lighting", "particles"],
      "additions": ["diyas", "fireworks", "rangoli"]
    }
  }
}
```

### 3. Performance Profiles
- **Low-end**: 512px textures, LOD1, reduced particles
- **Mid-range**: 1024px textures, LOD0, standard particles  
- **High-end**: 2048px textures, enhanced VFX, bloom effects