# Three.js Starter

A minimal, production-ready Three.js starter project with TypeScript, Vite, and dual implementation approaches (Vanilla Three.js and React Three Fiber).

## ✨ Features

- **🚀 Fast Development**: Vite with HMR for instant updates
- **📱 Mobile Optimized**: Responsive design with performance optimizations
- **🎯 TypeScript**: Full type safety with strict configuration
- **🔧 Modular Architecture**: Clean separation of concerns
- **⚡ Performance**: Pixel ratio capping, delta time clamping, ResizeObserver
- **🧹 Resource Management**: Proper cleanup and HMR support
- **🎨 Code Quality**: ESLint + Prettier with strict rules
- **🔄 Dual Approaches**: Choose between Vanilla Three.js or React Three Fiber

## 🏗️ Project Structure

```
three-js-starter/
├── src/
│   ├── vanilla/                 # Vanilla Three.js implementation
│   │   ├── main.ts             # Entry point
│   │   ├── scene/              # Scene management modules
│   │   │   ├── renderer.ts     # WebGL renderer setup
│   │   │   ├── scene.ts        # Scene creation and lighting
│   │   │   └── camera.ts       # Camera configuration
│   │   ├── systems/            # Core systems
│   │   │   ├── render-loop.ts  # Animation loop management
│   │   │   └── resize-handler.ts # Responsive handling
│   │   └── utils/              # Utility functions
│   │       └── cleanup.ts      # Resource cleanup
│   ├── react/                  # React Three Fiber implementation
│   │   ├── App.tsx             # React app entry
│   │   ├── main.tsx            # React DOM entry point
│   │   ├── components/         # 3D React components
│   │   │   ├── Scene.tsx       # Main scene component
│   │   │   └── TorusKnot.tsx   # Example 3D object
│   │   └── hooks/              # Custom React hooks
│   │       └── useResize.ts    # Resize handling hook
│   └── shared/                 # Shared utilities
│       ├── types.ts            # TypeScript definitions
│       └── constants.ts        # Application constants
├── public/                     # Static assets
├── vanilla.html               # Vanilla Three.js entry
├── react.html                 # React Three Fiber entry
└── vite.config.ts            # Vite configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or download the project
cd three-js-starter

# Install dependencies
npm install

# Start development server
npm run dev
```

This will start the Vite dev server and open both implementations:
- **Vanilla**: http://localhost:3000/vanilla.html
- **React**: http://localhost:3000/react.html

## 🎮 Usage

### Vanilla Three.js Approach

The vanilla implementation provides a modular, class-based architecture:

```typescript
import { ThreeJSApp } from './src/vanilla/main'

const container = document.getElementById('app')
const app = new ThreeJSApp()
await app.init(container)
```

**Key Features:**
- Modular scene management (renderer, scene, camera)
- Performance-optimized render loop with delta time clamping
- ResizeObserver-based responsive handling
- Interactive TorusKnot with click animations
- Comprehensive resource cleanup for HMR

### React Three Fiber Approach

The React implementation uses declarative JSX components:

```tsx
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'

function App() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 5] }}>
      <Scene />
    </Canvas>
  )
}
```

**Key Features:**
- Declarative 3D scene creation with JSX
- React hooks for responsive handling
- Component-based architecture
- Built-in OrbitControls and Stats
- Automatic resource management

## 📱 Mobile Optimization

Both implementations include mobile-specific optimizations:

- **Pixel Ratio Capping**: Limited to 2x for performance
- **Touch Interactions**: Pointer events for cross-platform compatibility
- **Responsive Design**: ResizeObserver for efficient resize handling
- **Orientation Changes**: Automatic viewport updates
- **Performance Monitoring**: FPS tracking and memory usage alerts

## 🔧 Configuration

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  renderer: {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    maxPixelRatio: 2,
  },
  scene: {
    background: null, // Transparent
    lighting: {
      ambient: { color: 0x404040, intensity: 0.4 },
      directional: { color: 0xffffff, intensity: 1, position: [10, 10, 5] },
    },
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5],
  },
  performance: {
    maxPixelRatio: 2,
    maxDeltaTime: 1 / 30, // 30fps minimum
    targetFPS: 60,
  },
}
```

### Customization

You can customize the configuration by modifying `src/shared/constants.ts` or passing custom config objects to the initialization functions.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

### Code Quality

The project includes strict code quality tools:

- **ESLint**: TypeScript rules with recommended configurations
- **Prettier**: Consistent formatting (single quotes, no semicolons)
- **TypeScript**: Strict mode with comprehensive type checking

### Hot Module Replacement (HMR)

Both implementations support HMR with proper resource cleanup:

```typescript
// Automatic cleanup on HMR
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Cleanup Three.js resources
    renderer.dispose()
    scene.clear()
    // Remove event listeners
  })
}
```

## 🎯 Interactive Features

### Click Interactions

Both implementations include interactive TorusKnot objects:

- **Click Detection**: Raycasting for precise 3D object selection
- **Visual Feedback**: Bounce animation and color changes
- **Event Handling**: Custom events for external integration

### Performance Monitoring

Development builds include performance monitoring:

- **FPS Counter**: Real-time frame rate display
- **Memory Usage**: JavaScript heap monitoring
- **Performance Warnings**: Automatic alerts for low FPS

## 🚀 Production Build

```bash
npm run build
```

The build process:
1. TypeScript compilation with strict checking
2. Vite optimization with tree shaking
3. Asset optimization and compression
4. Source map generation for debugging

### Build Output

```
dist/
├── assets/
│   ├── vanilla-[hash].js
│   ├── react-[hash].js
│   └── [hash].css
├── vanilla.html
└── react.html
```

## 🔍 Troubleshooting

### Common Issues

**WebGL Context Lost**
```typescript
renderer.context.addEventListener('webglcontextlost', (event) => {
  event.preventDefault()
  console.warn('WebGL context lost')
})
```

**Performance Issues**
- Check pixel ratio settings (should be capped at 2)
- Monitor FPS counter for performance drops
- Use browser dev tools for memory profiling

**Mobile Compatibility**
- Ensure touch events are properly handled
- Test on various devices and orientations
- Check for WebGL support

### Debug Mode

Development builds include debug utilities:

```typescript
// Access global app instance
window.threeApp.getFPS() // Get current FPS
window.threeApp.dispose() // Manual cleanup
```

## 📚 Learning Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy coding! 🎉**