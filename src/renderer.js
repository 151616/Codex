export class SimulationRenderer {
  constructor(canvas, params) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.params = params;

    this.camera = {
      zoom: 1,
      x: 0,
      y: 0,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      panStartX: 0,
      panStartY: 0,
    };

    this.backgroundStars = this.#makeBackgroundStars(1200);
    this.#setupCanvasAndCameraControls();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.params.center.x = width * 0.5;
    this.params.center.y = height * 0.5;
    this.params.escapeRadius = Math.max(width, height) * 1.2;
  }

  render(physics) {
    const { ctx } = this;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const { center, eventHorizonRadius, lensingStrength } = this.params;

    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, width, height);

    this.#drawLensedBackground(width, height, center, lensingStrength);

    ctx.save();
    this.#applyCameraTransform();

    this.#drawAccretionGlow(center);
    this.#drawParticles(physics.particles);
    this.#drawBlackHole(center, eventHorizonRadius);

    ctx.restore();
  }

  #applyCameraTransform() {
    const { ctx } = this;
    const { zoom, x, y } = this.camera;
    ctx.translate(this.canvas.clientWidth * 0.5, this.canvas.clientHeight * 0.5);
    ctx.scale(zoom, zoom);
    ctx.translate(-this.canvas.clientWidth * 0.5 + x, -this.canvas.clientHeight * 0.5 + y);
  }

  #drawParticles(particles) {
    const { ctx } = this;
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const alpha = 0.24 + 0.65 * Math.abs(Math.sin(p.life * 1.2));
      ctx.fillStyle = `hsla(${p.hue.toFixed(0)}, 95%, 62%, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  #drawBlackHole(center, radius) {
    const { ctx } = this;
    const ringOuter = radius * 2.2;

    const ring = ctx.createRadialGradient(center.x, center.y, radius * 0.6, center.x, center.y, ringOuter);
    ring.addColorStop(0, 'rgba(255,180,120,0.10)');
    ring.addColorStop(0.35, 'rgba(255,145,78,0.35)');
    ring.addColorStop(0.55, 'rgba(255,200,110,0.15)');
    ring.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(center.x, center.y, ringOuter, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 235, 170, 0.25)';
    ctx.lineWidth = Math.max(1, radius * 0.06);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 1.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  #drawAccretionGlow(center) {
    const { ctx } = this;
    const { diskOuterRadius } = this.params;
    const g = ctx.createRadialGradient(center.x, center.y, 20, center.x, center.y, diskOuterRadius * 1.05);
    g.addColorStop(0, 'rgba(255, 200, 120, 0.02)');
    g.addColorStop(0.35, 'rgba(255, 120, 60, 0.06)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(center.x, center.y, diskOuterRadius * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  #drawLensedBackground(width, height, center, lensingStrength) {
    const { ctx } = this;
    const radius = this.params.eventHorizonRadius;

    for (let i = 0; i < this.backgroundStars.length; i += 1) {
      const s = this.backgroundStars[i];
      const dx = s.x - center.x;
      const dy = s.y - center.y;
      const r = Math.hypot(dx, dy);
      const bend = lensingStrength * (radius * radius * 12) / (r * r + 6000);
      const nx = dx / (r + 0.0001);
      const ny = dy / (r + 0.0001);

      const sx = s.x + nx * bend;
      const sy = s.y + ny * bend;

      ctx.fillStyle = `rgba(205, 220, 255, ${s.alpha})`;
      ctx.fillRect(sx, sy, s.size, s.size);
    }
  }

  #makeBackgroundStars(count) {
    const stars = [];
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() < 0.82 ? 1 : 2,
        alpha: (0.15 + Math.random() * 0.8).toFixed(3),
      });
    }
    return stars;
  }

  #setupCanvasAndCameraControls() {
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.08 : 0.92;
      this.camera.zoom = Math.min(3.5, Math.max(0.4, this.camera.zoom * factor));
    });

    this.canvas.addEventListener('mousedown', (event) => {
      this.camera.dragging = true;
      this.camera.dragStartX = event.clientX;
      this.camera.dragStartY = event.clientY;
      this.camera.panStartX = this.camera.x;
      this.camera.panStartY = this.camera.y;
    });

    window.addEventListener('mouseup', () => {
      this.camera.dragging = false;
    });

    window.addEventListener('mousemove', (event) => {
      if (!this.camera.dragging) {
        return;
      }

      const dx = (event.clientX - this.camera.dragStartX) / this.camera.zoom;
      const dy = (event.clientY - this.camera.dragStartY) / this.camera.zoom;
      this.camera.x = this.camera.panStartX - dx;
      this.camera.y = this.camera.panStartY - dy;
    });
  }
}
