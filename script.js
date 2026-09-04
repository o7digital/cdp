(() => {
  "use strict";

  document.querySelector("#currentYear").textContent = new Date().getFullYear();

  const topbar = document.querySelector("#topbar");
  const menu = document.querySelector("#menu");
  const menuBtn = document.querySelector("#menuBtn");
  const menuLabel = menuBtn.querySelector(".menu-btn__label");
  let lastFocused = null;

  const menuFocusable = () => [...menu.querySelectorAll("a[href], button:not([disabled])")];

  function toggleMenu(force) {
    const open = typeof force === "boolean" ? force : !menu.classList.contains("open");
    lastFocused = open ? document.activeElement : lastFocused;
    menu.classList.toggle("open", open);
    topbar.classList.toggle("menu-active", open);
    document.body.classList.toggle("menu-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? menuBtn.dataset.closeLabel : menuBtn.dataset.openLabel);
    menuLabel.textContent = open ? menuBtn.dataset.closeText : menuBtn.dataset.openText;
    if (open) window.setTimeout(() => menuFocusable()[0]?.focus(), 80);
    else lastFocused?.focus();
  }

  menuBtn.addEventListener("click", () => toggleMenu());
  menu.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener("click", () => toggleMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) toggleMenu(false);
    if (event.key !== "Tab" || !menu.classList.contains("open")) return;
    const focusable = [menuBtn, ...menuFocusable()];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  let scrollQueued = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroMedia = document.querySelector(".hero__media");

  function updateOnScroll() {
    topbar.classList.toggle("scrolled", window.scrollY > 70);
    if (!reducedMotion && window.scrollY < window.innerHeight * 1.2) {
      heroMedia.style.transform = `scale(1.035) translateY(${window.scrollY * .1}px)`;
    }
    scrollQueued = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollQueued) {
      window.requestAnimationFrame(updateOnScroll);
      scrollQueued = true;
    }
  }, { passive: true });
  updateOnScroll();

  if (reducedMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("in"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  }
})();
