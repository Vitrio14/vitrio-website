function initParticles(canvasId, count = 70, color = "rgba(169,112,255,0.5)") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resize);
  resize();

  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 1,
    s: Math.random() * 1 + 0.5,
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.y += p.s;
      if (p.y > window.innerHeight) {
        p.y = -5;
        p.x = Math.random() * window.innerWidth;
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("bgParticles")) initParticles("bgParticles", 70);
  if (document.getElementById("bgCanvas")) initParticles("bgCanvas", 70);
});
