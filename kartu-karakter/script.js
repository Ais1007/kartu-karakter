/* ============================================================
   GENERATOR KARTU KARAKTER — logika utama
   Deterministik: hash nama menjadi seed untuk semua atribut.
   ============================================================ */
"use strict";

/* ------------------------------------------------------------
   1. DATA KELAS
   ------------------------------------------------------------ */
const CLASSES = [
  {
    name: "Ksatria",
    emoji: "⚔️",
    color: "#60a5fa",
    boost: ["strength", "charisma"],
    skills: [
      { name: "Tebasan Diskon 50%", desc: "Menebas semua masalah, kecuali daftar belanja bulanan." },
      { name: "Perisai Anti Baper", desc: "Kebal serangan fisik dan pesan 'kamu lagi apa?' jam dua pagi." },
      { name: "Jurus Kuda Besi", desc: "Menerjang lawan sambil tetap memarkir motor di tempatnya." }
    ]
  },
  {
    name: "Penyihir",
    emoji: "🧙",
    color: "#c084fc",
    boost: ["intelligence", "luck"],
    skills: [
      { name: "Mantra Gosok Lampu", desc: "Memanggil jin, tapi yang datang malah tagihan listrik." },
      { name: "Fireball Hemat Energi", desc: "Bola api ramah lingkungan yang cuma bikin ruangan hangat." },
      { name: "Teleport Telat", desc: "Sampai dalam sekejap, tapi selalu datang lima belas menit kemudian." }
    ]
  },
  {
    name: "Ninja",
    emoji: "🥷",
    color: "#fb7185",
    boost: ["speed", "strength"],
    skills: [
      { name: "Ngilang Tanpa Kabar", desc: "Menghilang sempurna, sayangnya kunci motor ikut hilang." },
      { name: "Shuriken Gratis Ongkir", desc: "Melempar bintang ninja dengan gratis ongkir se-Indonesia." },
      { name: "Bayangan Numpang Lewat", desc: "Berbaur dengan bayangan, lalu minta ganti rugi." }
    ]
  },
  {
    name: "Hacker",
    emoji: "👾",
    color: "#22d3ee",
    boost: ["intelligence", "speed"],
    skills: [
      { name: "Ctrl + Alt + Kalah", desc: "Membuat lawan terkena error 404: skill tidak ditemukan." },
      { name: "Firewall Cinta", desc: "Memblokir semua godaan, kecuali notifikasi chat dari dia." },
      { name: "Phishing Ikan Asin", desc: "Menipu lawan dengan iklan lowongan gaji dua puluh juta." }
    ]
  },
  {
    name: "Pemanah",
    emoji: "🏹",
    color: "#34d399",
    boost: ["speed", "intelligence"],
    skills: [
      { name: "Panah Cinta Monyet", desc: "Melesat ke hati lawan, tapi nyangkut di pohon mangga." },
      { name: "Zoom Mata Elang", desc: "Bisa melihat sepuluh kilometer, sayangnya minus kuota internet." },
      { name: "Arrow Gratis Ongkir", desc: "Satu panah melesat, ongkirnya ditanggung pahlawan." }
    ]
  },
  {
    name: "Alkemis",
    emoji: "⚗️",
    color: "#a3e635",
    boost: ["intelligence", "luck"],
    skills: [
      { name: "Ramuan Kopi 10 Detik", desc: "Bikin semua orang melek sampai besok subuh." },
      { name: "Elixir Anti Panik", desc: "Cocok diminum sebelum membuka nilai ujian." },
      { name: "Bom Asap Vape", desc: "Asapnya wangi bubble gum, lawannya jadi mabuk." }
    ]
  },
  {
    name: "Viking",
    emoji: "🪓",
    color: "#fb923c",
    boost: ["strength", "charisma"],
    skills: [
      { name: "Kapak Selfie", desc: "Menebas sambil mencari angle terbaik untuk konten." },
      { name: "Perahu Mabuk Laut", desc: "Mengarungi badai, tapi awaknya sudah mabuk duluan." },
      { name: "Terompet Valhalla", desc: "Suaranya bikin lawan menyerah demi ketenangan bersama." }
    ]
  },
  {
    name: "Astronot",
    emoji: "🧑‍🚀",
    color: "#818cf8",
    boost: ["intelligence", "speed"],
    skills: [
      { name: "Gravitasi Rebahan", desc: "Membuat lawan mengapung malas dan enggan berdiri." },
      { name: "Misi ke Bulan Dekat", desc: "Meluncur ke angkasa, tapi tiketnya habis di tengah jalan." },
      { name: "Oksigen Isi Ulang", desc: "Napas tambahan lima detik, cukup untuk bilang 'aku baik-baik saja'." }
    ]
  },
  {
    name: "Bard",
    emoji: "🎸",
    color: "#f472b6",
    boost: ["charisma", "luck"],
    skills: [
      { name: "Chord Patah Hati", desc: "Semua musuh ikut galau dan lupa cara menyerang." },
      { name: "Karaoke Off-Key", desc: "Suara sumbang yang memaksa lawan menutup telinga." },
      { name: "Suling Kentut Elegan", desc: "Melodi ajaib yang bikin arena hening seketika." }
    ]
  },
  {
    name: "Koki",
    emoji: "🍳",
    color: "#fbbf24",
    boost: ["charisma", "intelligence"],
    skills: [
      { name: "Rendang Level Dewa", desc: "Satu suapan, lawan langsung rindu kampung halaman." },
      { name: "Sambal Petir", desc: "Pedasnya bikin asap keluar dari telinga lawan." },
      { name: "Mie Instan Instan", desc: "Matang dalam nol detik, tapi tetap menunggu tiga menit." }
    ]
  }
];

const STAT_DEFS = [
  { key: "strength", label: "Kekuatan" },
  { key: "intelligence", label: "Kecerdasan" },
  { key: "speed", label: "Kecepatan" },
  { key: "charisma", label: "Karisma" },
  { key: "luck", label: "Keberuntungan" }
];

const RARITIES = [
  { id: "common", label: "Common", tier: "C", chance: 45, tag: "Signature", color: "#c3cde0", color2: "#8a97b3", glow: "rgba(195,205,224,0.32)" },
  { id: "rare", label: "Rare", tier: "B", chance: 30, tag: "Advanced", color: "#38bdf8", color2: "#0ea5e9", glow: "rgba(56,189,248,0.4)" },
  { id: "epic", label: "Epic", tier: "A", chance: 18, tag: "Ultimate", color: "#c084fc", color2: "#e879f9", glow: "rgba(192,132,252,0.46)" },
  { id: "legendary", label: "Legendary", tier: "S", chance: 7, tag: "Mythic", color: "#fbbf24", color2: "#fb923c", glow: "rgba(251,191,36,0.5)" }
];

const RANDOM_NAMES = [
  "Budi Santuy",
  "Ratu Rebahan",
  "Sultan Overthinking",
  "Mbak Baper",
  "Kapten Ngaret",
  "Dokter Kucing",
  "Mas Gabut",
  "Neng Receh",
  "Om Senja",
  "Kak Scroll"
];

/* ------------------------------------------------------------
   2. REFERENSI ELEMEN
   ------------------------------------------------------------ */
const els = {
  form: document.getElementById("generateForm"),
  nameInput: document.getElementById("nameInput"),
  charCount: document.getElementById("charCount"),
  inputShell: document.getElementById("inputShell"),
  clearBtn: document.getElementById("clearBtn"),
  formError: document.getElementById("formError"),
  generateBtn: document.getElementById("generateBtn"),
  generateLabel: document.getElementById("generateLabel"),
  randomBtn: document.getElementById("randomBtn"),
  suggestions: document.getElementById("suggestions"),
  stage: document.getElementById("stage"),
  stageRarity: document.getElementById("stageRarity"),
  cardZone: document.getElementById("cardZone"),
  cardTilt: document.getElementById("cardTilt"),
  cardInner: document.getElementById("cardInner"),
  cardFront: document.getElementById("cardFront"),
  cardBack: document.getElementById("cardBack"),
  rarityLabel: document.getElementById("rarityLabel"),
  cardNumber: document.getElementById("cardNumber"),
  portraitEmoji: document.getElementById("portraitEmoji"),
  powerValue: document.getElementById("powerValue"),
  characterName: document.getElementById("characterName"),
  classIcon: document.getElementById("classIcon"),
  className: document.getElementById("className"),
  tierLabel: document.getElementById("tierLabel"),
  stats: document.getElementById("stats"),
  skillTag: document.getElementById("skillTag"),
  skillName: document.getElementById("skillName"),
  skillDesc: document.getElementById("skillDesc"),
  seedLabel: document.getElementById("seedLabel"),
  downloadBtn: document.getElementById("downloadBtn"),
  downloadLabel: document.getElementById("downloadLabel"),
  status: document.getElementById("status"),
  particles: document.getElementById("particles"),
  year: document.getElementById("year")
};

let currentCard = null;
let generationToken = 0;
let isGenerating = false;
let lastRandomName = "";
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 980px)");

/* ------------------------------------------------------------
   3. UTILITAS & SEED
   ------------------------------------------------------------ */
function normalizeName(value) {
  return value.replace(/\s+/g, " ").trim();
}

// FNV-1a 32-bit: cepat, stabil, dan cukup untuk seed kartu.
function hashString(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// PRNG mulberry32: urutan angka selalu sama untuk seed yang sama.
function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRarity(roll) {
  let accumulator = 0;
  const percentile = roll * 100;
  for (const rarity of RARITIES) {
    accumulator += rarity.chance;
    if (percentile < accumulator) return rarity;
  }
  return RARITIES[0];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

/* ------------------------------------------------------------
   4. MEMBUAT KARTU DARI NAMA
   ------------------------------------------------------------ */
function createCard(rawName) {
  const name = normalizeName(rawName);
  const normalized = name.normalize("NFKC").toLocaleLowerCase("id-ID");
  const hash = hashString(normalized);
  const random = mulberry32(hash);

  // Urutan pemanggilan random selalu sama agar hasil konsisten.
  const rarity = pickRarity(random());
  const charClass = CLASSES[Math.floor(random() * CLASSES.length)];

  const rarityBonus = { common: 0, rare: 5, epic: 11, legendary: 17 }[rarity.id];
  const stats = STAT_DEFS.map((stat) => {
    let value = 32 + Math.floor(random() * 42); // dasar 32–73
    if (charClass.boost.includes(stat.key)) {
      value += 10 + Math.floor(random() * 7); // bonus kelas
    }
    value += rarityBonus + Math.floor(random() * 4);
    return { ...stat, value: clamp(value, 20, 99) };
  });

  const skill = charClass.skills[Math.floor(random() * charClass.skills.length)];
  const power = Math.round(stats.reduce((sum, stat) => sum + stat.value, 0) / stats.length);
  const seed = hash.toString(36).toUpperCase().padStart(6, "0").slice(-6);
  const cardNumber = `#${(hash & 0xffff).toString(16).toUpperCase().padStart(4, "0")}`;

  return {
    name,
    normalized,
    hash,
    seed,
    cardNumber,
    rarity,
    charClass,
    stats,
    skill,
    power
  };
}

/* ------------------------------------------------------------
   5. RENDER ISI KARTU
   ------------------------------------------------------------ */
function renderCard(card) {
  const { rarity, charClass } = card;

  els.cardFront.dataset.rarity = rarity.id;
  els.stage.dataset.rarity = rarity.id;
  els.cardFront.style.setProperty("--class-color", charClass.color);
  els.cardFront.style.setProperty("--class-glow", hexToRgba(charClass.color, 0.3));

  els.rarityLabel.textContent = rarity.label;
  els.cardNumber.textContent = card.cardNumber;
  els.stageRarity.textContent = `${rarity.label} · Tier ${rarity.tier}`;
  els.portraitEmoji.textContent = charClass.emoji;
  els.portraitEmoji.setAttribute("aria-label", `Ilustrasi ${charClass.name}`);
  els.characterName.textContent = card.name;
  els.classIcon.textContent = charClass.emoji;
  els.className.textContent = charClass.name;
  els.tierLabel.textContent = `Tier ${rarity.tier}`;
  els.powerValue.textContent = String(card.power);
  els.skillTag.textContent = rarity.tag;
  els.skillName.textContent = card.skill.name;
  els.skillDesc.textContent = card.skill.desc;
  els.seedLabel.textContent = `Seed · ${card.seed}`;

  const nameLength = Array.from(card.name).length;
  els.cardFront.classList.toggle("long-name", nameLength > 16 && nameLength <= 22);
  els.cardFront.classList.toggle("xlong-name", nameLength > 22);

  // Bar statistik dibuat ulang setiap kartu.
  const fragment = document.createDocumentFragment();
  card.stats.forEach((stat, index) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const label = document.createElement("span");
    label.className = "stat-label";
    label.textContent = stat.label;

    const track = document.createElement("span");
    track.className = "stat-track";

    const fill = document.createElement("span");
    fill.className = "stat-fill";
    fill.style.setProperty("--val", `${stat.value}%`);
    fill.style.setProperty("--i", String(index));
    track.appendChild(fill);

    const value = document.createElement("span");
    value.className = "stat-value";
    value.textContent = String(stat.value);

    row.append(label, track, value);
    fragment.appendChild(row);
  });
  els.stats.replaceChildren(fragment);

  els.cardFront.setAttribute(
    "aria-label",
    `Kartu ${rarity.label} untuk ${card.name}. Kelas ${charClass.name}. Power ${card.power}. Skill ${card.skill.name}.`
  );
}

/* ------------------------------------------------------------
   6. UI: ERROR, HITUNG KARAKTER, STATUS TOMBOL
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
  // Paksa reflow agar animasi getar bisa diputar ulang.
  void els.inputShell.offsetWidth;
  els.inputShell.classList.add("has-error");
}

function clearError() {
  if (!els.formError.textContent) return;
  els.formError.textContent = "";
  els.nameInput.removeAttribute("aria-invalid");
  els.inputShell.classList.remove("has-error");
}

function setBusy(busy) {
  isGenerating = busy;
  els.generateBtn.disabled = busy;
  els.generateBtn.classList.toggle("is-loading", busy);
  els.generateLabel.textContent = busy ? "Membaca takdir…" : "Generate Kartu";
}

/* ------------------------------------------------------------
   7. EFEK REVEAL: PARTIKEL & STATUS
   ------------------------------------------------------------ */
function launchParticles(rarity) {
  els.particles.replaceChildren();
  if (motionQuery.matches) return;

  const count = window.innerWidth < 600 ? 18 : 28;
  const colors = [rarity.color, rarity.color2, "#ffffff"];
  const nodes = [];

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 85 + Math.random() * 190;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.className = "particle";
    particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${2 + Math.random() * 5}px`);
    particle.style.setProperty("--delay", `${Math.random() * 0.14}s`);
    particle.style.background = color;
    particle.style.boxShadow = `0 0 8px ${color}`;
    els.particles.appendChild(particle);
    nodes.push(particle);
  }

  window.setTimeout(() => {
    nodes.forEach((node) => node.remove());
  }, 1250);
}

function announceSuccess(card) {
  els.status.textContent = `Kartu ${card.rarity.label} untuk ${card.name} siap diunduh.`;
  els.status.classList.add("is-success");
}

function scrollToCard() {
  if (!mobileQuery.matches) return;
  els.cardZone.scrollIntoView({
    behavior: motionQuery.matches ? "auto" : "smooth",
    block: "center"
  });
}

/* ------------------------------------------------------------
   8. ALUR GENERATE
   ------------------------------------------------------------ */
async function generateCard(rawName, options = {}) {
  if (isGenerating) return;

  const name = normalizeName(rawName);
  if (!name) {
    showError("Nama tidak boleh kosong. Takdir butuh identitas.");
    els.nameInput.focus();
    return;
  }

  clearError();
  els.nameInput.value = name;
  updateCharCount();

  const card = createCard(name);
  const token = ++generationToken;
  // Cek sebelum class flip dihapus untuk menentukan durasi jeda.
  const wasFlipped = els.cardInner.classList.contains("is-flipped");

  setBusy(true);
  els.downloadBtn.disabled = true;
  els.status.classList.remove("is-success");
  els.status.textContent = wasFlipped ? "Mengocok ulang takdir..." : "Membaca hash namamu...";
  els.particles.replaceChildren();
  els.cardInner.classList.remove("is-flipped");
  els.cardBack.removeAttribute("aria-hidden");
  els.cardFront.setAttribute("aria-hidden", "true");

  await wait(motionQuery.matches ? 20 : wasFlipped ? 500 : 280);
  if (token !== generationToken) return;

  renderCard(card);
  currentCard = card;

  // Dua frame memastikan browser sempat mengecat wajah depan sebelum flip.
  await nextFrame();
  await nextFrame();
  if (token !== generationToken) return;

  els.cardInner.classList.add("is-flipped");
  els.cardBack.setAttribute("aria-hidden", "true");
  els.cardFront.removeAttribute("aria-hidden");
  setBusy(false);
  els.downloadBtn.disabled = false;
  document.title = `${card.name} · ${card.rarity.label} | Kartu Karakter`;

  window.setTimeout(() => {
    if (token !== generationToken) return;
    launchParticles(card.rarity);
    announceSuccess(card);
  }, motionQuery.matches ? 0 : 380);

  if (options.scroll) {
    window.setTimeout(() => {
      if (token === generationToken) scrollToCard();
    }, motionQuery.matches ? 30 : 560);
  }
}

/* ------------------------------------------------------------
   9. KONTROL INPUT & NAMA ACAK
   ------------------------------------------------------------ */
function chooseRandomName() {
  let candidate = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  if (candidate === lastRandomName) {
    const index = (RANDOM_NAMES.indexOf(candidate) + 1) % RANDOM_NAMES.length;
    candidate = RANDOM_NAMES[index];
  }
  lastRandomName = candidate;
  return candidate;
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isGenerating) return;
  generateCard(els.nameInput.value, { scroll: true });
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

els.randomBtn.addEventListener("click", () => {
  if (isGenerating) return;
  const name = chooseRandomName();
  els.nameInput.value = name;
  updateCharCount();
  generateCard(name, { scroll: true });
});

els.suggestions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-name]");
  if (!button || isGenerating) return;
  els.nameInput.value = button.dataset.name;
  updateCharCount();
  generateCard(button.dataset.name, { scroll: true });
});

// Enter sudah ditangani form; Escape menghapus pesan error.
els.nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearError();
    els.nameInput.blur();
  }
});

/* ------------------------------------------------------------
   10. TILT 3D MENGIKUTI KURSOR / SENTUHAN
   ------------------------------------------------------------ */
let tiltFrame = 0;
let pendingPoint = null;
let touchTilting = false;

function applyTilt(clientX, clientY) {
  const rect = els.cardTilt.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const px = clamp((clientX - rect.left) / rect.width, 0, 1);
  const py = clamp((clientY - rect.top) / rect.height, 0, 1);
  const rotateX = (0.5 - py) * 14;
  const rotateY = (px - 0.5) * 16;

  els.cardTilt.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.018)`;
  els.cardTilt.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
  els.cardTilt.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
}

function queueTilt(clientX, clientY) {
  pendingPoint = { x: clientX, y: clientY };
  if (tiltFrame) return;
  tiltFrame = requestAnimationFrame(() => {
    tiltFrame = 0;
    if (!pendingPoint) return;
    applyTilt(pendingPoint.x, pendingPoint.y);
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
  els.cardTilt.style.setProperty("--my", "26%");
}

if (!motionQuery.matches) {
  els.cardTilt.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      els.cardTilt.classList.add("is-tilting");
    }
  });

  els.cardTilt.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" && !touchTilting) return;
    queueTilt(event.clientX, event.clientY);
  });

  els.cardTilt.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    resetTilt();
  });

  els.cardTilt.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
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

/* ------------------------------------------------------------
   11. INISIALISASI KECIL
   ------------------------------------------------------------ */
els.year.textContent = String(new Date().getFullYear());
updateCharCount();

/* ------------------------------------------------------------
   12. EXPORT PNG: HELPER CANVAS
   ------------------------------------------------------------ */
const MONO_STACK = '"Cascadia Mono", "Cascadia Code", "SFMono-Regular", Consolas, monospace';
const EMOJI_STACK = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

function roundRectPath(ctx, x, y, width, height, radius) {
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

// Posisi elemen relatif terhadap sisi depan kartu (tidak terpengaruh transform 3D).
function relativeBox(element) {
  let x = 0;
  let y = 0;
  let node = element;
  while (node && node !== els.cardFront) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return {
    x,
    y,
    w: element.offsetWidth,
    h: element.offsetHeight
  };
}

function fontFrom(element) {
  const style = getComputedStyle(element);
  return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

function wrapCanvasText(ctx, text, maxWidth, maxLines) {
  let remaining = text.trim();
  const lines = [];

  // Potong per karakter bila perlu, tetapi utamakan spasi sebagai titik potong.
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
    let last = lines[lines.length - 1];
    while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last.trimEnd()}…`;
  }

  return lines.length ? lines : [""];
}

function drawTextInBox(ctx, text, box, element, options = {}) {
  const style = getComputedStyle(element);
  const font = options.font || fontFrom(element);
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.25;
  const maxLines = options.maxLines || 1;

  ctx.save();
  ctx.font = font;
  ctx.fillStyle = options.color || style.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const lines = wrapCanvasText(ctx, text, box.w, maxLines);
  const totalHeight = lines.length * lineHeight;
  const startY = box.y + (box.h - totalHeight) / 2 + lineHeight / 2;

  lines.forEach((line, lineIndex) => {
    ctx.fillText(line, box.x, startY + lineIndex * lineHeight);
  });
  ctx.restore();
  return lines;
}

function drawPill(ctx, box, label, font, color, align = "left") {
  ctx.save();
  roundRectPath(ctx, box.x, box.y, box.w, box.h, box.h / 2);
  ctx.fillStyle = "rgba(4, 7, 16, 0.38)";
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, 0.42);
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  const diamondX = box.x + box.h * 0.58;
  const diamondY = box.y + box.h / 2;
  const diamondSize = Math.max(2.4, box.h * 0.105);
  ctx.translate(diamondX, diamondY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 7;
  ctx.fillRect(-diamondSize, -diamondSize, diamondSize * 2, diamondSize * 2);
  ctx.restore();

  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.textAlign = align;
  const textX = align === "right" ? box.x + box.w - box.h * 0.42 : box.x + box.h * 0.94;
  ctx.fillText(label, textX, box.y + box.h / 2 + 0.5);
  ctx.restore();
}

function drawSparkle(ctx, x, y, size, color, alpha = 0.8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.12, size, 0);
  ctx.quadraticCurveTo(size * 0.12, size * 0.12, 0, size);
  ctx.quadraticCurveTo(-size * 0.12, size * 0.12, -size, 0);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.12, 0, -size);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------
   13. EXPORT PNG: MENGGAMBAR KARTU
   ------------------------------------------------------------ */
function drawCardCanvas(card) {
  const W = els.cardFront.offsetWidth;
  const H = els.cardFront.offsetHeight;
  const scale = 2.5;
  const margin = Math.max(30, Math.round(W * 0.085));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round((W + margin * 2) * scale);
  canvas.height = Math.round((H + margin * 2) * scale);

  const ctx = canvas.getContext("2d");
  const { rarity, charClass } = card;
  const radius = parseFloat(getComputedStyle(els.cardFront).borderTopLeftRadius) || 22;

  ctx.scale(scale, scale);
  ctx.translate(margin, margin);

  // Cahaya luar mengikuti warna kelangkaan.
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 34;
  ctx.fillStyle = "#070a16";
  roundRectPath(ctx, 0, 0, W, H, radius);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRectPath(ctx, 0, 0, W, H, radius);
  ctx.clip();

  // Latar dasar kartu.
  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, "#141b37");
  base.addColorStop(0.52, "#0b1021");
  base.addColorStop(1, "#070a16");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const rarityGlow = ctx.createRadialGradient(W * 0.86, H * 0.01, 0, W * 0.86, H * 0.01, W * 0.68);
  rarityGlow.addColorStop(0, hexToRgba(rarity.color, 0.2));
  rarityGlow.addColorStop(1, hexToRgba(rarity.color, 0));
  ctx.fillStyle = rarityGlow;
  ctx.fillRect(0, 0, W, H);

  const classGlow = ctx.createRadialGradient(W * 0.06, H * 1.01, 0, W * 0.06, H * 1.01, W * 0.8);
  classGlow.addColorStop(0, hexToRgba(charClass.color, 0.17));
  classGlow.addColorStop(1, hexToRgba(charClass.color, 0));
  ctx.fillStyle = classGlow;
  ctx.fillRect(0, 0, W, H);

  // Grid halus.
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.028)";
  ctx.lineWidth = 1;
  const gridStep = W * 0.065;
  for (let x = gridStep; x < W; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = gridStep; y < H; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();

  // Kilau diagonal tipis.
  const sheen = ctx.createLinearGradient(0, 0, W, H * 0.7);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.055)");
  sheen.addColorStop(0.4, "rgba(255, 255, 255, 0.012)");
  sheen.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  // Baris atas: kelangkaan dan nomor kartu.
  const rarityBox = relativeBox(document.getElementById("rarityBadge"));
  const rarityStyle = getComputedStyle(els.rarityLabel);
  drawPill(
    ctx,
    rarityBox,
    rarity.label.toUpperCase(),
    `${rarityStyle.fontStyle} ${rarityStyle.fontWeight} ${rarityStyle.fontSize} ${rarityStyle.fontFamily}`,
    rarity.color
  );

  const numberBox = relativeBox(els.cardNumber);
  const numberStyle = getComputedStyle(els.cardNumber);
  ctx.save();
  ctx.font = fontFrom(els.cardNumber);
  ctx.fillStyle = numberStyle.color;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(card.cardNumber, numberBox.x + numberBox.w, numberBox.y + numberBox.h / 2);
  ctx.restore();

  // Potret karakter.
  const portraitBox = relativeBox(els.cardFront.querySelector(".portrait"));
  const portraitRadius = W * 0.032;
  ctx.save();
  roundRectPath(ctx, portraitBox.x, portraitBox.y, portraitBox.w, portraitBox.h, portraitRadius);
  ctx.clip();

  const portraitBg = ctx.createLinearGradient(portraitBox.x, portraitBox.y, portraitBox.x + portraitBox.w, portraitBox.y + portraitBox.h);
  portraitBg.addColorStop(0, "rgba(255, 255, 255, 0.055)");
  portraitBg.addColorStop(0.55, "rgba(255, 255, 255, 0.012)");
  portraitBg.addColorStop(1, "rgba(0, 0, 0, 0.16)");
  ctx.fillStyle = portraitBg;
  ctx.fillRect(portraitBox.x, portraitBox.y, portraitBox.w, portraitBox.h);

  const portraitCenterX = portraitBox.x + portraitBox.w / 2;
  const portraitCenterY = portraitBox.y + portraitBox.h / 2;
  const portraitAura = ctx.createRadialGradient(portraitCenterX, portraitCenterY, 0, portraitCenterX, portraitCenterY, portraitBox.w * 0.43);
  portraitAura.addColorStop(0, hexToRgba(charClass.color, 0.34));
  portraitAura.addColorStop(1, hexToRgba(charClass.color, 0));
  ctx.fillStyle = portraitAura;
  ctx.fillRect(portraitBox.x, portraitBox.y, portraitBox.w, portraitBox.h);

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
  ctx.lineWidth = 1;
  const portraitGrid = W * 0.07;
  ctx.beginPath();
  for (let gx = portraitBox.x + portraitGrid; gx < portraitBox.x + portraitBox.w; gx += portraitGrid) {
    ctx.moveTo(gx, portraitBox.y);
    ctx.lineTo(gx, portraitBox.y + portraitBox.h);
  }
  for (let gy = portraitBox.y + portraitGrid; gy < portraitBox.y + portraitBox.h; gy += portraitGrid) {
    ctx.moveTo(portraitBox.x, gy);
    ctx.lineTo(portraitBox.x + portraitBox.w, gy);
  }
  ctx.stroke();
  ctx.restore();

  // Orbit dekoratif.
  ctx.save();
  ctx.strokeStyle = hexToRgba(rarity.color, 0.38);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(portraitCenterX, portraitCenterY, portraitBox.w * 0.31, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([4, 7]);
  ctx.strokeStyle = hexToRgba(rarity.color, 0.26);
  ctx.beginPath();
  ctx.arc(portraitCenterX, portraitCenterY, portraitBox.w * 0.235, 0.3, Math.PI * 2 - 0.5);
  ctx.stroke();
  ctx.restore();

  // Emoji kelas.
  const emojiStyle = getComputedStyle(els.portraitEmoji);
  ctx.save();
  ctx.font = `${parseFloat(emojiStyle.fontSize)}px ${EMOJI_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillText(charClass.emoji, portraitCenterX, portraitCenterY - portraitBox.h * 0.015);
  ctx.restore();

  // Chip PWR di sudut potret.
  const powerBox = relativeBox(els.cardFront.querySelector(".power-chip"));
  roundRectPath(ctx, powerBox.x, powerBox.y, powerBox.w, powerBox.h, W * 0.016);
  ctx.fillStyle = "rgba(4, 7, 16, 0.74)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.13)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.save();
  ctx.textBaseline = "middle";
  ctx.font = `500 ${Math.max(5, W * 0.018)}px ${MONO_STACK}`;
  ctx.fillStyle = "rgba(203, 218, 243, 0.52)";
  ctx.textAlign = "left";
  ctx.fillText("PWR", powerBox.x + powerBox.w * 0.11, powerBox.y + powerBox.h / 2 + 1);
  ctx.font = `700 ${Math.max(9, W * 0.034)}px ${MONO_STACK}`;
  ctx.fillStyle = rarity.color;
  ctx.shadowColor = rarity.color;
  ctx.shadowBlur = 8;
  ctx.textAlign = "right";
  ctx.fillText(String(card.power), powerBox.x + powerBox.w * 0.89, powerBox.y + powerBox.h / 2);
  ctx.restore();

  // Sudut bingkai potret.
  const cornerLength = Math.max(7, W * 0.032);
  const cornerInset = W * 0.024;
  ctx.save();
  ctx.strokeStyle = hexToRgba(rarity.color, 0.38);
  ctx.lineWidth = 1;
  const corners = [
    [portraitBox.x + cornerInset, portraitBox.y + cornerInset, 1, 1],
    [portraitBox.x + portraitBox.w - cornerInset, portraitBox.y + cornerInset, -1, 1],
    [portraitBox.x + cornerInset, portraitBox.y + portraitBox.h - cornerInset, 1, -1],
    [portraitBox.x + portraitBox.w - cornerInset, portraitBox.y + portraitBox.h - cornerInset, -1, -1]
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * cornerLength, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * cornerLength);
    ctx.stroke();
  });
  ctx.restore();

  ctx.restore(); // akhir clip potret

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
  ctx.lineWidth = 1;
  roundRectPath(ctx, portraitBox.x, portraitBox.y, portraitBox.w, portraitBox.h, portraitRadius);
  ctx.stroke();
  ctx.restore();

  // Nama dan metadata kelas.
  const nameBox = relativeBox(els.characterName);
  drawTextInBox(ctx, card.name, nameBox, els.characterName, { maxLines: 2 });

  const metaBox = relativeBox(els.cardFront.querySelector(".character-meta"));
  const metaStyle = getComputedStyle(els.cardFront.querySelector(".character-meta"));
  const metaFontSize = parseFloat(metaStyle.fontSize);
  const metaY = metaBox.y + metaBox.h / 2;
  ctx.save();
  ctx.font = `${metaFontSize}px ${EMOJI_STACK}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(charClass.emoji, metaBox.x, metaY);
  const emojiWidth = ctx.measureText(charClass.emoji).width;
  ctx.font = `500 ${metaFontSize}px ${MONO_STACK}`;
  ctx.fillStyle = "rgba(193, 210, 236, 0.86)";
  const metaText = `${charClass.name} · Tier ${rarity.tier}`.toUpperCase();
  ctx.fillText(metaText, metaBox.x + emojiWidth + W * 0.013, metaY);
  ctx.restore();

  // Lima bar statistik.
  const statRows = els.stats.querySelectorAll(".stat-row");
  statRows.forEach((row, index) => {
    const stat = card.stats[index];
    const labelEl = row.querySelector(".stat-label");
    const trackEl = row.querySelector(".stat-track");
    const valueEl = row.querySelector(".stat-value");
    const labelBox = relativeBox(labelEl);
    const trackBox = relativeBox(trackEl);
    const valueBox = relativeBox(valueEl);

    drawTextInBox(ctx, stat.label, labelBox, labelEl, { maxLines: 1 });

    roundRectPath(ctx, trackBox.x, trackBox.y, trackBox.w, trackBox.h, trackBox.h / 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();

    const fillWidth = Math.max(trackBox.h, (trackBox.w * stat.value) / 100);
    const fillGradient = ctx.createLinearGradient(trackBox.x, trackBox.y, trackBox.x + trackBox.w, trackBox.y);
    fillGradient.addColorStop(0, rarity.color2);
    fillGradient.addColorStop(1, rarity.color);
    ctx.save();
    ctx.shadowColor = rarity.glow;
    ctx.shadowBlur = 6;
    roundRectPath(ctx, trackBox.x, trackBox.y, fillWidth, trackBox.h, trackBox.h / 2);
    ctx.fillStyle = fillGradient;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.font = fontFrom(valueEl);
    ctx.fillStyle = getComputedStyle(valueEl).color;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(String(stat.value), valueBox.x + valueBox.w, valueBox.y + valueBox.h / 2);
    ctx.restore();
  });

  // Kotak skill.
  const skillBox = relativeBox(els.cardFront.querySelector(".skill-box"));
  roundRectPath(ctx, skillBox.x, skillBox.y, skillBox.w, skillBox.h, W * 0.026);
  const skillBg = ctx.createLinearGradient(skillBox.x, skillBox.y, skillBox.x + skillBox.w, skillBox.y + skillBox.h);
  skillBg.addColorStop(0, hexToRgba(rarity.color, 0.1));
  skillBg.addColorStop(0.45, "rgba(255, 255, 255, 0.028)");
  skillBg.addColorStop(1, "rgba(255, 255, 255, 0.018)");
  ctx.fillStyle = skillBg;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Garis aksen kiri kotak skill.
  const accentGradient = ctx.createLinearGradient(skillBox.x, skillBox.y, skillBox.x, skillBox.y + skillBox.h);
  accentGradient.addColorStop(0, hexToRgba(rarity.color, 0));
  accentGradient.addColorStop(0.5, hexToRgba(rarity.color, 0.9));
  accentGradient.addColorStop(1, hexToRgba(rarity.color, 0));
  ctx.fillStyle = accentGradient;
  ctx.fillRect(skillBox.x, skillBox.y + skillBox.h * 0.18, 1.2, skillBox.h * 0.64);

  const eyebrowEl = els.cardFront.querySelector(".skill-eyebrow");
  drawTextInBox(ctx, "✦ SKILL SPESIAL", relativeBox(eyebrowEl), eyebrowEl, { maxLines: 1 });

  const tagEl = els.skillTag;
  const tagBox = relativeBox(tagEl);
  const tagStyle = getComputedStyle(tagEl);
  roundRectPath(ctx, tagBox.x, tagBox.y, tagBox.w, tagBox.h, tagBox.h / 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.stroke();
  ctx.save();
  ctx.font = `${tagStyle.fontWeight} ${tagStyle.fontSize} ${tagStyle.fontFamily}`;
  ctx.fillStyle = tagStyle.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(card.rarity.tag.toUpperCase(), tagBox.x + tagBox.w / 2, tagBox.y + tagBox.h / 2 + 0.3);
  ctx.restore();

  drawTextInBox(ctx, card.skill.name, relativeBox(els.skillName), els.skillName, { maxLines: 2 });
  drawTextInBox(ctx, card.skill.desc, relativeBox(els.skillDesc), els.skillDesc, { maxLines: 2 });

  // Footer kartu.
  const footerBox = relativeBox(els.cardFront.querySelector(".card-footer"));
  const footerStyle = getComputedStyle(els.cardFront.querySelector(".card-footer"));
  const footerLineY = footerBox.y - W * 0.016;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(footerBox.x, footerLineY);
  ctx.lineTo(footerBox.x + footerBox.w, footerLineY);
  ctx.stroke();

  ctx.font = fontFrom(els.cardFront.querySelector(".card-footer span:first-child"));
  ctx.fillStyle = hexToRgba(rarity.color, 0.66);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("NEON CARD LAB", footerBox.x, footerBox.y + footerBox.h / 2 + 0.5);

  const seedEl = els.seedLabel;
  const seedStyle = getComputedStyle(seedEl);
  const seedBox = relativeBox(seedEl);
  ctx.font = `${seedStyle.fontWeight} ${seedStyle.fontSize} ${seedStyle.fontFamily}`;
  ctx.fillStyle = seedStyle.color;
  ctx.textAlign = "right";
  ctx.fillText(`SEED · ${card.seed}`, seedBox.x + seedBox.w, seedBox.y + seedBox.h / 2 + 0.5);
  ctx.restore();

  // Kilau holografik tipis di atas konten.
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const holo = ctx.createLinearGradient(0, 0, W, H);
  holo.addColorStop(0, "rgba(255, 255, 255, 0.03)");
  holo.addColorStop(0.34, hexToRgba(rarity.color, 0.055));
  holo.addColorStop(0.55, "rgba(255, 255, 255, 0.012)");
  holo.addColorStop(0.76, hexToRgba(charClass.color, 0.045));
  holo.addColorStop(1, "rgba(255, 255, 255, 0.02)");
  ctx.fillStyle = holo;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Aksen bintang untuk Epic & Legendary.
  if (rarity.id === "epic" || rarity.id === "legendary") {
    const starAlpha = rarity.id === "legendary" ? 0.55 : 0.3;
    drawSparkle(ctx, W * 0.1, H * 0.12, Math.max(3, W * 0.013), rarity.color, starAlpha);
    drawSparkle(ctx, W * 0.91, H * 0.24, Math.max(2, W * 0.009), rarity.color, starAlpha * 0.8);
    drawSparkle(ctx, W * 0.07, H * 0.77, Math.max(2, W * 0.008), rarity.color, starAlpha * 0.7);
    if (rarity.id === "legendary") {
      drawSparkle(ctx, W * 0.93, H * 0.84, Math.max(3, W * 0.012), rarity.color, starAlpha * 0.85);
      drawSparkle(ctx, W * 0.5, H * 0.065, Math.max(2, W * 0.007), "#ffffff", 0.36);
    }
  }

  // Bingkai dalam dan garis luar.
  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
  ctx.lineWidth = 1;
  roundRectPath(ctx, 6, 6, W - 12, H - 12, Math.max(8, radius - 6));
  ctx.stroke();

  roundRectPath(ctx, 0.5, 0.5, W - 1, H - 1, radius);
  ctx.strokeStyle = hexToRgba(rarity.color, 0.58);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore(); // akhir clip kartu

  return canvas;
}

function slugifyName(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "karakter";
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== "function") {
      reject(new Error("Browser tidak mendukung ekspor PNG."));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Kanvas PNG kosong."));
    }, "image/png");
  });
}

async function downloadCard() {
  if (!currentCard) return;
  if (els.downloadBtn.classList.contains("is-busy")) return;

  els.downloadBtn.classList.add("is-busy");
  els.downloadBtn.disabled = true;
  els.downloadLabel.textContent = "Menyiapkan…";
  els.status.classList.remove("is-success");
  els.status.textContent = "Menggambar kartu ke kanvas...";

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready.catch(() => {});
    }
    await nextFrame();
    const canvas = drawCardCanvas(currentCard);
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kartu-${slugifyName(currentCard.name)}-${currentCard.rarity.id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);

    els.status.classList.add("is-success");
    els.status.textContent = "PNG berhasil dibuat. Cek folder unduhanmu.";
  } catch (error) {
    console.error(error);
    els.status.classList.remove("is-success");
    els.status.textContent = "Gagal membuat PNG. Coba lagi, ya.";
  } finally {
    els.downloadBtn.classList.remove("is-busy");
    els.downloadBtn.disabled = isGenerating;
    els.downloadLabel.textContent = "Unduh Kartu";
  }
}

els.downloadBtn.addEventListener("click", downloadCard);




