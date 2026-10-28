/* ============================================================
   KARTU MAHASISWA — script.js
   Bagian 1: state, storage, generator, render kartu & album/duel
   ============================================================ */
"use strict";

const STORAGE_KEY = "kartu-mahasiswa.album.v1";
const THEME_KEY = "kartu-mahasiswa.theme.v1";
const MAX_SERIAL = 1000;

const els = {
  form: document.getElementById("packForm"),
  nameInput: document.getElementById("nameInput"),
  charCount: document.getElementById("charCount"),
  inputShell: document.getElementById("inputShell"),
  clearBtn: document.getElementById("clearBtn"),
  formError: document.getElementById("formError"),
  openPackBtn: document.getElementById("openPackBtn"),
  openPackLabel: document.getElementById("openPackLabel"),
  randomNameBtn: document.getElementById("randomNameBtn"),

  stage: document.getElementById("stage"),
  stageMeta: document.getElementById("stageMeta"),
  packWrap: document.getElementById("packWrap"),
  pack: document.getElementById("pack"),
  packEmblem: document.getElementById("packEmblem"),
  packName: document.getElementById("packName"),
  packTagline: document.getElementById("packTagline"),
  packFlash: document.getElementById("packFlash"),
  cardShell: document.getElementById("cardShell"),
  cardTilt: document.getElementById("cardTilt"),
  stageCard: document.getElementById("stageCard"),
  burstLayer: document.getElementById("burstLayer"),
  downloadBtn: document.getElementById("downloadBtn"),
  downloadLabel: document.getElementById("downloadLabel"),
  status: document.getElementById("status"),
  gyroBtn: document.getElementById("gyroBtn"),
  gyroLabel: document.getElementById("gyroLabel"),
  tiltHintText: document.getElementById("tiltHintText"),

  albumGrid: document.getElementById("albumGrid"),
  albumCount: document.getElementById("albumCount"),
  navAlbumCount: document.getElementById("navAlbumCount"),
  clearAlbumBtn: document.getElementById("clearAlbumBtn"),

  duelSelectA: document.getElementById("duelSelectA"),
  duelSelectB: document.getElementById("duelSelectB"),
  duelPreviewA: document.getElementById("duelPreviewA"),
  duelPreviewB: document.getElementById("duelPreviewB"),
  duelBtn: document.getElementById("duelBtn"),
  duelHint: document.getElementById("duelHint"),
  duelResult: document.getElementById("duelResult"),

  dialog: document.getElementById("cardDialog"),
  dialogTitle: document.getElementById("dialogTitle"),
  dialogMeta: document.getElementById("dialogMeta"),
  dialogCard: document.getElementById("dialogCard"),
  dialogClose: document.getElementById("dialogClose"),
  dialogDownload: document.getElementById("dialogDownload"),
  dialogDelete: document.getElementById("dialogDelete"),

  toastStack: document.getElementById("toastStack"),
  year: document.getElementById("year")
};

const themeInputs = Array.from(document.querySelectorAll('input[name="theme"]'));
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 640px)");
const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

let collection = loadCollection();
let currentCard = null;
let modalCard = null;
let selectedTheme = getSavedTheme();
let isOpening = false;
let lastRandomName = "";
let tiltFrame = 0;
let pendingPoint = null;
let touchTilting = false;
let gyroEnabled = false;
let gyroBase = null;
let gyroFrame = 0;
let gyroPending = null;
let gyroHasEvent = false;

/* ------------------------------------------------------------
   Utilitas
   ------------------------------------------------------------ */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickUnique(list, count) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hexToRgba(hex, alpha) {
  const clean = String(hex).replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean;
  const number = parseInt(full, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function normalizeName(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getTheme(id) {
  return THEMES.find((theme) => theme.id === id) || THEMES[0];
}

function getRarity(id) {
  return RARITIES.find((rarity) => rarity.id === id) || RARITIES[0];
}

function totalStats(card) {
  return card.stats.reduce((sum, stat) => sum + stat.value, 0);
}

function formatSerial(card) {
  return `#${String(card.serialNumber).padStart(4, "0")}/${MAX_SERIAL}`;
}

function findCard(serial) {
  const number = Number(serial);
  return collection.find((card) => card.serialNumber === number) || null;
}

function paletteFor(themeId, rarityId) {
  const theme = getTheme(themeId);
  const rarity = getRarity(rarityId);
  const rc = theme.dark ? rarity.color : rarity.light;
  const rc2 = theme.dark ? rarity.color2 : rarity.light2;
  return {
    rc,
    rc2,
    line: hexToRgba(rc, 0.44),
    soft: hexToRgba(rc, 0.13),
    glow: hexToRgba(rc, 0.38)
  };
}

function paletteStyle(palette) {
  return `--rc:${palette.rc};--rc-2:${palette.rc2};--rc-line:${palette.line};--rc-soft:${palette.soft};--rc-glow:${palette.glow};`;
}

/* ------------------------------------------------------------
   Penyimpanan lokal
   ------------------------------------------------------------ */
function getSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (THEMES.some((theme) => theme.id === saved)) return saved;
  } catch (error) {
    // localStorage bisa diblokir; pakai tema default.
  }
  return "cyberpunk";
}

function saveTheme(themeId) {
  try {
    localStorage.setItem(THEME_KEY, themeId);
  } catch (error) {
    // Abaikan jika penyimpanan tidak tersedia.
  }
}

function isValidCard(card) {
  if (!card || typeof card !== "object") return false;
  if (typeof card.name !== "string" || !card.name.trim()) return false;
  if (!THEMES.some((theme) => theme.id === card.theme)) return false;
  if (!RARITIES.some((rarity) => rarity.id === card.rarity)) return false;
  if (!Number.isInteger(card.serialNumber) || card.serialNumber < 1 || card.serialNumber > MAX_SERIAL) return false;
  if (!Array.isArray(card.stats) || card.stats.length !== STAT_DEFS.length) return false;
  if (!card.stats.every((stat) => stat && typeof stat.label === "string" && Number.isFinite(stat.value))) return false;
  if (!Array.isArray(card.moves) || card.moves.length < 2 || card.moves.length > 3) return false;
  if (!card.moves.every((move) => move && typeof move.name === "string" && typeof move.desc === "string")) return false;
  if (typeof card.nickname !== "string" || !card.nickname) return false;
  if (typeof card.weakness !== "string" || !card.weakness) return false;
  if (typeof card.quote !== "string" || !card.quote) return false;
  return true;
}

function loadCollection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    return parsed
      .filter((card) => {
        if (!isValidCard(card) || seen.has(card.serialNumber)) return false;
        seen.add(card.serialNumber);
        return true;
      })
      .slice(0, MAX_SERIAL)
      .map((card) => ({
        ...card,
        emblem: typeof card.emblem === "string" ? card.emblem : "🎓",
        createdAt: Number.isFinite(card.createdAt) ? card.createdAt : Date.now()
      }));
  } catch (error) {
    return [];
  }
}

function persistCollection() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan album:", error);
    return false;
  }
}

function saveCardToAlbum(card) {
  collection.unshift(card);
  if (!persistCollection()) {
    collection.shift();
    return false;
  }
  return true;
}

function removeCardFromAlbum(serialNumber) {
  const index = collection.findIndex((card) => card.serialNumber === Number(serialNumber));
  if (index === -1) return false;
  const [removed] = collection.splice(index, 1);
  if (!persistCollection()) {
    collection.splice(index, 0, removed);
    return false;
  }
  return true;
}

/* ------------------------------------------------------------
   Generator kartu
   ------------------------------------------------------------ */
function rollRarity() {
  const roll = Math.random() * 100;
  let accumulator = 0;
  for (const rarity of RARITIES) {
    accumulator += rarity.chance;
    if (roll < accumulator) return rarity;
  }
  return RARITIES[0];
}

function pickSerialNumber() {
  const used = new Set(collection.map((card) => card.serialNumber));
  if (used.size >= MAX_SERIAL) return null;
  const start = randomInt(0, MAX_SERIAL - 1);
  for (let offset = 0; offset < MAX_SERIAL; offset += 1) {
    const candidate = ((start + offset) % MAX_SERIAL) + 1;
    if (!used.has(candidate)) return candidate;
  }
  return null;
}

function createCard(rawName, themeId) {
  const serialNumber = pickSerialNumber();
  if (!serialNumber) return null;

  const theme = getTheme(themeId);
  const rarity = rollRarity();
  const bonus = { common: 0, rare: 4, epic: 8, legendary: 12 }[rarity.id];

  const stats = STAT_DEFS.map((definition) => ({
    key: definition.key,
    label: definition.label,
    value: clamp(randomInt(33, 76) + bonus + randomInt(0, 4), 25, 99)
  }));

  const moves = pickUnique(MOVES, Math.random() < 0.55 ? 3 : 2).map((move) => ({
    name: move.name,
    desc: move.desc
  }));

  return {
    name: normalizeName(rawName),
    nickname: pick(NICKNAMES),
    theme: theme.id,
    rarity: rarity.id,
    serialNumber,
    stats,
    moves,
    weakness: pick(WEAKNESSES),
    quote: pick(QUOTES),
    emblem: pick(EMBLEMS),
    createdAt: Date.now()
  };
}

/* ------------------------------------------------------------
   Radar chart
   ------------------------------------------------------------ */
function radarSvg(stats) {
  const cx = 190;
  const cy = 96;
  const radius = 72;
  const labelRadius = 105;
  const count = stats.length;
  const angleAt = (index) => (-Math.PI / 2) + (index * Math.PI * 2) / count;
  const pointAt = (index, fraction) => {
    const angle = angleAt(index);
    return [
      cx + Math.cos(angle) * radius * fraction,
      cy + Math.sin(angle) * radius * fraction
    ];
  };
  const pointsToString = (points) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  let markup = `<svg viewBox="0 0 380 205" aria-hidden="true">`;

  for (let level = 1; level <= 4; level += 1) {
    const points = stats.map((_, index) => pointAt(index, level / 4));
    markup += `<polygon class="radar-grid${level === 4 ? " outer" : ""}" points="${pointsToString(points)}" />`;
  }

  stats.forEach((_, index) => {
    const [x, y] = pointAt(index, 1);
    markup += `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`;
  });

  const shapePoints = stats.map((stat, index) => pointAt(index, clamp(stat.value, 0, 100) / 100));
  markup += `<polygon class="radar-shape" points="${pointsToString(shapePoints)}" />`;

  shapePoints.forEach(([x, y]) => {
    markup += `<circle class="radar-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" />`;
  });

  stats.forEach((stat, index) => {
    const definition = STAT_DEFS.find((item) => item.key === stat.key) || STAT_DEFS[index];
    const lines = definition ? definition.radar : [stat.label];
    const angle = angleAt(index);
    const lx = cx + Math.cos(angle) * labelRadius;
    const ly = cy + Math.sin(angle) * labelRadius;
    const isTop = index === 0;
    const anchor = isTop ? "middle" : (Math.cos(angle) > 0 ? "start" : "end");
    const x = isTop ? lx : lx + (Math.cos(angle) > 0 ? 6 : -6);
    const startY = isTop ? 11 : ly - (lines.length === 2 ? 8 : 0);
    lines.forEach((line, lineIndex) => {
      markup += `<text class="radar-label" x="${x.toFixed(1)}" y="${(startY + lineIndex * 11).toFixed(1)}" text-anchor="${anchor}">${escapeHtml(line)}</text>`;
    });
    const valueY = isTop ? 23 : startY + lines.length * 11 + 1;
    markup += `<text class="radar-value" x="${x.toFixed(1)}" y="${valueY.toFixed(1)}" text-anchor="${anchor}">${stat.value}</text>`;
  });

  markup += "</svg>";
  return markup;
}

function miniRadarSvg(stats) {
  const cx = 40;
  const cy = 40;
  const radius = 27;
  const count = stats.length;
  const angleAt = (index) => (-Math.PI / 2) + (index * Math.PI * 2) / count;
  const pointAt = (index, fraction) => {
    const angle = angleAt(index);
    return [
      cx + Math.cos(angle) * radius * fraction,
      cy + Math.sin(angle) * radius * fraction
    ];
  };
  const toString = (points) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const outer = stats.map((_, index) => pointAt(index, 1));
  const shape = stats.map((stat, index) => pointAt(index, clamp(stat.value, 0, 100) / 100));
  return `<svg class="mini-radar" viewBox="0 0 80 80" aria-hidden="true">
    <polygon class="mini-grid" points="${toString(outer)}" />
    <polygon class="mini-shape" points="${toString(shape)}" />
  </svg>`;
}

/* ------------------------------------------------------------
   Render kartu
   ------------------------------------------------------------ */
function cardMarkup(card) {
  const theme = getTheme(card.theme);
  const rarity = getRarity(card.rarity);
  const palette = paletteFor(card.theme, card.rarity);
  const nameLength = Array.from(card.name).length;
  const nameClass = nameLength > 20 ? " name-xlong" : nameLength > 14 ? " name-long" : "";
  const total = totalStats(card);
  const aria = `Kartu ${rarity.label} ${card.name}, tema ${theme.name}, total statistik ${total}. Julukan ${card.nickname}.`;

  const moves = card.moves.map((move, index) => `
    <li class="gc-move">
      <span class="gc-move-num" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      <span class="gc-move-body">
        <strong class="gc-move-name">${escapeHtml(move.name)}</strong>
        <span class="gc-move-desc">${escapeHtml(move.desc)}</span>
      </span>
    </li>`).join("");

  const statList = card.stats
    .map((stat) => `<li>${escapeHtml(stat.label)}: ${stat.value}</li>`)
    .join("");

  return `<article class="game-card${nameClass}" data-theme="${theme.id}" data-rarity="${rarity.id}" style="${paletteStyle(palette)}" aria-label="${escapeHtml(aria)}">
    <div class="gc-bg" aria-hidden="true"></div>
    <div class="gc-frame" aria-hidden="true"></div>
    <div class="gc-holo" aria-hidden="true"></div>
    <div class="gc-sparkles" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>
    <div class="gc-content">
      <header class="gc-head">
        <span class="gc-rarity"><span class="gc-gem" aria-hidden="true"></span>${rarity.label}</span>
        <span class="gc-serial">${formatSerial(card)}</span>
      </header>
      <div class="gc-identity">
        <div class="gc-avatar" aria-hidden="true"><span class="gc-emblem">${escapeHtml(card.emblem)}</span></div>
        <div class="gc-name-block">
          <span class="gc-theme"><span aria-hidden="true">${theme.icon}</span> ${theme.name}</span>
          <h3 class="gc-name">${escapeHtml(card.name)}</h3>
          <p class="gc-nick">${escapeHtml(card.nickname)}</p>
        </div>
      </div>
      <div class="gc-radar">${radarSvg(card.stats)}</div>
      <ul class="sr-only" aria-label="Statistik RPG">${statList}</ul>
      <div class="gc-moves">
        <div class="gc-section-title">Jurus Andalan</div>
        <ul class="gc-move-list">${moves}</ul>
      </div>
      <div class="gc-bottom">
        <div class="gc-weakness">
          <span class="gc-weak-label">Lemah terhadap</span>
          <span class="gc-weak-value">${escapeHtml(card.weakness)}</span>
        </div>
        <blockquote class="gc-quote"><span>${escapeHtml(card.quote)}</span></blockquote>
        <footer class="gc-foot">
          <span>Kartu Mahasiswa</span>
          <span class="gc-foot-theme">${theme.name}</span>
        </footer>
      </div>
    </div>
  </article>`;
}

function renderStageCard(card) {
  const theme = getTheme(card.theme);
  const rarity = getRarity(card.rarity);
  els.stageCard.innerHTML = cardMarkup(card);
  els.stage.dataset.theme = theme.id;
  els.stage.dataset.rarity = rarity.id;
  els.stageMeta.textContent = `${theme.name} · ${rarity.label}`;
  currentCard = card;
}

function albumCardMarkup(card) {
  const theme = getTheme(card.theme);
  const rarity = getRarity(card.rarity);
  const palette = paletteFor(card.theme, card.rarity);
  const total = totalStats(card);
  return `<article class="album-card" data-theme="${theme.id}" data-rarity="${rarity.id}" style="${paletteStyle(palette)}">
    <button type="button" class="album-open" data-serial="${card.serialNumber}" aria-label="Lihat detail kartu ${escapeHtml(card.name)}">
      <span class="album-top">
        <span class="album-rarity"><i aria-hidden="true"></i>${rarity.label}</span>
        <span class="album-serial">${formatSerial(card)}</span>
      </span>
      <span class="album-main">
        <span class="album-identity">
          <span class="album-name">${escapeHtml(card.name)}</span>
          <span class="album-nick">${escapeHtml(card.nickname)}</span>
        </span>
        ${miniRadarSvg(card.stats)}
      </span>
      <span class="album-bottom">
        <span class="album-total">Total <b>${total}</b></span>
        <span>${theme.name}</span>
      </span>
    </button>
    <button type="button" class="album-delete" data-delete="${card.serialNumber}" aria-label="Hapus kartu ${escapeHtml(card.name)} dari album">×</button>
  </article>`;
}

function renderAlbum() {
  els.albumCount.textContent = String(collection.length);
  els.navAlbumCount.textContent = String(collection.length);
  els.clearAlbumBtn.disabled = collection.length === 0;

  if (!collection.length) {
    els.albumGrid.innerHTML = `<div class="album-empty">
      <span class="album-empty-icon" aria-hidden="true">🃏</span>
      <h3>Album masih kosong</h3>
      <p>Buka pack pertamamu dan mulai kumpulkan kartu. Setiap kartu punya nomor seri unik dari #0001 sampai #1000.</p>
      <button type="button" class="btn btn-primary" data-action="goto-generator">Buka pack pertama</button>
    </div>`;
    return;
  }

  const sorted = collection.slice().sort((a, b) => b.createdAt - a.createdAt);
  els.albumGrid.innerHTML = sorted.map(albumCardMarkup).join("");
}

/* ------------------------------------------------------------
   Duel
   ------------------------------------------------------------ */
function duelOptionsMarkup() {
  return collection
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((card) => {
      const rarity = getRarity(card.rarity);
      return `<option value="${card.serialNumber}">${formatSerial(card)} · ${escapeHtml(card.name)} · ${rarity.label}</option>`;
    })
    .join("");
}

function updateDuelSelectors() {
  const previousA = els.duelSelectA.value;
  const previousB = els.duelSelectB.value;
  const canDuel = collection.length >= 2;
  const options = duelOptionsMarkup();

  if (!collection.length) {
    els.duelSelectA.innerHTML = '<option value="">Belum ada kartu</option>';
    els.duelSelectB.innerHTML = '<option value="">Belum ada kartu</option>';
    els.duelSelectA.disabled = true;
    els.duelSelectB.disabled = true;
    els.duelSelectA.value = "";
    els.duelSelectB.value = "";
    renderDuelPreview("A");
    renderDuelPreview("B");
    updateDuelState();
    return;
  }

  els.duelSelectA.disabled = !canDuel;
  els.duelSelectB.disabled = !canDuel;
  els.duelSelectA.innerHTML = `<option value="">Pilih kartu</option>${options}`;
  els.duelSelectB.innerHTML = `<option value="">Pilih kartu</option>${options}`;

  let nextA = findCard(previousA) ? previousA : String(collection[0].serialNumber);
  let nextB = findCard(previousB) && previousB !== nextA ? previousB : "";

  if (!nextB) {
    const alternative = collection.find((card) => String(card.serialNumber) !== nextA);
    nextB = alternative ? String(alternative.serialNumber) : "";
  }

  els.duelSelectA.value = nextA;
  els.duelSelectB.value = canDuel ? nextB : "";
  renderDuelPreview("A");
  renderDuelPreview("B");
  updateDuelState();
}

function renderDuelPreview(slot) {
  const select = slot === "A" ? els.duelSelectA : els.duelSelectB;
  const target = slot === "A" ? els.duelPreviewA : els.duelPreviewB;
  const card = findCard(select.value);

  if (!card) {
    target.innerHTML = `<div class="duel-preview-empty">${collection.length < 2 ? "Kumpulkan minimal dua kartu untuk membuka duel." : "Pilih satu kartu dari album."}</div>`;
    return;
  }

  const theme = getTheme(card.theme);
  const rarity = getRarity(card.rarity);
  const palette = paletteFor(card.theme, card.rarity);
  target.innerHTML = `<div class="duel-preview-card" style="${paletteStyle(palette)}">
    <div class="duel-preview-top"><span>${rarity.label} · ${theme.name}</span><span>${formatSerial(card)}</span></div>
    <div class="duel-preview-name">${escapeHtml(card.name)}</div>
    <div class="duel-preview-nick">${escapeHtml(card.nickname)}</div>
    <div class="duel-preview-total">Total <b>${totalStats(card)}</b> / 495</div>
  </div>`;
}

function updateDuelState() {
  const cardA = findCard(els.duelSelectA.value);
  const cardB = findCard(els.duelSelectB.value);

  if (collection.length < 2) {
    els.duelBtn.disabled = true;
    els.duelHint.textContent = "Butuh minimal dua kartu di album untuk mulai duel.";
    return;
  }

  if (!cardA || !cardB) {
    els.duelBtn.disabled = true;
    els.duelHint.textContent = "Pilih dua kartu dari album terlebih dahulu.";
    return;
  }

  if (cardA.serialNumber === cardB.serialNumber) {
    els.duelBtn.disabled = true;
    els.duelHint.textContent = "Pilih dua kartu yang berbeda, ya.";
    return;
  }

  els.duelBtn.disabled = false;
  els.duelHint.textContent = "Siap diadu. Total statistik tertinggi menang.";
}

function hideDuelResult() {
  els.duelResult.classList.remove("is-visible");
  els.duelResult.innerHTML = "";
}

function startDuel() {
  const cardA = findCard(els.duelSelectA.value);
  const cardB = findCard(els.duelSelectB.value);

  if (!cardA || !cardB) {
    showToast("Pilih dua kartu dari album dulu.", "info");
    return;
  }

  if (cardA.serialNumber === cardB.serialNumber) {
    showToast("Dua petarungnya harus kartu yang berbeda.", "info");
    return;
  }

  const totalA = totalStats(cardA);
  const totalB = totalStats(cardB);
  const themeA = getTheme(cardA.theme);
  const themeB = getTheme(cardB.theme);
  const rarityA = getRarity(cardA.rarity);
  const rarityB = getRarity(cardB.rarity);
  const paletteA = paletteFor(cardA.theme, cardA.rarity);
  const paletteB = paletteFor(cardB.theme, cardB.rarity);
  const winner = totalA === totalB ? null : totalA > totalB ? "A" : "B";

  let heading;
  if (winner === null) {
    heading = `🤝 Seri! <span>${escapeHtml(cardA.name)}</span> dan <span>${escapeHtml(cardB.name)}</span> sama kuat.`;
  } else {
    const winnerCard = winner === "A" ? cardA : cardB;
    heading = `🏆 <span>${escapeHtml(winnerCard.name)}</span> menang!`;
  }

  const statRows = STAT_DEFS.map((definition, index) => {
    const valueA = cardA.stats[index] ? cardA.stats[index].value : 0;
    const valueB = cardB.stats[index] ? cardB.stats[index].value : 0;
    return `<div class="duel-stat-row">
      <strong class="${valueA > valueB ? "is-best" : ""}">${valueA}</strong>
      <span class="duel-stat-name">${escapeHtml(definition.label)}</span>
      <strong class="${valueB > valueA ? "is-best" : ""}">${valueB}</strong>
    </div>`;
  }).join("");

  els.duelResult.innerHTML = `<div class="duel-result-head">
    <div class="duel-result-kicker">Hasil duel</div>
    <h3 class="duel-winner">${heading}</h3>
    <p class="duel-result-sub">Total statistik ${totalA} vs ${totalB} · ${rarityA.label} vs ${rarityB.label}</p>
  </div>
  <div class="duel-scoreboard">
    <div class="duel-score ${winner === "A" ? "is-winner" : ""}" style="${paletteStyle(paletteA)}">
      <span class="duel-score-label">${themeA.name} · ${rarityA.label}</span>
      <span class="duel-score-name">${escapeHtml(cardA.name)}</span>
      <span class="duel-score-total">${totalA}<small> / 495</small></span>
    </div>
    <span class="duel-score-vs" aria-hidden="true">VS</span>
    <div class="duel-score ${winner === "B" ? "is-winner" : ""}" style="${paletteStyle(paletteB)}">
      <span class="duel-score-label">${themeB.name} · ${rarityB.label}</span>
      <span class="duel-score-name">${escapeHtml(cardB.name)}</span>
      <span class="duel-score-total">${totalB}<small> / 495</small></span>
    </div>
  </div>
  <div class="duel-stat-list" aria-label="Perbandingan statistik">${statRows}</div>`;

  els.duelResult.classList.add("is-visible");
  if (!motionQuery.matches) {
    els.duelResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

/* ------------------------------------------------------------
   UI kecil
   ------------------------------------------------------------ */
function updateCharCount() {
  const length = els.nameInput.value.length;
  els.charCount.textContent = `${length}/26`;
  els.clearBtn.hidden = length === 0;
}

function showError(message) {
  els.formError.textContent = message;
  els.nameInput.setAttribute("aria-invalid", "true");
  els.inputShell.classList.remove("has-error");
  void els.inputShell.offsetWidth;
  els.inputShell.classList.add("has-error");
}

function clearError() {
  if (!els.formError.textContent) return;
  els.formError.textContent = "";
  els.nameInput.removeAttribute("aria-invalid");
  els.inputShell.classList.remove("has-error");
}

function setStatus(message, success = false) {
  els.status.textContent = message;
  els.status.classList.toggle("is-success", success);
}

function setBusy(busy) {
  isOpening = busy;
  els.openPackBtn.disabled = busy;
  els.openPackBtn.classList.toggle("is-loading", busy);
  els.openPackLabel.textContent = busy ? "Membuka pack…" : currentCard ? "Buka Pack Lagi" : "Buka Pack";
  els.downloadBtn.disabled = busy || !currentCard;
  themeInputs.forEach((input) => {
    input.disabled = busy;
  });
}

function applyThemeToPack(themeId) {
  const theme = getTheme(themeId);
  els.pack.dataset.theme = theme.id;
  els.packEmblem.textContent = theme.icon;
  els.packName.textContent = theme.name;
  els.packTagline.textContent = theme.tagline;

  if (els.cardShell.hidden) {
    els.stage.dataset.theme = theme.id;
    els.stage.removeAttribute("data-rarity");
    els.stageMeta.textContent = "Pack siap dibuka";
  }
}

function showToast(message, type = "info", duration = 3400) {
  const toast = document.createElement("div");
  const icon = type === "success" ? "✓" : type === "error" ? "!" : "✦";
  toast.className = `toast is-${type}`;
  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(message)}</span>`;
  toast.addEventListener("click", () => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 300);
  });
  els.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 300);
  }, duration);
}

function refreshCollectionUI() {
  renderAlbum();
  updateDuelSelectors();
}

function scrollToStage() {
  if (!mobileQuery.matches) return;
  els.stage.scrollIntoView({
    behavior: motionQuery.matches ? "auto" : "smooth",
    block: "center"
  });
}

/* ------------------------------------------------------------
   Buka pack & reveal
   ------------------------------------------------------------ */
function launchBurst(card) {
  els.burstLayer.replaceChildren();
  if (motionQuery.matches) return;

  const palette = paletteFor(card.theme, card.rarity);
  const theme = getTheme(card.theme);
  const colors = [palette.rc, palette.rc2, theme.palette.accent, "#ffffff"];
  const count = window.innerWidth < 600 ? 24 : 38;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 190;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isStar = index % 6 === 0;

    particle.className = isStar ? "burst-particle is-star" : "burst-particle";
    particle.style.setProperty("--tx", `${(Math.cos(angle) * distance).toFixed(1)}px`);
    particle.style.setProperty("--ty", `${(Math.sin(angle) * distance).toFixed(1)}px`);
    particle.style.setProperty("--size", `${isStar ? 8 + Math.random() * 9 : 2 + Math.random() * 5}px`);
    particle.style.setProperty("--delay", `${(Math.random() * 0.12).toFixed(2)}s`);
    particle.style.setProperty("--dur", `${(0.75 + Math.random() * 0.55).toFixed(2)}s`);
    particle.style.setProperty("--rot", `${Math.round(Math.random() * 220 - 110)}deg`);
    particle.style.setProperty("--color", color);
    if (isStar) particle.textContent = "✦";
    els.burstLayer.appendChild(particle);
  }

  window.setTimeout(() => els.burstLayer.replaceChildren(), 1500);
}

function revealCard(card) {
  const theme = getTheme(card.theme);
  const rarity = getRarity(card.rarity);

  els.packWrap.hidden = true;
  els.pack.classList.remove("is-bursting");
  els.packFlash.classList.remove("is-active");

  renderStageCard(card);
  els.cardShell.hidden = false;
  els.cardShell.classList.remove("is-revealing");
  resetTilt();
  void els.cardShell.offsetWidth;
  els.cardShell.classList.add("is-revealing");

  els.downloadBtn.disabled = false;
  els.status.classList.remove("is-success");

  const saved = saveCardToAlbum(card);
  refreshCollectionUI();

  if (saved) {
    setStatus(`Kartu ${rarity.label} ${formatSerial(card)} tersimpan di album.`, true);
    showToast(`${rarity.label} ${formatSerial(card)} · ${card.name} masuk album.`, "success");
  } else {
    setStatus("Kartu tampil, tapi gagal disimpan ke album. Coba unduh PNG-nya.", false);
    showToast("Album gagal menyimpan kartu. Penyimpanan browser mungkin penuh.", "error", 5000);
  }

  document.title = `${card.name} · ${rarity.label} | Kartu Mahasiswa`;
  els.downloadLabel.textContent = "Unduh PNG";

  window.setTimeout(() => {
    if (currentCard === card) els.cardShell.classList.remove("is-revealing");
  }, motionQuery.matches ? 120 : 1200);
}

async function openPack() {
  if (isOpening) return;

  const name = normalizeName(els.nameInput.value);
  if (!name) {
    showError("Nama tidak boleh kosong. Pack butuh identitas.");
    els.nameInput.focus();
    return;
  }

  const card = createCard(name, selectedTheme);
  if (!card) {
    showError("Album sudah penuh (1000/1000). Hapus beberapa kartu dulu.");
    showToast("Album penuh. Hapus salah satu kartu sebelum membuka pack baru.", "error", 5200);
    return;
  }

  clearError();
  els.nameInput.value = name;
  updateCharCount();
  setBusy(true);
  els.status.classList.remove("is-success");
  setStatus("Menggetarkan pack...");
  els.downloadBtn.disabled = true;
  els.downloadLabel.textContent = "Unduh PNG";

  currentCard = null;
  els.cardShell.hidden = true;
  els.cardShell.classList.remove("is-revealing");
  els.stageCard.innerHTML = "";
  resetTilt();

  els.packWrap.hidden = false;
  els.pack.classList.remove("is-shaking", "is-bursting");
  els.packFlash.classList.remove("is-active");
  applyThemeToPack(selectedTheme);
  els.stage.removeAttribute("data-rarity");
  els.stageMeta.textContent = "Membuka pack…";
  els.burstLayer.replaceChildren();
  scrollToStage();

  try {
    void els.pack.offsetWidth;
    await nextFrame();
    els.pack.classList.add("is-shaking");
    setStatus("Membaca nasib kuliahmu...");

    await wait(motionQuery.matches ? 40 : 700);

    els.pack.classList.remove("is-shaking");
    els.pack.classList.add("is-bursting");
    els.packFlash.classList.add("is-active");
    launchBurst(card);
    setStatus("Kilat! Kartu sedang muncul...");

    await wait(motionQuery.matches ? 40 : 300);
    revealCard(card);
  } catch (error) {
    console.error("Gagal membuka pack:", error);
    els.pack.classList.remove("is-shaking", "is-bursting");
    els.packFlash.classList.remove("is-active");
    els.packWrap.hidden = false;
    els.cardShell.hidden = true;
    setStatus("Terjadi kendala saat membuka pack. Coba lagi.", false);
    showToast("Gagal membuka pack. Coba lagi, ya.", "error");
  } finally {
    setBusy(false);
  }
}

/* ------------------------------------------------------------
   Detail kartu & hapus koleksi
   ------------------------------------------------------------ */
function openCardDialog(card) {
  if (!card) return;
  const theme = getTheme(card.theme);
  const rarity = getRarity(card.rarity);
  modalCard = card;
  els.dialogTitle.textContent = card.name;
  els.dialogMeta.textContent = `${rarity.label} · ${theme.name} · ${formatSerial(card)}`;
  els.dialogCard.innerHTML = cardMarkup(card);
  if (typeof els.dialog.showModal === "function") {
    els.dialog.showModal();
  } else {
    els.dialog.setAttribute("open", "");
  }
}

function closeCardDialog() {
  modalCard = null;
  if (typeof els.dialog.close === "function" && els.dialog.open) {
    els.dialog.close();
  } else {
    els.dialog.removeAttribute("open");
  }
}

function deleteCardWithConfirm(serialNumber) {
  const card = findCard(serialNumber);
  if (!card) return;

  const agreed = window.confirm(`Hapus kartu ${card.name} (${formatSerial(card)}) dari album?`);
  if (!agreed) return;

  if (!removeCardFromAlbum(card.serialNumber)) {
    showToast("Gagal menghapus kartu dari penyimpanan.", "error");
    return;
  }

  closeCardDialog();
  hideDuelResult();
  refreshCollectionUI();
  showToast(`Kartu ${formatSerial(card)} dihapus dari album.`, "info");
}

function clearAlbum() {
  if (!collection.length) return;
  const agreed = window.confirm(`Kosongkan album? ${collection.length} kartu akan dihapus permanen dari browser ini.`);
  if (!agreed) return;

  collection = [];
  if (!persistCollection()) {
    showToast("Gagal mengosongkan album. Coba lagi.", "error");
    return;
  }

  hideDuelResult();
  refreshCollectionUI();
  closeCardDialog();
  showToast("Album sudah dikosongkan.", "info");
}

/* ------------------------------------------------------------
   Nama acak
   ------------------------------------------------------------ */
function fillRandomName() {
  let candidate = pick(SAMPLE_NAMES);
  if (candidate === lastRandomName) {
    const index = (SAMPLE_NAMES.indexOf(candidate) + 1) % SAMPLE_NAMES.length;
    candidate = SAMPLE_NAMES[index];
  }
  lastRandomName = candidate;
  els.nameInput.value = candidate;
  updateCharCount();
  clearError();
  els.nameInput.focus();
  setStatus(`Nama acak "${candidate}" siap. Pilih tema lalu buka pack.`);
}

/* ------------------------------------------------------------
   Tilt 3D & gyro
   ------------------------------------------------------------ */
function applyTiltPoint(clientX, clientY) {
  if (!currentCard || els.cardShell.hidden) return;
  const rect = els.cardTilt.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const px = clamp((clientX - rect.left) / rect.width, 0, 1);
  const py = clamp((clientY - rect.top) / rect.height, 0, 1);
  const rotateX = (0.5 - py) * 12;
  const rotateY = (px - 0.5) * 14;

  els.cardTilt.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.012)`;
  els.cardTilt.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
  els.cardTilt.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  els.cardTilt.style.setProperty("--shine-x", `${(px * 100).toFixed(1)}%`);
  els.cardTilt.style.setProperty("--shine-y", `${(py * 100).toFixed(1)}%`);
}

function queueTilt(clientX, clientY) {
  pendingPoint = { x: clientX, y: clientY };
  if (tiltFrame) return;
  tiltFrame = requestAnimationFrame(() => {
    tiltFrame = 0;
    if (!pendingPoint) return;
    applyTiltPoint(pendingPoint.x, pendingPoint.y);
  });
}

function resetTilt() {
  pendingPoint = null;
  if (tiltFrame) {
    cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
  }
  els.cardTilt.classList.remove("is-tilting");
  els.cardTilt.style.transform = "rotateX(0deg) rotateY(0deg)";
  els.cardTilt.style.setProperty("--mx", "50%");
  els.cardTilt.style.setProperty("--my", "24%");
  els.cardTilt.style.setProperty("--shine-x", "50%");
  els.cardTilt.style.setProperty("--shine-y", "50%");
}

function bindTilt() {
  if (motionQuery.matches) return;

  els.cardTilt.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      els.cardTilt.classList.add("is-tilting");
    }
  });

  els.cardTilt.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      if (gyroEnabled || !touchTilting) return;
    }
    queueTilt(event.clientX, event.clientY);
  });

  els.cardTilt.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    resetTilt();
  });

  els.cardTilt.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" || gyroEnabled) return;
    touchTilting = true;
    els.cardTilt.classList.add("is-tilting");
    queueTilt(event.clientX, event.clientY);
  });

  const endTouchTilt = () => {
    if (!touchTilting) return;
    touchTilting = false;
    resetTilt();
  };

  window.addEventListener("pointerup", endTouchTilt);
  window.addEventListener("pointercancel", endTouchTilt);
}

function initGyroAvailability() {
  const supports = "DeviceOrientationEvent" in window && (coarsePointerQuery.matches || navigator.maxTouchPoints > 0);
  if (supports && !motionQuery.matches) {
    els.gyroBtn.hidden = false;
  }
}

async function toggleGyro() {
  if (gyroEnabled) {
    window.removeEventListener("deviceorientation", handleGyro);
    gyroEnabled = false;
    gyroBase = null;
    gyroHasEvent = false;
    els.gyroBtn.setAttribute("aria-pressed", "false");
    els.gyroLabel.textContent = "Aktifkan Gyro";
    els.tiltHintText.textContent = "Gerakkan kursor di atas kartu untuk efek holografik.";
    resetTilt();
    showToast("Gyro dimatikan.", "info", 2000);
    return;
  }

  try {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        showToast("Izin gyro ditolak. Kartu tetap bisa dimiringkan dengan sentuhan.", "error", 4200);
        return;
      }
    }

    gyroEnabled = true;
    gyroBase = null;
    gyroHasEvent = false;
    window.addEventListener("deviceorientation", handleGyro, { passive: true });
    els.gyroBtn.setAttribute("aria-pressed", "true");
    els.gyroLabel.textContent = "Gyro aktif";
    els.tiltHintText.textContent = "Miringkan HP untuk memutar kartu dan menggeser kilau pelangi.";
    showToast("Gyro aktif. Miringkan HP perlahan.", "success", 2600);

    window.setTimeout(() => {
      if (gyroEnabled && !gyroHasEvent) {
        showToast("Sensor gerak tidak mengirim data. Gunakan sentuhan atau kursor.", "info", 4000);
      }
    }, 1800);
  } catch (error) {
    console.error("Gyro tidak tersedia:", error);
    showToast("Gyro tidak bisa diaktifkan di perangkat ini.", "error");
  }
}

function handleGyro(event) {
  if (!gyroEnabled || !currentCard || els.cardShell.hidden) return;
  if (event.beta === null || event.gamma === null) return;

  gyroHasEvent = true;
  const angle = (screen.orientation && Number.isFinite(screen.orientation.angle))
    ? screen.orientation.angle
    : (Number.isFinite(window.orientation) ? window.orientation : 0);

  let rawX = event.gamma;
  let rawY = event.beta;
  if (Math.abs(angle) === 90) {
    rawX = angle === 90 ? -event.beta : event.beta;
    rawY = angle === 90 ? event.gamma : -event.gamma;
  }

  if (!gyroBase) {
    gyroBase = { x: rawX, y: rawY };
    return;
  }

  gyroPending = {
    dx: clamp(rawX - gyroBase.x, -26, 26),
    dy: clamp(rawY - gyroBase.y, -26, 26)
  };

  if (gyroFrame) return;
  gyroFrame = requestAnimationFrame(() => {
    gyroFrame = 0;
    if (!gyroPending || !currentCard || els.cardShell.hidden) return;
    const { dx, dy } = gyroPending;
    const px = clamp(0.5 + dx / 52, 0, 1);
    const py = clamp(0.5 + dy / 52, 0, 1);
    const rotateX = -dy * 0.42;
    const rotateY = dx * 0.55;

    els.cardTilt.classList.add("is-tilting");
    els.cardTilt.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.008)`;
    els.cardTilt.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    els.cardTilt.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    els.cardTilt.style.setProperty("--shine-x", `${(px * 100).toFixed(1)}%`);
    els.cardTilt.style.setProperty("--shine-y", `${(py * 100).toFixed(1)}%`);
  });
}

/* ============================================================
   Bagian 2: renderer PNG (kanvas)
   ============================================================ */
const CANVAS_W = 1000;
const CANVAS_H = 1400;
const CANVAS_SCALE = 2;
const FONT_MONO_CANVAS = 'Consolas, "Cascadia Mono", "Courier New", monospace';
const FONT_EMOJI_CANVAS = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const FONT_UI_CANVAS = '"Segoe UI", system-ui, sans-serif';

const CANVAS_FONTS = {
  fantasy: {
    display: 'Georgia, "Palatino Linotype", "Book Antiqua", serif',
    body: '"Palatino Linotype", Georgia, serif',
    label: FONT_MONO_CANVAS
  },
  cyberpunk: {
    display: 'Consolas, "Cascadia Mono", "Courier New", monospace',
    body: 'Consolas, "Cascadia Mono", "Courier New", monospace',
    label: FONT_MONO_CANVAS
  },
  anime: {
    display: '"Trebuchet MS", "Segoe UI", sans-serif',
    body: '"Trebuchet MS", "Segoe UI", sans-serif',
    label: '"Trebuchet MS", "Segoe UI", sans-serif'
  },
  retro: {
    display: '"Arial Black", Impact, "Haettenschweiler", sans-serif',
    body: '"Trebuchet MS", Verdana, sans-serif',
    label: '"Trebuchet MS", Verdana, sans-serif'
  }
};

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, maxWidth, maxLines) {
  let remaining = String(text).trim();
  const lines = [];

  while (remaining && lines.length < maxLines) {
    let fit = remaining.length;
    while (fit > 0 && ctx.measureText(remaining.slice(0, fit)).width > maxWidth) {
      fit -= 1;
    }
    if (fit < 1) fit = 1;

    let breakAt = fit;
    if (fit < remaining.length) {
      const lastSpace = remaining.lastIndexOf(" ", fit);
      if (lastSpace > 0) breakAt = lastSpace;
    }

    const line = remaining.slice(0, breakAt).trim();
    if (line) lines.push(line);
    remaining = remaining.slice(breakAt).trimStart();
  }

  if (remaining && lines.length) {
    let last = lines.pop();
    while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines.push(`${last.trimEnd()}…`);
  }

  return lines.length ? lines : [""];
}

function drawCanvasLines(ctx, text, x, y, maxWidth, lineHeight, maxLines, font, color, align = "left") {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  const lines = wrapCanvasText(ctx, text, maxWidth, maxLines);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
  ctx.restore();
  return lines;
}

function drawSparkleCanvas(ctx, x, y, size, color, alpha = 0.8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.12, size, 0);
  ctx.quadraticCurveTo(size * 0.12, size * 0.12, 0, size);
  ctx.quadraticCurveTo(-size * 0.12, size * 0.12, -size, 0);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.12, 0, -size);
  ctx.fill();
  ctx.restore();
}

function drawThemeBackground(ctx, theme, x, y, width, height) {
  const p = theme.palette;
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, p.bg1);
  gradient.addColorStop(0.56, p.bg2);
  gradient.addColorStop(1, p.bg3);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);

  const glowA = ctx.createRadialGradient(x + width * 0.85, y + height * 0.05, 0, x + width * 0.85, y + height * 0.05, width * 0.65);
  glowA.addColorStop(0, hexToRgba(p.accent, theme.dark ? 0.16 : 0.22));
  glowA.addColorStop(1, hexToRgba(p.accent, 0));
  ctx.fillStyle = glowA;
  ctx.fillRect(x, y, width, height);

  const glowB = ctx.createRadialGradient(x + width * 0.08, y + height, 0, x + width * 0.08, y + height, width * 0.7);
  glowB.addColorStop(0, hexToRgba(p.accent2, theme.dark ? 0.13 : 0.18));
  glowB.addColorStop(1, hexToRgba(p.accent2, 0));
  ctx.fillStyle = glowB;
  ctx.fillRect(x, y, width, height);

  ctx.save();
  if (theme.id === "fantasy") {
    const cx = x + width * 0.5;
    const cy = y + height * 0.31;
    ctx.strokeStyle = hexToRgba(p.accent, 0.1);
    ctx.lineWidth = 1.2;
    [95, 180, 280].forEach((radius) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([3, 9]);
    ctx.strokeStyle = hexToRgba(p.accent, 0.16);
    for (let index = 0; index < 12; index += 1) {
      const angle = (index * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 95, cy + Math.sin(angle) * 95);
      ctx.lineTo(cx + Math.cos(angle) * 300, cy + Math.sin(angle) * 300);
      ctx.stroke();
    }
  } else if (theme.id === "cyberpunk") {
    ctx.strokeStyle = hexToRgba(p.accent, 0.055);
    ctx.lineWidth = 1;
    for (let gx = x + 34; gx < x + width; gx += 38) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + height);
      ctx.stroke();
    }
    for (let gy = y + 34; gy < y + height; gy += 38) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + width, gy);
      ctx.stroke();
    }
    ctx.fillStyle = hexToRgba(p.accent, 0.035);
    for (let sy = y + 10; sy < y + height; sy += 6) {
      ctx.fillRect(x, sy, width, 1);
    }
    ctx.fillStyle = hexToRgba(p.accent2, 0.08);
    ctx.beginPath();
    ctx.moveTo(x + width * 0.73, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height * 0.3);
    ctx.closePath();
    ctx.fill();
  } else if (theme.id === "anime") {
    ctx.fillStyle = hexToRgba(p.accent, 0.13);
    for (let dx = x + 10; dx < x + width; dx += 17) {
      for (let dy = y + 10; dy < y + height; dy += 17) {
        ctx.beginPath();
        ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = hexToRgba(p.accent2, 0.12);
    ctx.beginPath();
    ctx.arc(x + width * 0.88, y + height * 0.12, width * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(p.accent, 0.17);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + width * 0.1, y + height * 0.92, width * 0.16, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = hexToRgba(p.accent, 0.13);
    ctx.beginPath();
    ctx.arc(x + width * 0.12, y + height * 0.15, 76, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(p.accent2, 0.22);
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(x + width * 0.88, y + height * 0.82, 105, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = hexToRgba(p.accent2, 0.12);
    for (let dx = x + 30; dx < x + width; dx += 34) {
      ctx.fillRect(dx, y + height * 0.72, 16, 120);
    }
    ctx.strokeStyle = hexToRgba(p.text, 0.07);
    ctx.lineWidth = 2;
    for (let dx = x + 20; dx < x + width; dx += 26) {
      ctx.beginPath();
      ctx.moveTo(dx, y + 40);
      ctx.lineTo(dx + 16, y + 56);
      ctx.lineTo(dx, y + 72);
      ctx.stroke();
    }
  }
  ctx.restore();

  const shade = ctx.createLinearGradient(x, y, x, y + height);
  if (theme.dark) {
    shade.addColorStop(0, "rgba(0,0,0,0.02)");
    shade.addColorStop(0.58, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.26)");
  } else {
    shade.addColorStop(0, "rgba(255,255,255,0.16)");
    shade.addColorStop(0.5, "rgba(255,255,255,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.055)");
  }
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, width, height);
}

function drawCanvasFrame(ctx, theme, rarity, cardX, cardY, cardW, cardH) {
  const p = theme.palette;
  const palette = paletteFor(theme.id, rarity.id);

  ctx.save();
  // Bingkai dalam khas tema.
  if (theme.id === "fantasy") {
    roundedRectPath(ctx, cardX + 18, cardY + 18, cardW - 36, cardH - 36, 24);
    ctx.strokeStyle = hexToRgba(p.accent, 0.34);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    roundedRectPath(ctx, cardX + 26, cardY + 26, cardW - 52, cardH - 52, 20);
    ctx.strokeStyle = hexToRgba(p.accent, 0.15);
    ctx.stroke();
    const corner = 38;
    ctx.strokeStyle = hexToRgba(p.accent, 0.56);
    ctx.lineWidth = 2;
    [[cardX + 30, cardY + 30, 1, 1], [cardX + cardW - 30, cardY + 30, -1, 1], [cardX + 30, cardY + cardH - 30, 1, -1], [cardX + cardW - 30, cardY + cardH - 30, -1, -1]].forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * corner, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * corner);
      ctx.stroke();
    });
  } else if (theme.id === "cyberpunk") {
    roundedRectPath(ctx, cardX + 20, cardY + 20, cardW - 40, cardH - 40, 10);
    ctx.strokeStyle = hexToRgba(palette.rc, 0.3);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    const notch = 42;
    ctx.strokeStyle = palette.rc;
    ctx.lineWidth = 3;
    [[cardX + 20, cardY + 20, 1, 1], [cardX + cardW - 20, cardY + cardH - 20, -1, -1]].forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * notch, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * notch);
      ctx.stroke();
    });
  } else if (theme.id === "anime") {
    roundedRectPath(ctx, cardX + 16, cardY + 16, cardW - 32, cardH - 32, 28);
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 3;
    ctx.stroke();
    roundedRectPath(ctx, cardX + 24, cardY + 24, cardW - 48, cardH - 48, 24);
    ctx.strokeStyle = hexToRgba(p.accent, 0.16);
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 7]);
    ctx.stroke();
  } else {
    roundedRectPath(ctx, cardX + 17, cardY + 17, cardW - 34, cardH - 34, 14);
    ctx.strokeStyle = hexToRgba(p.text, 0.85);
    ctx.lineWidth = 5;
    ctx.stroke();
    roundedRectPath(ctx, cardX + 26, cardY + 26, cardW - 52, cardH - 52, 11);
    ctx.strokeStyle = hexToRgba(palette.rc, 0.54);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();

  // Garis bingkai kelangkaan.
  ctx.save();
  roundedRectPath(ctx, cardX + 1.5, cardY + 1.5, cardW - 3, cardH - 3, 38);
  ctx.strokeStyle = hexToRgba(palette.rc, theme.id === "retro" ? 0.9 : 0.72);
  ctx.lineWidth = rarity.id === "legendary" ? 4 : rarity.id === "epic" ? 3 : 2;
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = rarity.id === "legendary" ? 26 : rarity.id === "epic" ? 16 : 7;
  ctx.stroke();
  ctx.restore();

  if (rarity.id === "epic" || rarity.id === "legendary") {
    const starAlpha = rarity.id === "legendary" ? 0.9 : 0.55;
    drawSparkleCanvas(ctx, cardX + 56, cardY + 56, 11, palette.rc, starAlpha);
    drawSparkleCanvas(ctx, cardX + cardW - 62, cardY + 116, 8, palette.rc, starAlpha * 0.8);
    drawSparkleCanvas(ctx, cardX + 74, cardY + cardH - 84, 7, palette.rc, starAlpha * 0.7);
    if (rarity.id === "legendary") {
      drawSparkleCanvas(ctx, cardX + cardW - 74, cardY + cardH - 62, 10, palette.rc, starAlpha);
      drawSparkleCanvas(ctx, cardX + cardW * 0.52, cardY + 34, 6, "#ffffff", 0.5);
    }
  }
}

function drawRarityPill(ctx, x, y, rarity, palette, fonts, theme) {
  const label = rarity.label.toUpperCase();
  ctx.save();
  ctx.font = `700 19px ${fonts.label}`;
  const textWidth = ctx.measureText(label).width;
  const pillWidth = textWidth + 64;
  const pillHeight = 44;
  roundedRectPath(ctx, x, y, pillWidth, pillHeight, pillHeight / 2);
  ctx.fillStyle = theme.dark ? "rgba(4,7,16,0.36)" : "rgba(255,255,255,0.4)";
  ctx.fill();
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.translate(x + 24, y + pillHeight / 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = palette.rc;
  ctx.shadowColor = palette.rc;
  ctx.shadowBlur = 9;
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();

  ctx.save();
  ctx.font = `700 19px ${fonts.label}`;
  ctx.fillStyle = palette.rc;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + 42, y + pillHeight / 2 + 1);
  ctx.restore();
}

function drawCanvasRadar(ctx, card, centerX, centerY, radius, theme, palette, fonts) {
  const p = theme.palette;
  const count = card.stats.length;
  const angleAt = (index) => (-Math.PI / 2) + (index * Math.PI * 2) / count;
  const pointAt = (index, fraction) => {
    const angle = angleAt(index);
    return [
      centerX + Math.cos(angle) * radius * fraction,
      centerY + Math.sin(angle) * radius * fraction
    ];
  };

  ctx.save();
  ctx.lineJoin = "round";

  for (let level = 1; level <= 4; level += 1) {
    ctx.beginPath();
    card.stats.forEach((_, index) => {
      const [x, y] = pointAt(index, level / 4);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = level === 4 ? hexToRgba(palette.rc, 0.26) : p.line;
    ctx.lineWidth = level === 4 ? 1.5 : 1;
    ctx.stroke();
  }

  ctx.setLineDash([3, 7]);
  card.stats.forEach((_, index) => {
    const [x, y] = pointAt(index, 1);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  ctx.setLineDash([]);

  const shapePoints = card.stats.map((stat, index) => pointAt(index, clamp(stat.value, 0, 100) / 100));
  ctx.beginPath();
  shapePoints.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = hexToRgba(palette.rc, 0.16);
  ctx.fill();
  ctx.strokeStyle = palette.rc;
  ctx.lineWidth = 3;
  ctx.shadowColor = palette.rc;
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;

  shapePoints.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = palette.rc;
    ctx.fill();
    ctx.strokeStyle = p.bg2;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
  ctx.restore();

  const labelRadius = radius + 60;
  card.stats.forEach((stat, index) => {
    const definition = STAT_DEFS.find((item) => item.key === stat.key) || STAT_DEFS[index];
    const lines = definition ? definition.radar : [stat.label];
    const angle = angleAt(index);
    const lx = centerX + Math.cos(angle) * labelRadius;
    const ly = centerY + Math.sin(angle) * labelRadius;
    const isTop = index === 0;
    const anchor = isTop ? "center" : Math.cos(angle) > 0 ? "left" : "right";
    const x = isTop ? lx : lx + (Math.cos(angle) > 0 ? 10 : -10);

    ctx.save();
    ctx.font = `500 20px ${fonts.label}`;
    ctx.fillStyle = hexToRgba(p.text, 0.68);
    ctx.textBaseline = "middle";
    ctx.textAlign = anchor;

    let valueY;
    if (isTop) {
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x, ly - 22 + lineIndex * 22);
      });
      valueY = ly + 14;
    } else if (lines.length === 2) {
      ctx.fillText(lines[0], x, ly - 12);
      ctx.fillText(lines[1], x, ly + 10);
      valueY = ly + 34;
    } else {
      ctx.fillText(lines[0], x, ly - 4);
      valueY = ly + 20;
    }

    ctx.font = `700 19px ${FONT_MONO_CANVAS}`;
    ctx.fillStyle = palette.rc;
    ctx.fillText(String(stat.value), x, valueY);
    ctx.restore();
  });
}

function drawCanvasMoves(ctx, card, startY, theme, palette, fonts) {
  const p = theme.palette;
  const panelFill = theme.dark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.035)";
  const compact = card.moves.length >= 3;
  const rowStep = compact ? 104 : 158;
  const rowHeight = compact ? 96 : 140;

  ctx.save();
  ctx.font = `700 18px ${fonts.label}`;
  ctx.fillStyle = palette.rc;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("JURUS ANDALAN", 90, startY);
  const headingWidth = ctx.measureText("JURUS ANDALAN").width;
  const lineGradient = ctx.createLinearGradient(90 + headingWidth + 22, startY, 910, startY);
  lineGradient.addColorStop(0, hexToRgba(palette.rc, 0.32));
  lineGradient.addColorStop(1, hexToRgba(palette.rc, 0));
  ctx.fillStyle = lineGradient;
  ctx.fillRect(90 + headingWidth + 22, startY - 0.5, 910 - (90 + headingWidth + 22), 1);
  ctx.restore();

  card.moves.forEach((move, index) => {
    const rowY = startY + 34 + index * rowStep;
    const numberY = rowY + (rowHeight - 38) / 2;
    const nameY = rowY + (compact ? 15 : 24);
    const descY = rowY + (compact ? 51 : 66);
    const moveLabel = theme.id === "cyberpunk" || theme.id === "retro"
      ? move.name.toUpperCase()
      : move.name;

    ctx.save();
    roundedRectPath(ctx, 90, rowY, 820, rowHeight, 14);
    ctx.fillStyle = panelFill;
    ctx.fill();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();

    roundedRectPath(ctx, 110, numberY, 38, 38, 9);
    ctx.fillStyle = hexToRgba(palette.rc, 0.13);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(palette.rc, 0.38);
    ctx.stroke();
    ctx.font = `700 15px ${FONT_MONO_CANVAS}`;
    ctx.fillStyle = palette.rc;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(index + 1).padStart(2, "0"), 129, numberY + 19.5);

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `800 27px ${fonts.body}`;
    ctx.fillStyle = p.text;
    const nameLines = wrapCanvasText(ctx, moveLabel, 710, 1);
    ctx.fillText(nameLines[0], 166, nameY);

    ctx.font = `400 20px ${fonts.body}`;
    ctx.fillStyle = hexToRgba(p.text, 0.62);
    const descLines = wrapCanvasText(ctx, move.desc, 710, 2);
    descLines.forEach((line, lineIndex) => {
      ctx.fillText(line, 166, descY + lineIndex * 22);
    });
    ctx.restore();
  });

  return startY + 34 + card.moves.length * rowStep;
}

function drawCanvasBottom(ctx, card, theme, rarity, palette, fonts) {
  const p = theme.palette;
  const boxY = 1146;
  const total = totalStats(card);

  // Kotak kelemahan.
  ctx.save();
  roundedRectPath(ctx, 90, boxY, 820, 64, 14);
  ctx.fillStyle = hexToRgba(palette.rc, 0.08);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(palette.rc, 0.28);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = `700 14px ${fonts.label}`;
  ctx.fillStyle = palette.rc;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("LEMAH TERHADAP", 110, boxY + 22);
  ctx.font = `600 23px ${fonts.body}`;
  ctx.fillStyle = p.text;
  const weakLines = wrapCanvasText(ctx, card.weakness, 780, 1);
  ctx.fillText(weakLines[0], 110, boxY + 46);
  ctx.restore();

  // Quote.
  ctx.save();
  const quoteGradient = ctx.createLinearGradient(0, 1232, 0, 1294);
  quoteGradient.addColorStop(0, hexToRgba(palette.rc, 0));
  quoteGradient.addColorStop(0.5, palette.rc);
  quoteGradient.addColorStop(1, hexToRgba(palette.rc, 0));
  ctx.fillStyle = quoteGradient;
  ctx.fillRect(90, 1232, 3, 62);

  ctx.font = `italic 400 23px ${fonts.body}`;
  ctx.fillStyle = hexToRgba(p.text, 0.76);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const quoteLines = wrapCanvasText(ctx, `“${card.quote}”`, 790, 2);
  quoteLines.forEach((line, index) => {
    ctx.fillText(line, 112, 1234 + index * 30);
  });
  ctx.restore();

  // Footer.
  ctx.save();
  ctx.strokeStyle = p.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(90, 1313);
  ctx.lineTo(910, 1313);
  ctx.stroke();

  ctx.font = `500 15px ${FONT_MONO_CANVAS}`;
  ctx.fillStyle = hexToRgba(p.text, 0.42);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("KARTU MAHASISWA · SERI 01", 90, 1336);

  ctx.font = `600 13px ${FONT_MONO_CANVAS}`;
  ctx.fillStyle = hexToRgba(p.text, 0.42);
  ctx.textAlign = "center";
  ctx.fillText(`TOTAL ${total}/495`, 500, 1336);

  ctx.font = `500 15px ${FONT_MONO_CANVAS}`;
  ctx.textAlign = "right";
  ctx.fillStyle = hexToRgba(palette.rc, 0.9);
  ctx.fillText(`${getTheme(card.theme).name.toUpperCase()} · ${formatSerial(card)}`, 910, 1336);
  ctx.restore();
}

/* ------------------------------------------------------------
   Komposisi kartu PNG
   ------------------------------------------------------------ */
function fitCanvasFontSize(ctx, text, maxWidth, startSize, minSize, weight, family) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}

function drawCanvasBackdrop(ctx, theme) {
  const p = theme.palette;
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  gradient.addColorStop(0, theme.dark ? "#03050c" : "#f2e4d4");
  gradient.addColorStop(0.52, p.bg1);
  gradient.addColorStop(1, theme.dark ? "#101020" : p.bg3);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const vignette = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H * 0.45, 180, CANVAS_W / 2, CANVAS_H * 0.45, 820);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, theme.dark ? "rgba(0,0,0,0.52)" : "rgba(90,58,48,0.16)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.save();
  ctx.strokeStyle = hexToRgba(p.accent, theme.dark ? 0.16 : 0.24);
  ctx.lineWidth = 1;
  ctx.strokeRect(9.5, 9.5, CANVAS_W - 19, CANVAS_H - 19);
  ctx.restore();
}

function drawCanvasHolo(ctx, card, theme, palette, cardX, cardY, cardW, cardH) {
  const strength = { common: 0.06, rare: 0.1, epic: 0.15, legendary: 0.21 }[card.rarity] || 0.08;

  ctx.save();
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, 38);
  ctx.clip();

  const beam = ctx.createLinearGradient(cardX, cardY + cardH, cardX + cardW, cardY);
  beam.addColorStop(0, hexToRgba(palette.rc, 0));
  beam.addColorStop(0.32, hexToRgba(palette.rc, strength * 0.38));
  beam.addColorStop(0.42, hexToRgba("#ffffff", strength * 0.75));
  beam.addColorStop(0.5, hexToRgba(palette.rc2, strength));
  beam.addColorStop(0.58, hexToRgba(palette.rc, strength * 0.55));
  beam.addColorStop(0.7, hexToRgba(palette.rc2, strength * 0.22));
  beam.addColorStop(1, hexToRgba(palette.rc2, 0));
  ctx.fillStyle = beam;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  ctx.strokeStyle = hexToRgba("#ffffff", strength * 0.35);
  ctx.lineWidth = 1;
  for (let offset = -cardH; offset < cardW + cardH; offset += 54) {
    ctx.beginPath();
    ctx.moveTo(cardX + offset, cardY + cardH);
    ctx.lineTo(cardX + offset + cardH, cardY);
    ctx.stroke();
  }

  if (card.rarity === "legendary" || card.rarity === "epic") {
    const glow = ctx.createRadialGradient(cardX + cardW * 0.78, cardY + cardH * 0.16, 0, cardX + cardW * 0.78, cardY + cardH * 0.16, 320);
    glow.addColorStop(0, hexToRgba(palette.rc, strength * 1.35));
    glow.addColorStop(1, hexToRgba(palette.rc, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(cardX, cardY, cardW, cardH);
  }

  ctx.restore();
}

function drawCanvasHeader(ctx, card, theme, rarity, palette, fonts) {
  const p = theme.palette;
  drawRarityPill(ctx, 90, 74, rarity, palette, fonts, theme);

  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = `600 15px ${fonts.label}`;
  ctx.fillStyle = hexToRgba(p.text, 0.5);
  ctx.fillText(`${theme.name.toUpperCase()} · SERI 01`, 910, 86);

  ctx.font = `700 23px ${FONT_MONO_CANVAS}`;
  ctx.fillStyle = palette.rc;
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 12;
  ctx.fillText(formatSerial(card), 910, 110);
  ctx.restore();

  const divider = ctx.createLinearGradient(90, 0, 910, 0);
  divider.addColorStop(0, hexToRgba(palette.rc, 0.42));
  divider.addColorStop(0.6, p.line);
  divider.addColorStop(1, hexToRgba(palette.rc, 0.12));
  ctx.fillStyle = divider;
  ctx.fillRect(90, 142, 820, 1);

  ctx.save();
  ctx.translate(500, 142);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = hexToRgba(palette.rc, 0.6);
  ctx.fillRect(-3.5, -3.5, 7, 7);
  ctx.restore();
}

function drawCanvasIdentity(ctx, card, theme, palette, fonts) {
  const p = theme.palette;
  const avatarX = 90;
  const avatarY = 158;
  const avatarSize = 108;
  const avatarCenter = avatarSize / 2;

  ctx.save();
  ctx.shadowColor = hexToRgba(palette.rc, 0.22);
  ctx.shadowBlur = 24;
  if (theme.id === "anime") {
    ctx.beginPath();
    ctx.arc(avatarX + avatarCenter, avatarY + avatarCenter, avatarCenter, 0, Math.PI * 2);
  } else {
    roundedRectPath(ctx, avatarX, avatarY, avatarSize, avatarSize, theme.id === "cyberpunk" ? 8 : 28);
  }
  ctx.fillStyle = theme.dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.4)";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = hexToRgba(palette.rc, 0.34);
  ctx.lineWidth = 1;
  if (theme.id === "anime") {
    ctx.beginPath();
    ctx.arc(avatarX + avatarCenter, avatarY + avatarCenter, avatarCenter - 13, 0, Math.PI * 2);
  } else {
    roundedRectPath(ctx, avatarX + 13, avatarY + 13, avatarSize - 26, avatarSize - 26, theme.id === "cyberpunk" ? 4 : 19);
  }
  ctx.stroke();
  ctx.restore();

  ctx.save();
  const avatarGlow = ctx.createRadialGradient(
    avatarX + avatarCenter,
    avatarY + avatarSize * 0.32,
    0,
    avatarX + avatarCenter,
    avatarY + avatarCenter,
    avatarSize * 0.62
  );
  avatarGlow.addColorStop(0, hexToRgba(palette.rc, 0.2));
  avatarGlow.addColorStop(1, hexToRgba(palette.rc, 0));
  ctx.fillStyle = avatarGlow;
  ctx.beginPath();
  ctx.arc(avatarX + avatarCenter, avatarY + avatarCenter, avatarCenter, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.font = `52px ${FONT_EMOJI_CANVAS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(card.emblem || "🎓", avatarX + avatarCenter, avatarY + avatarCenter + 3);
  ctx.restore();

  const textX = 222;
  const textWidth = 688;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `21px ${FONT_EMOJI_CANVAS}`;
  ctx.fillStyle = p.text;
  ctx.fillText(theme.icon, textX, 171);

  ctx.font = `600 15px ${fonts.label}`;
  ctx.fillStyle = p.accent;
  ctx.fillText(theme.name.toUpperCase(), textX + 30, 172);

  ctx.textBaseline = "top";
  const nameSize = fitCanvasFontSize(ctx, card.name, textWidth, 46, 26, "800", fonts.display);
  ctx.font = `800 ${nameSize}px ${fonts.display}`;
  ctx.fillStyle = p.text;
  ctx.fillText(card.name, textX, 188);

  const nickname = `“${card.nickname}”`;
  const nickSize = fitCanvasFontSize(ctx, nickname, textWidth, 21, 15, "italic 500", fonts.body);
  ctx.font = `italic 500 ${nickSize}px ${fonts.body}`;
  ctx.fillStyle = hexToRgba(p.text, 0.68);
  ctx.fillText(nickname, textX, 250);
  ctx.restore();

  ctx.fillStyle = p.line;
  ctx.fillRect(90, 292, 820, 1);
}

function drawCanvasRadarSection(ctx, card, theme, palette, fonts) {
  const p = theme.palette;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `700 18px ${fonts.label}`;
  ctx.fillStyle = palette.rc;
  ctx.fillText("STATISTIK RPG", 90, 320);

  const headingWidth = ctx.measureText("STATISTIK RPG").width;
  const lineGradient = ctx.createLinearGradient(90 + headingWidth + 22, 0, 910, 0);
  lineGradient.addColorStop(0, hexToRgba(palette.rc, 0.32));
  lineGradient.addColorStop(1, hexToRgba(palette.rc, 0));
  ctx.fillStyle = lineGradient;
  ctx.fillRect(90 + headingWidth + 22, 319.5, 910 - (90 + headingWidth + 22), 1);

  ctx.textAlign = "right";
  ctx.font = `600 13px ${fonts.label}`;
  ctx.fillStyle = hexToRgba(p.text, 0.42);
  ctx.fillText("5 ATRIBUT · SKALA 0—100", 910, 320);
  ctx.restore();

  const panel = ctx.createLinearGradient(90, 342, 910, 752);
  panel.addColorStop(0, theme.dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.38)");
  panel.addColorStop(0.6, theme.dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.2)");
  panel.addColorStop(1, theme.dark ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)");

  ctx.save();
  roundedRectPath(ctx, 90, 342, 820, 410, 20);
  ctx.fillStyle = panel;
  ctx.fill();
  ctx.strokeStyle = p.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  drawCanvasRadar(ctx, card, 500, 552, 120, theme, palette, fonts);
}

function drawCardCanvas(card) {
  if (!card) throw new Error("Kartu tidak tersedia untuk digambar.");

  const theme = getTheme(card.theme);
  const rarity = getRarity(card.rarity);
  const palette = paletteFor(card.theme, card.rarity);
  const fonts = CANVAS_FONTS[theme.id] || CANVAS_FONTS.cyberpunk;
  const p = theme.palette;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W * CANVAS_SCALE;
  canvas.height = CANVAS_H * CANVAS_SCALE;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia di browser ini.");
  ctx.scale(CANVAS_SCALE, CANVAS_SCALE);

  const cardX = 26;
  const cardY = 26;
  const cardW = 948;
  const cardH = 1348;
  const radius = 38;

  drawCanvasBackdrop(ctx, theme);

  // Badan kartu dan bayangannya.
  ctx.save();
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = p.bg1;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 18;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.clip();
  drawThemeBackground(ctx, theme, cardX, cardY, cardW, cardH);
  ctx.restore();

  drawCanvasHolo(ctx, card, theme, palette, cardX, cardY, cardW, cardH);
  drawCanvasFrame(ctx, theme, rarity, cardX, cardY, cardW, cardH);

  drawCanvasHeader(ctx, card, theme, rarity, palette, fonts);
  drawCanvasIdentity(ctx, card, theme, palette, fonts);
  drawCanvasRadarSection(ctx, card, theme, palette, fonts);
  drawCanvasMoves(ctx, card, 790, theme, palette, fonts);
  drawCanvasBottom(ctx, card, theme, rarity, palette, fonts);

  // Lapisan akhir supaya tepi kartu tetap bersih.
  ctx.save();
  roundedRectPath(ctx, cardX + 1.5, cardY + 1.5, cardW - 3, cardH - 3, radius);
  ctx.strokeStyle = hexToRgba(palette.rc, theme.dark ? 0.55 : 0.72);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  return canvas;
}

/* ------------------------------------------------------------
   Unduh PNG
   ------------------------------------------------------------ */
function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === "function") {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas tidak menghasilkan blob PNG."));
      }, "image/png");
      return;
    }

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1] || "";
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      resolve(new Blob([bytes], { type: "image/png" }));
    } catch (error) {
      reject(error);
    }
  });
}

function slugifyName(name) {
  const slug = String(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "mahasiswa";
}

async function exportCardPng(card, button, label) {
  if (!card) {
    showToast("Belum ada kartu yang bisa diunduh.", "info");
    return false;
  }

  const target = label || button;
  const idleText = target ? target.textContent : "";
  if (button) {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
  }
  if (target) target.textContent = "Menyiapkan…";

  try {
    const canvas = drawCardCanvas(card);
    const blob = await canvasToBlob(canvas);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const serial = String(card.serialNumber).padStart(4, "0");
    link.href = objectUrl;
    link.download = `kartu-${slugifyName(card.name)}-${serial}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);

    if (target) target.textContent = "PNG terunduh ✓";
    showToast(`PNG ${formatSerial(card)} sedang diunduh.`, "success");
    window.setTimeout(() => {
      if (target && target.textContent === "PNG terunduh ✓") {
        target.textContent = idleText || "Unduh PNG";
      }
    }, 2200);
    return true;
  } catch (error) {
    console.error("Gagal membuat PNG:", error);
    if (target) target.textContent = idleText || "Unduh PNG";
    showToast("PNG gagal dibuat. Coba lagi sebentar, ya.", "error", 5000);
    return false;
  } finally {
    if (button) {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  }
}

function downloadCurrentCard() {
  if (!currentCard) {
    showToast("Buka pack dulu sebelum mengunduh.", "info");
    return;
  }
  void exportCardPng(currentCard, els.downloadBtn, els.downloadLabel);
}

function downloadModalCard() {
  if (!modalCard) {
    showToast("Tidak ada kartu yang sedang dibuka.", "info");
    return;
  }
  void exportCardPng(modalCard, els.dialogDownload, null);
}

/* ------------------------------------------------------------
   Event & inisialisasi
   ------------------------------------------------------------ */
function goToGenerator() {
  if (typeof els.nameInput.focus === "function") {
    els.nameInput.focus({ preventScroll: true });
  }
  const generator = document.getElementById("generator");
  if (generator) {
    generator.scrollIntoView({
      behavior: motionQuery.matches ? "auto" : "smooth",
      block: "start"
    });
  }
}

function init() {
  const savedTheme = getSavedTheme();
  selectedTheme = savedTheme;
  let hasSelectedTheme = false;

  themeInputs.forEach((input) => {
    input.checked = input.value === savedTheme;
    if (input.checked) hasSelectedTheme = true;
  });

  if (!hasSelectedTheme && themeInputs.length) {
    const fallback = themeInputs.find((input) => input.value === "cyberpunk") || themeInputs[0];
    fallback.checked = true;
    selectedTheme = fallback.value;
  }

  applyThemeToPack(selectedTheme);
  updateCharCount();
  refreshCollectionUI();
  bindTilt();
  initGyroAvailability();
  els.year.textContent = String(new Date().getFullYear());

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    void openPack();
  });

  themeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked || isOpening) return;
      selectedTheme = input.value;
      saveTheme(selectedTheme);
      applyThemeToPack(selectedTheme);
      if (els.cardShell.hidden) {
        setStatus(`${getTheme(selectedTheme).name} dipilih. Siap buka pack.`);
      }
    });
  });

  els.nameInput.addEventListener("input", () => {
    updateCharCount();
    clearError();
  });

  els.clearBtn.addEventListener("click", () => {
    els.nameInput.value = "";
    updateCharCount();
    clearError();
    els.nameInput.focus();
  });

  els.randomNameBtn.addEventListener("click", fillRandomName);
  els.downloadBtn.addEventListener("click", downloadCurrentCard);
  els.gyroBtn.addEventListener("click", () => {
    void toggleGyro();
  });

  els.albumGrid.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const cta = target.closest("[data-action='goto-generator']");
    if (cta) {
      goToGenerator();
      return;
    }

    const deleteButton = target.closest("[data-delete]");
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      deleteCardWithConfirm(Number(deleteButton.dataset.delete));
      return;
    }

    const openButton = target.closest("[data-serial]");
    if (openButton) {
      const card = findCard(openButton.dataset.serial);
      if (card) openCardDialog(card);
    }
  });

  els.clearAlbumBtn.addEventListener("click", clearAlbum);

  const handleDuelChange = (changed, other) => {
    if (changed.value && changed.value === other.value) {
      const alternative = collection.find((card) => String(card.serialNumber) !== changed.value);
      if (alternative) other.value = String(alternative.serialNumber);
    }
    renderDuelPreview("A");
    renderDuelPreview("B");
    updateDuelState();
    hideDuelResult();
  };

  els.duelSelectA.addEventListener("change", () => {
    handleDuelChange(els.duelSelectA, els.duelSelectB);
  });

  els.duelSelectB.addEventListener("change", () => {
    handleDuelChange(els.duelSelectB, els.duelSelectA);
  });

  els.duelBtn.addEventListener("click", startDuel);

  els.dialogClose.addEventListener("click", closeCardDialog);
  els.dialogDownload.addEventListener("click", downloadModalCard);
  els.dialogDelete.addEventListener("click", () => {
    if (modalCard) deleteCardWithConfirm(modalCard.serialNumber);
  });

  els.dialog.addEventListener("click", (event) => {
    if (event.target === els.dialog) closeCardDialog();
  });

  els.dialog.addEventListener("close", () => {
    modalCard = null;
  });
}

init();
