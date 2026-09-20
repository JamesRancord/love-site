(() => {
    "use strict";

    const canvas = document.getElementById("fireworks");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    const COLORS = ["#ff2d55", "#ff8fa3", "#ffd166", "#8ecae6", "#c77dff", "#ffffff"];
    const MAX_PARTICLES = 1200;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const rockets = [];
    const particles = [];

    const rand = (min, max) => Math.random() * (max - min) + min;
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#06040f";
        ctx.fillRect(0, 0, width, height);
    }

    function spawnRocket() {
        rockets.push({
            x: rand(width * 0.15, width * 0.85),
            y: height + 10,
            vx: rand(-0.6, 0.6),
            vy: rand(-12, -9),
            targetY: rand(height * 0.15, height * 0.45),
            color: pick(COLORS),
            trail: [],
        });
    }

    function explode(x, y, color) {
        const baseCount = prefersReduced ? 30 : 70;
        const count = baseCount + ((Math.random() * 40) | 0);
        for (let i = 0; i < count; i++) {
            if (particles.length >= MAX_PARTICLES) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = rand(1.5, 6.5);
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: rand(0.008, 0.018),
                color: Math.random() < 0.85 ? color : "#ffffff",
                size: rand(1.2, 2.6),
            });
        }
    }

    function update() {
        for (let i = rockets.length - 1; i >= 0; i--) {
            const r = rockets[i];
            r.trail.push({ x: r.x, y: r.y });
            if (r.trail.length > 14) r.trail.shift();

            r.x += r.vx;
            r.y += r.vy;
            r.vy += 0.12;

            if (r.vy >= 0 || r.y <= r.targetY) {
                explode(r.x, r.y, r.color);
                rockets.splice(i, 1);
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.985;
            p.vy *= 0.985;
            p.vy += 0.04;
            p.life -= p.decay;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function render() {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(6, 4, 15, 0.22)";
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = "lighter";

        for (const r of rockets) {
            for (let i = 0; i < r.trail.length; i++) {
                const t = r.trail[i];
                const alpha = (i / r.trail.length) * 0.6;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(t.x, t.y, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = r.color;
            ctx.beginPath();
            ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const p of particles) {
            ctx.globalAlpha = Math.max(p.life, 0);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    let lastSpawn = 0;
    let nextDelay = 550;

    function loop(t) {
        if (t - lastSpawn > nextDelay) {
            spawnRocket();
            lastSpawn = t;
            nextDelay = rand(400, 900);
        }
        update();
        render();
        requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            lastSpawn = performance.now();
        }
    });

    resize();

    [0, 200, 420, 700].forEach((delay, i) =>
        setTimeout(spawnRocket, delay + i * 30)
    );

    requestAnimationFrame(loop);
})();