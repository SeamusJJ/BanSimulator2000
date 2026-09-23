import { playAudio } from "./audio-effects.js";

const MENU_LABELS = [
  // Tight regions around the text in the source image's 755 × 478
  // coordinate space. They intentionally stay clear of the button borders.
  { id: "play", x: 310, y: 150, w: 153, h: 66 },
  { id: "settings", x: 176, y: 297, w: 210, h: 53 },
  { id: "exit", x: 46, y: 392, w: 116, h: 55 },
];

function createHighlightCanvas(img, regions) {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const src = document.createElement("canvas");
  src.width = nw;
  src.height = nh;
  const sctx = src.getContext("2d");
  sctx.drawImage(img, 0, 0, nw, nh);
  const data = sctx.getImageData(0, 0, nw, nh);

  const lit = document.createElement("canvas");
  lit.width = nw;
  lit.height = nh;
  const litData = sctx.createImageData(nw, nh);
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const region = regions.find(
        (item) =>
          x >= item.x &&
          x < item.x + item.w &&
          y >= item.y &&
          y < item.y + item.h,
      );
      if (!region) continue;

      const i = y * nw + x;
      const o = i * 4;
      const r = data.data[o];
      const g = data.data[o + 1];
      const b = data.data[o + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      let shouldHighlight = max < 115 && max - min < 80;
      if (region.pixelMode === "ok-text") {
        // Only the near-black pixels inside the lettering bounds qualify.
        // This intentionally excludes the red button artwork and its edge.
        shouldHighlight = max < 115 && max - min < 32;
      }

      if (shouldHighlight) {
        const progress = Math.max(
          0,
          Math.min(1, (y - region.y) / Math.max(1, region.h - 1)),
        );
        const shade = Math.round(174 + progress * 46);
        litData.data[o] = shade;
        litData.data[o + 1] = Math.min(255, shade + 2);
        litData.data[o + 2] = Math.min(255, shade + 2);
        litData.data[o + 3] = data.data[o + 3];
      }
    }
  }
  lit.getContext("2d").putImageData(litData, 0, 0);
  return lit;
}

export function initImageHighlight(img, { region, target } = {}) {
  if (
    !img ||
    !target ||
    !region
  ) {
    return;
  }

  const parent = target.parentElement;
  if (!parent) return;

  let layer = null;
  let wantsHighlight = false;
  let disposed = false;

  const setup = () => {
    if (
      disposed ||
      layer ||
      !img.complete ||
      !img.naturalWidth ||
      !img.naturalHeight
    ) {
      return;
    }

    layer = document.createElement("canvas");
    layer.width = img.naturalWidth;
    layer.height = img.naturalHeight;
    Object.assign(layer.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      zIndex: "2",
      pointerEvents: "none",
      display: wantsHighlight ? "block" : "none",
    });
    layer.getContext("2d").drawImage(
      createHighlightCanvas(img, [region]),
      0,
      0,
      layer.width,
      layer.height,
    );
    parent.appendChild(layer);
  };

  const handleImageLoad = () => setup();
  if (img.complete && img.naturalWidth) setup();
  else img.addEventListener("load", handleImageLoad);

  const show = () => {
    wantsHighlight = true;
    setup();
    if (layer) layer.style.display = "block";
  };
  const hide = () => {
    wantsHighlight = false;
    if (layer) layer.style.display = "none";
  };
  target.addEventListener("mouseenter", show);
  target.addEventListener("mouseleave", hide);
  target.addEventListener("pointerenter", show);
  target.addEventListener("pointerleave", hide);

  return () => {
    disposed = true;
    img.removeEventListener("load", handleImageLoad);
    target.removeEventListener("mouseenter", show);
    target.removeEventListener("mouseleave", hide);
    target.removeEventListener("pointerenter", show);
    target.removeEventListener("pointerleave", hide);
    layer?.remove();
  };
}

export function initMenuHighlight(
  img,
  { onPlay, onSettings, onExit, onRemoveHotspots } = {},
) {
  if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) {
    return;
  }

  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const parent = img.parentElement;
  if (!parent) return;

  const lit = createHighlightCanvas(img, MENU_LABELS);

  const overlay = document.createElement("div");
  overlay.className = "menu-hotzone";
  Object.assign(overlay.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
  });
  parent.appendChild(overlay);
  const removeHotspots = () => overlay.remove();
  onRemoveHotspots?.(removeHotspots);

  const customCursor = document.createElement("img");
  customCursor.className = "menu-cursor";
  customCursor.src = "./hand_cursor.png";
  customCursor.alt = "";
  customCursor.draggable = false;
  Object.assign(customCursor.style, {
    position: "fixed",
    width: "250px",
    height: "auto",
    display: "none",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: "100",
  });
  document.body.appendChild(customCursor);

  const cursorOffsets = {
    normal: { x: 103, y: 28 },
    click: { x: 29, y: 45 },
  };
  const cursorSizes = {
    normal: "250px",
    click: "180px",
  };
  let cursorOffset = cursorOffsets.normal;
  let overLabel = false;
  let mouseIsDown = false;
  let lastPointer = {
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight / 2,
  };
  const stage = parent.closest(".stage");

  function getActiveGameFrame() {
    return (
      document.querySelector(".game-viewport") ||
      document.querySelector(".intro-frame") ||
      document.querySelector(".post-jumpscare-frame")
    );
  }

  function isPointerInsideBoundary(event) {
    if (!event || typeof event.clientX !== "number") return false;
    const frame = getActiveGameFrame();
    if (!frame) return true;
    const rect = frame.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  function isInteractive() {
    return Boolean(
      stage?.classList.contains("interactive") &&
        !stage.classList.contains("loading") &&
        !stage.classList.contains("cursor-hidden"),
    );
  }

  function moveCursor(event) {
    lastPointer = event;
    customCursor.style.left = `${event.clientX - cursorOffset.x}px`;
    customCursor.style.top = `${event.clientY - cursorOffset.y}px`;
  }

  function showCursor(event) {
    const e = event || lastPointer;
    if (!isInteractive() || !isPointerInsideBoundary(e)) {
      hideCursor();
      return;
    }
    customCursor.style.display = "block";
    moveCursor(e);
  }

  function useNormalCursor() {
    customCursor.src = "./hand_cursor.png";
    customCursor.style.width = cursorSizes.normal;
    cursorOffset = cursorOffsets.normal;
  }

  function useClickCursor() {
    customCursor.src = "./hand_cursor_click.png";
    customCursor.style.width = cursorSizes.click;
    cursorOffset = cursorOffsets.click;
  }

  function hideCursor() {
    customCursor.style.display = "none";
    useNormalCursor();
  }

  function isOverGameButton(event) {
    return Boolean(
      event?.target?.closest?.(
        ".game-button, .helpy-ok, .offensive-item, .menu-mod-badge-wrap",
      ),
    );
  }

  function handlePointerMove(event) {
    lastPointer = event;
    if (!isInteractive() || !isPointerInsideBoundary(event)) {
      hideCursor();
      return;
    }
    if (overLabel || isOverGameButton(event) || mouseIsDown) {
      useClickCursor();
    } else {
      useNormalCursor();
    }
    showCursor(event);
  }

  function handlePointerDown(event) {
    if (!isInteractive()) return;
    mouseIsDown = true;
    useClickCursor();
    showCursor(event);
  }

  function handlePointerUp(event) {
    mouseIsDown = false;
    if (overLabel || isOverGameButton(event)) useClickCursor();
    else useNormalCursor();
    if (isInteractive()) showCursor(event);
  }

  const clickAudio =
    document.getElementById("menu-click") ||
    new Audio("./mouse-click-290204.mp3");
  clickAudio.preload = "auto";
  clickAudio.volume = 0.9;
  clickAudio.load();

  const hoverAudio =
    document.getElementById("menu-hover") || new Audio("./hover.mp3");
  hoverAudio.preload = "auto";
  hoverAudio.volume = 0.6;
  hoverAudio.load();

  const hoverSound = () => {
    hoverAudio.currentTime = 0;
    playAudio(hoverAudio, { volume: hoverAudio.volume }).catch(() => {});
  };

  const clickSound = () => {
    // Reuse the preloaded element so playback starts from the click instead
    // of waiting for a new Audio object to fetch the file.
    clickAudio.currentTime = 0;
    playAudio(clickAudio, { volume: clickAudio.volume }).catch(() => {});
  };

  const hotSpots = MENU_LABELS.map((box) => {
    const cv = document.createElement("canvas");
    Object.assign(cv.style, {
      position: "absolute",
      pointerEvents: "auto",
    });
    overlay.appendChild(cv);
    return { box, cv };
  });

  function layout() {
    const r = parent.getBoundingClientRect();
    if (!r.width || !r.height) return;

    const scale = Math.max(r.width / nw, r.height / nh);
    const dx = (r.width - nw * scale) / 2;
    const dy = (r.height - nh * scale) / 2;

    for (const hotSpot of hotSpots) {
      const { box, cv } = hotSpot;
      const width = box.w * scale;
      const height = box.h * scale;
      cv.width = Math.max(1, Math.round(width));
      cv.height = Math.max(1, Math.round(height));
      cv.style.left = `${dx + box.x * scale}px`;
      cv.style.top = `${dy + box.y * scale}px`;
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
    }
  }

  function paint(cv, box) {
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(
      lit,
      box.x,
      box.y,
      box.w,
      box.h,
      0,
      0,
      cv.width,
      cv.height,
    );
  }

  function clear(cv) {
    cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);
  }

  hotSpots.forEach(({ box, cv }) => {
    cv.addEventListener("mouseenter", (event) => {
      overLabel = true;
      paint(cv, box);
      hoverSound();
      useClickCursor();
      showCursor(event);
    });
    cv.addEventListener("mousemove", moveCursor);
    cv.addEventListener("mouseleave", (event) => {
      overLabel = false;
      clear(cv);
      if (mouseIsDown) useClickCursor();
      else useNormalCursor();
      showCursor(event);
    });
    cv.addEventListener("mousedown", (event) => {
      mouseIsDown = true;
      useClickCursor();
      moveCursor(event);
    });
    cv.addEventListener("click", (event) => {
    clickSound();
    if (box.id === "play") onPlay?.(event);
    if (box.id === "settings") onSettings?.(event);
    if (box.id === "exit") onExit?.(event);
  });
  });
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mousedown", handlePointerDown);
  window.addEventListener("mouseup", handlePointerUp);
  const stageObserver = stage
    ? new MutationObserver(() => {
        if (isInteractive()) showCursor(lastPointer);
        else hideCursor();
      })
    : null;
  stageObserver?.observe(stage, {
    attributes: true,
    attributeFilter: ["class"],
  });

  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(parent);
  window.addEventListener("resize", layout);

  return () => {
    ro.disconnect();
    window.removeEventListener("resize", layout);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mousedown", handlePointerDown);
    window.removeEventListener("mouseup", handlePointerUp);
    stageObserver?.disconnect();
    customCursor.remove();
    removeHotspots();
  };
}
