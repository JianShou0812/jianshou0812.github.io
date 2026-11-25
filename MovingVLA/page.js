"use strict";

const film = document.getElementById("film-player");
const cover = document.getElementById("film-cover");
const statusLine = document.getElementById("film-status");
const chapters = Array.from(document.querySelectorAll("[data-chapter]"));
let pendingStart = 0;

function seekToChapter() {
  film.currentTime = pendingStart;
}

function playFilm(seconds) {
  pendingStart = seconds;
  cover.hidden = true;
  film.controls = true;
  statusLine.hidden = true;
  if (film.readyState >= HTMLMediaElement.HAVE_METADATA) seekToChapter();
  else film.addEventListener("loadedmetadata", seekToChapter, {once: true});
  film.play().catch(error => {
    if (error.name === "AbortError") return;
    statusLine.textContent = "Use the video controls to start playback.";
    statusLine.hidden = false;
  });
}

cover.hidden = false;
film.controls = false;
cover.addEventListener("click", () => {
  playFilm(0);
  film.focus({preventScroll: true});
});
for (const chapter of chapters) {
  chapter.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    playFilm(Number(chapter.dataset.chapter));
    film.scrollIntoView({block: "nearest"});
  });
}
function markChapter() {
  const active = chapters.filter(link => Number(link.dataset.chapter) <= film.currentTime).pop();
  for (const link of chapters) {
    if (link === active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
}
film.addEventListener("timeupdate", markChapter);
film.addEventListener("seeked", markChapter);

const viewer = document.getElementById("figure-viewer");
const viewerTitle = document.getElementById("viewer-title");
const zoom = document.getElementById("figure-zoom");
const imageArea = viewer.querySelector(".viewer-image");
const image = imageArea.querySelector("img");

function setZoom(actualSize) {
  imageArea.classList.toggle("full-size", actualSize);
  zoom.setAttribute("aria-pressed", String(actualSize));
  imageArea.scrollTo(0, 0);
}
for (const opener of document.querySelectorAll("[data-paper-figure]")) {
  opener.addEventListener("click", () => {
    const source = opener.querySelector("img");
    viewerTitle.textContent = opener.closest("figure").querySelector("figcaption strong").textContent;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    setZoom(false);
    viewer.showModal();
  });
}
zoom.addEventListener("click", () => setZoom(zoom.getAttribute("aria-pressed") !== "true"));
document.getElementById("figure-close").addEventListener("click", () => viewer.close());
viewer.addEventListener("click", event => {
  if (event.target === viewer) viewer.close();
});

function revealResult(fragment) {
  const target = document.getElementById(fragment.slice(1));
  if (target instanceof HTMLDetailsElement) target.open = true;
}
window.addEventListener("hashchange", () => revealResult(location.hash));
revealResult(location.hash);
