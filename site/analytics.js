"use strict";
// Vercel's static-site integration; local previews do not collect page views.
if (window.location.protocol === "https:") {
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
  const script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  document.head.appendChild(script);
}
