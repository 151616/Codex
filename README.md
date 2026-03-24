# Real-Time Black Hole Simulation

This project is a browser-based black hole simulation focused on balancing visual realism and high frame-rate performance.

## 1) Physics approach

### Core force model
- Particles in the accretion disk are updated with **softened Newtonian gravity**:
  - \(\vec{a} = -GM\,\vec{r}/(r^2+\epsilon^2)^{3/2}\)
- Softening \(\epsilon\) prevents unstable accelerations very near the center and makes long real-time runs numerically robust.

### Accretion disk behavior
- Particles are spawned in an annulus around the black hole with tangential velocity near circular orbit speed:
  - \(v_{circ} = \sqrt{GM/r}\)
- Randomized velocity jitter gives shear, clumping, and turbulent-looking disk motion.

### Relativistic-inspired correction
- A small tangential correction is added to emulate precession-like behavior (not full GR geodesics, but physically motivated for visuals):
  - This causes near-hole trajectories to twist and spiral more realistically.

### Event horizon and recycling
- If a particle crosses the event horizon radius, it is considered absorbed.
- Absorbed/escaped particles are respawned at disk radii to maintain a stable particle budget and smooth animation.

### Visual lensing approximation
- Background stars are displaced radially with a strength that scales approximately as \(1/r^2\) near the hole.
- This creates a gravitational lensing-style warping effect around the center.

## 2) Technology choice

### Why JavaScript + HTML5 Canvas 2D
- **Best deployment surface:** runs instantly in any modern browser with no compile chain.
- **Performance:** 500–3000 particles in real-time is practical with lightweight draw calls.
- **Interactivity:** camera and sliders are straightforward and responsive.
- **Separation of concerns:** physics and rendering are cleanly split into modules.

### Code architecture
- `src/physics.js`: all particle dynamics and black hole force integration.
- `src/renderer.js`: starfield, lensing, accretion glow, camera controls, and draw loop support.
- `src/main.js`: app bootstrap, UI wiring, animation timing.

## 3) Complete runnable code

All code lives in this repository:
- `index.html`
- `style.css`
- `src/main.js`
- `src/physics.js`
- `src/renderer.js`

## 4) Run instructions

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Bonus features included
- Real-time animation
- Adjustable mass, gravity scale, particle count, and lensing strength
- Camera zoom and pan controls
- Physically-inspired precession correction
