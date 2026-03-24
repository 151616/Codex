export class BlackHolePhysics {
  constructor(params) {
    this.params = { ...params };
    this.particles = [];
    this.resetParticles(this.params.particleCount);
  }

  setParameter(key, value) {
    this.params[key] = value;
  }

  resetParticles(count = this.params.particleCount) {
    this.params.particleCount = count;
    this.particles = [];

    for (let i = 0; i < count; i += 1) {
      this.particles.push(this.#spawnDiskParticle());
    }
  }

  #spawnDiskParticle() {
    const {
      diskInnerRadius,
      diskOuterRadius,
      center,
      mass,
      gravitationalConstant,
      gravityScale,
    } = this.params;

    const angle = Math.random() * Math.PI * 2;
    const radius = diskInnerRadius + Math.random() ** 1.6 * (diskOuterRadius - diskInnerRadius);
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;

    // Tangential velocity for nearly circular orbit in a Newtonian potential.
    const speed = Math.sqrt((gravitationalConstant * mass * gravityScale) / radius);
    const jitter = 0.78 + Math.random() * 0.4;
    const vx = -Math.sin(angle) * speed * jitter;
    const vy = Math.cos(angle) * speed * jitter;

    return {
      x,
      y,
      vx,
      vy,
      life: Math.random(),
      hue: 18 + Math.random() * 38,
      size: 0.9 + Math.random() * 1.8,
    };
  }

  step(dt) {
    const {
      center,
      mass,
      gravitationalConstant,
      softening,
      eventHorizonRadius,
      gravityScale,
      precessionStrength,
      escapeRadius,
    } = this.params;

    const gm = gravitationalConstant * mass * gravityScale;

    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      const dx = p.x - center.x;
      const dy = p.y - center.y;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2);
      const inv = 1 / Math.sqrt(r2 + softening * softening);
      const inv3 = inv * inv * inv;

      // Newtonian acceleration with softening to avoid singularity explosion.
      let ax = -gm * dx * inv3;
      let ay = -gm * dy * inv3;

      // Relativistic-inspired precession term (small tangential correction).
      const tangentialScale = (precessionStrength * gm) / (r2 + softening * softening);
      ax += tangentialScale * -dy * inv;
      ay += tangentialScale * dx * inv;

      // Semi-implicit Euler integration: stable enough for many particles.
      p.vx += ax * dt;
      p.vy += ay * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt * 0.1;

      if (r < eventHorizonRadius || r > escapeRadius) {
        this.particles[i] = this.#spawnDiskParticle();
      }
    }
  }
}
