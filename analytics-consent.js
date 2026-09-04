(() => {
  "use strict";

  const measurementId = "G-QTFM7TGDX6";
  const storageKey = "cdp_analytics_consent";
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const isSpanish = document.documentElement.lang.toLowerCase().startsWith("es");
  const copy = isSpanish ? {
    title: "Tu privacidad",
    text: "Usamos Google Analytics únicamente con tu autorización para comprender el uso del sitio. Puedes aceptar, rechazar o cambiar tu elección en cualquier momento.",
    accept: "Aceptar analítica",
    reject: "Rechazar",
    settings: "Configurar cookies",
    privacy: "Aviso de privacidad",
    privacyUrl: "/aviso-legal.html"
  } : {
    title: "Your privacy",
    text: "We use Google Analytics only with your permission to understand how the site is used. You can accept, reject or change your choice at any time.",
    accept: "Accept analytics",
    reject: "Reject",
    settings: "Cookie settings",
    privacy: "Privacy notice",
    privacyUrl: "/legal-notice.html"
  };

  let banner;

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !["granted", "denied"].includes(saved.value) || Date.now() - saved.savedAt > consentLifetime) return null;
      return saved.value;
    } catch {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ value, savedAt: Date.now() }));
    } catch {
      // The visitor's choice still applies for the current page if storage is unavailable.
    }
  }

  function removeAnalyticsCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      if (!name.startsWith("_ga")) return;
      [location.hostname, `.${location.hostname}`, ".conchadepalacio.com"].forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax; Secure`;
      });
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; Secure`;
    });
  }

  function loadAnalytics() {
    if (document.querySelector(`script[data-measurement-id="${measurementId}"]`)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){window.dataLayer.push(arguments);};
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted"
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.dataset.measurementId = measurementId;
    document.head.appendChild(script);
  }

  function hideBanner() {
    banner?.remove();
    banner = null;
  }

  function setChoice(value) {
    const previousChoice = readChoice();
    saveChoice(value);
    window[`ga-disable-${measurementId}`] = value !== "granted";
    hideBanner();
    if (value === "granted") {
      loadAnalytics();
    } else {
      removeAnalyticsCookies();
      if (previousChoice === "granted") location.reload();
    }
  }

  function showBanner() {
    hideBanner();
    banner = document.createElement("section");
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "consent-title");
    banner.innerHTML = `
      <div class="consent-banner__copy">
        <h2 id="consent-title">${copy.title}</h2>
        <p>${copy.text} <a href="${copy.privacyUrl}">${copy.privacy}</a>.</p>
      </div>
      <div class="consent-banner__actions">
        <button type="button" data-consent="denied">${copy.reject}</button>
        <button type="button" data-consent="granted">${copy.accept}</button>
      </div>`;
    banner.querySelectorAll("[data-consent]").forEach((button) => {
      button.addEventListener("click", () => setChoice(button.dataset.consent));
    });
    document.body.appendChild(banner);
    banner.querySelector("button")?.focus({ preventScroll: true });
  }

  const settingsButton = document.createElement("button");
  settingsButton.type = "button";
  settingsButton.className = "consent-settings";
  settingsButton.textContent = copy.settings;
  settingsButton.addEventListener("click", showBanner);
  document.body.appendChild(settingsButton);

  const choice = readChoice();
  if (choice === "granted") loadAnalytics();
  else if (choice === "denied") window[`ga-disable-${measurementId}`] = true;
  else showBanner();
})();
