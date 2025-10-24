# Three.js Starter Repo

A minimal, production‑ready Three.js starter tailored for **Kiro** workflows. Includes:

- Clean Vite setup (fast HMR, easy deploys)
- Strict linting/formatting
- Sensible project structure
- Mobile-friendly render loop + resize handling
- A **Kiro Prompt Block** to generate/scaffold this repo in one go

---

## 1) Repo Tree

```
three-kiro-starter/
├─ README.md
├─ package.json
├─ vite.config.js
├─ .gitignore
├─ .editorconfig
├─ .eslintrc.cjs
├─ .prettierrc
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.ts
   ├─ scene/
   │  ├─ makeRenderer.ts
   │  ├─ makeScene.ts
   │  ├─ makeCamera.ts
   │  └─ resize.ts
   └─ styles.css
```

---

## 2) Kiro Prompt Block (copy‑paste into Kiro)

````
# Title: Three.js + Vite Starter (TypeScript)

## Goal
Create a minimal Three.js starter using Vite + TypeScript with mobile‑friendly rendering, strict linting/formatting, and a clean scene/camera/renderer split. Include resize handling and a requestAnimationFrame loop capped by delta‑time. Provide a README with run/build instructions.

## Deliverables
- Files matching the repo tree below
- Code filled in with working defaults
- Install commands and scripts in package.json

## Constraints
- Use three@^0.169.0
- TypeScript + Vite
- ESLint + Prettier configured
- Keep dependencies minimal

## Repo Tree
three-kiro-starter/
├─ README.md
├─ package.json
├─ vite.config.js
├─ .gitignore
├─ .editorconfig
├─ .eslintrc.cjs
├─ .prettierrc
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.ts
   ├─ scene/
   │  ├─ makeRenderer.ts
   │  ├─ makeScene.ts
   │  ├─ makeCamera.ts
   │  └─ resize.ts
   └─ styles.css

## File: package.json
{
  "name": "three-kiro-starter",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vite": "^5.4.0",
    "@types/three": "^0.172.0",
    "eslint": "^9.12.0",
    "@typescript-eslint/eslint-plugin": "^8.8.1",
    "@typescript-eslint/parser": "^8.8.1",
    "prettier": "^3.3.3"
  },
  "dependencies": {
    "three": "^0.169.0"
  }
}

## File: vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: { open: true },
  build: { sourcemap: true }
})

## File: .gitignore
node_modules
.dist
.dist-ssr
.vite
.DS_Store
*.log

## File: .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

## File: .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: { es2022: true, browser: true },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn']
  }
}

## File: .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5"
}

## File: public/favicon.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="none" stroke="black" stroke-width="8"/>
  <path d="M30 65 L50 25 L70 65 Z" fill="black"/>
</svg>

## File: src/styles.css
html, body, #app { height: 100%; margin: 0; }
canvas { display: block; touch-action: none; }

## File: src/scene/makeRenderer.ts
import { WebGLRenderer } from 'three'

export function makeRenderer(container: HTMLElement) {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)
  return renderer
}

## File: src/scene/makeScene.ts
import { Scene, Color, Mesh, MeshStandardMaterial, TorusKnotGeometry, AmbientLight, DirectionalLight } from 'three'

export function makeScene() {
  const scene = new Scene()
  scene.background = new Color('#0e0f12')

  const geo = new TorusKnotGeometry(1, 0.35, 128, 32)
  const mat = new MeshStandardMaterial({ color: '#9ae6b4', roughness: 0.35, metalness: 0.2 })
  const knot = new Mesh(geo, mat)
  scene.add(knot)

  const amb = new AmbientLight(0xffffff, 0.6)
  const dir = new DirectionalLight(0xffffff, 1)
  dir.position.set(5, 5, 5)
  scene.add(amb, dir)

  return { scene, knot }
}

## File: src/scene/makeCamera.ts
import { PerspectiveCamera } from 'three'

export function makeCamera(width: number, height: number) {
  const camera = new PerspectiveCamera(60, width / height, 0.1, 100)
  camera.position.set(0, 0, 4)
  return camera
}

## File: src/scene/resize.ts
import type { PerspectiveCamera, WebGLRenderer } from 'three'

export function setupResize(container: HTMLElement, camera: PerspectiveCamera, renderer: WebGLRenderer) {
  const onResize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  const ro = new ResizeObserver(onResize)
  ro.observe(container)
  window.addEventListener('orientationchange', onResize)
  return () => {
    ro.disconnect()
    window.removeEventListener('orientationchange', onResize)
  }
}

## File: src/main.ts
import './styles.css'
import { Clock } from 'three'
import { makeRenderer } from './scene/makeRenderer'
import { makeScene } from './scene/makeScene'
import { makeCamera } from './scene/makeCamera'
import { setupResize } from './scene/resize'

const app = document.createElement('div')
app.id = 'app'
document.body.appendChild(app)

const renderer = makeRenderer(app)
const { scene, knot } = makeScene()
const camera = makeCamera(app.clientWidth, app.clientHeight)

const cleanupResize = setupResize(app, camera, renderer)

const clock = new Clock()
let raf = 0

function loop() {
  const dt = Math.min(clock.getDelta(), 1 / 30) // clamp delta to avoid spikes
  knot.rotation.x += dt * 0.6
  knot.rotation.y += dt * 0.8
  renderer.render(scene, camera)
  raf = requestAnimationFrame(loop)
}

loop()

// Hot Module Replacement cleanup
if (import.meta && (import.meta as any).hot) {
  ;(import.meta as any).hot.dispose(() => {
    cancelAnimationFrame(raf)
    cleanupResize()
    renderer.dispose()
  })
}

## File: README.md
# Three.js + Vite Starter (TypeScript)

Fast, minimal Three.js starter with strict tooling and mobile‑friendly defaults.

## Scripts
- `pnpm dev` → start dev server
- `pnpm build` → production build
- `pnpm preview` → preview build
- `pnpm lint` → lint sources
- `pnpm format` → format sources

## Setup
```bash
pnpm i
pnpm dev
````

Open the URL printed by Vite.

## Notes

- Renderer pixel ratio is capped for perf.
- ResizeObserver handles container/layout changes.
- Delta‑time clamp stabilizes animation on slow frames.

````

---

## 3) Manual Setup (without Kiro)
```bash
pnpm create vite@latest three-kiro-starter --template vanilla-ts
cd three-kiro-starter
pnpm i three @types/three eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier -D typescript vite
# then drop in the files above
pnpm dev
````

## 4) Next Steps

- Swap `TorusKnotGeometry` for your models (GLTF/GLB via `GLTFLoader`)
- Add input controls (`OrbitControls`) only if needed
- Measure frame time; target stable 60 FPS on mid‑range mobile
- If you plan Reddit Devvit web embedding, ensure canvas fits the host container and respects reduced‑motion settings

