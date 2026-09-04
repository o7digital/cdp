(() => {
  "use strict";

  const config = window.SITE_CONFIG;
  if (!config) return;

  const locale = document.documentElement.lang.toLowerCase().startsWith("es") ? "es" : "en";
  const content = config.locales[locale];

  const externalAttributes = (universe) => universe.id === "node"
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";

  const renderUniverseCard = (universe) => `
    <a class="universe-card reveal" data-universe="${universe.id}" href="${universe.url}"${externalAttributes(universe)} aria-label="${universe.cta} — ${universe.name}">
      <img src="${universe.image}" width="${universe.imageWidth}" height="${universe.imageHeight}" loading="lazy" alt="${universe.alt}">
      <div class="universe-card__top"><span>${universe.number} / ${universe.category}</span><span>${content.universeLabel}</span></div>
      <div class="universe-card__body">
        <h3>${universe.displayName}</h3>
        <p>${universe.description}</p>
        <div class="universe-card__link"><span>${universe.cta}</span><b aria-hidden="true">↗</b></div>
      </div>
    </a>`;

  const renderFooterLink = (universe) => `
    <a class="footer__universe" href="${universe.url}"${externalAttributes(universe)}>
      <span>${universe.number} · ${universe.name}</span><span aria-hidden="true">↗</span>
    </a>`;

  document.querySelector("#universeGrid").innerHTML = content.universes.map(renderUniverseCard).join("");
  document.querySelector("#footerUniverses").innerHTML = content.universes.map(renderFooterLink).join("");
  document.querySelector("#instagramLink").href = config.social.instagram;
  document.querySelector("#pinterestLink").href = config.social.pinterest;
  document.querySelector("#currentYear").textContent = new Date().getFullYear();

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Concha de Palacio",
    url: config.groupUrl,
    email: config.email,
    telephone: config.phone,
    description: content.organizationDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: config.location.city,
      addressRegion: config.location.region,
      addressCountry: config.location.country
    },
    sameAs: [config.social.instagram, config.social.pinterest],
    subOrganization: content.universes.map(({ name, url }) => ({ "@type": "Organization", name, url }))
  };
  const structuredData = document.createElement("script");
  structuredData.type = "application/ld+json";
  structuredData.textContent = JSON.stringify(organizationData);
  document.head.appendChild(structuredData);

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
