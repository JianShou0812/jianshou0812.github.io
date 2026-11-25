// The edit timeline maps seconds in the finished clip to speed relative to the original footage.
document.querySelectorAll("[data-speed-timeline]").forEach(label => {
  const video = label.closest("figure").querySelector("video");
  const segments = JSON.parse(label.dataset.speedTimeline).reverse();

  function showSpeed() {
    const [, rate] = segments.find(([start]) => start <= video.currentTime);
    const value = rate + "×";
    if (label.textContent !== value) label.textContent = value;
  }

  video.addEventListener("timeupdate", showSpeed);
  video.addEventListener("seeked", showSpeed);
  showSpeed();
});

document.querySelectorAll("[data-gallery-group]").forEach(group => {
  const videos = Array.from(group.querySelectorAll("video"));
  const button = group.querySelector("[data-gallery-play]");
  const label = button.querySelector("span");
  const status = group.querySelector("[data-gallery-status]");

  function isPlaying() {
    return videos.some(video => !video.paused && !video.ended);
  }

  function updateButton() {
    const playing = isPlaying();
    button.classList.toggle("is-playing", playing);
    label.textContent = playing ? "Pause all" : "Play all";
  }

  for (const video of videos) {
    for (const event of ["play", "pause", "ended"]) {
      video.addEventListener(event, updateButton);
    }
  }

  button.addEventListener("click", async () => {
    if (isPlaying()) {
      videos.forEach(video => video.pause());
      return;
    }
    status.textContent = "";
    const results = await Promise.allSettled(videos.map(video => video.play()));
    if (results.some(result => result.status === "rejected" && result.reason.name !== "AbortError")) {
      status.textContent = "Some videos could not start together. Use their individual play controls.";
    }
  });

  button.hidden = false;
});
