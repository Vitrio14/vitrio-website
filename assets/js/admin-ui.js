/* ======================================================
   ADMIN UI — VITRIO (REFRACTOR V1)
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const glow = document.getElementById("cursorGlow");
  if (glow) {
    document.addEventListener("mousemove", e => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    });
  }

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-theme");
    }

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      localStorage.setItem(
        "theme",
        document.body.classList.contains("light-theme") ? "light" : "dark"
      );
    });
  }
});
