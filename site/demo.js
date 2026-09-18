"use strict";
const demoUrl = window.WORLDFORGE_DEMO?.videoUrl;
if (typeof demoUrl === "string" && demoUrl.trim()) {
  try {
    const source = new URL(demoUrl, window.location.href);
    if (source.origin !== window.location.origin && source.protocol !== "https:") {
      throw new Error("Use a local or HTTPS video source.");
    }
    const video = document.getElementById("demo-video");
    video.addEventListener("loadedmetadata", () => {
      if (video.videoWidth && video.videoHeight) {
        document.getElementById("demo-panel").style.setProperty("--video-ratio", String(video.videoWidth / video.videoHeight));
      }
      document.getElementById("demo-placeholder").hidden = true;
      document.getElementById("video-note").hidden = false;
      video.hidden = false;
    });
    video.addEventListener("error", () => {
      document.getElementById("demo-placeholder").hidden = false;
      document.getElementById("video-note").hidden = true;
      video.hidden = true;
      document.querySelector("#demo-placeholder p").textContent = "The recording is temporarily unavailable. Please try again later.";
    });
    video.src = source.href;
  } catch (error) {
    console.error("Demo video configuration:", error.message);
  }
}
