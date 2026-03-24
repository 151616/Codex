import { BlackHolePhysics } from './physics.js';
import { SimulationRenderer } from './renderer.js';

const canvas = document.getElementById('simCanvas');

const params = {
  center: { x: 0, y: 0 },
  gravitationalConstant: 0.24,
  mass: 18000,
  gravityScale: 1,
  particleCount: 1400,
  diskInnerRadius: 60,
  diskOuterRadius: 280,
  eventHorizonRadius: 34,
  softening: 20,
  precessionStrength: 0.27,
  lensingStrength: 1.1,
  escapeRadius: 1500,
};

const physics = new BlackHolePhysics(params);
const renderer = new SimulationRenderer(canvas, params);

function bindControls() {
  const mass = document.getElementById('mass');
  const gravityScale = document.getElementById('gravityScale');
  const particleCount = document.getElementById('particleCount');
  const lensing = document.getElementById('lensing');

  const massValue = document.getElementById('massValue');
  const gravityScaleValue = document.getElementById('gravityScaleValue');
  const particleCountValue = document.getElementById('particleCountValue');
  const lensingValue = document.getElementById('lensingValue');

  const resetButton = document.getElementById('reset');

  const refreshLabels = () => {
    massValue.textContent = Number(params.mass).toLocaleString();
    gravityScaleValue.textContent = Number(params.gravityScale).toFixed(2);
    particleCountValue.textContent = Number(params.particleCount).toLocaleString();
    lensingValue.textContent = Number(params.lensingStrength).toFixed(2);
  };

  mass.addEventListener('input', () => {
    params.mass = Number(mass.value);
    physics.setParameter('mass', params.mass);
    refreshLabels();
  });

  gravityScale.addEventListener('input', () => {
    params.gravityScale = Number(gravityScale.value);
    physics.setParameter('gravityScale', params.gravityScale);
    refreshLabels();
  });

  particleCount.addEventListener('change', () => {
    params.particleCount = Number(particleCount.value);
    physics.resetParticles(params.particleCount);
    refreshLabels();
  });

  lensing.addEventListener('input', () => {
    params.lensingStrength = Number(lensing.value);
    refreshLabels();
  });

  resetButton.addEventListener('click', () => {
    physics.resetParticles(params.particleCount);
  });

  refreshLabels();
}

function setupResize() {
  const onResize = () => renderer.resize();
  window.addEventListener('resize', onResize);
  onResize();
}

let previous = performance.now();

function animate(now) {
  const dt = Math.min((now - previous) / 1000, 0.033);
  previous = now;

  physics.step(dt);
  renderer.render(physics);

  requestAnimationFrame(animate);
}

bindControls();
setupResize();
requestAnimationFrame(animate);
