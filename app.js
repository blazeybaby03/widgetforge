const STORAGE_KEY = "wf_presets_v1";

const presetName = document.getElementById("presetName");
const presetType = document.getElementById("presetType");
const createBtn = document.getElementById("createBtn");
const presetList = document.getElementById("presetList");
const wipeBtn = document.getElementById("wipeBtn");
const statusEl = document.getElementById("status");

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function loadPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresets(presets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

function setStatus(msg) {
  statusEl.textContent = msg;
  setTimeout(() => {
    if (statusEl.textContent === msg) statusEl.textContent = "";
  }, 1800);
}

function render() {
  const presets = loadPresets();
  presetList.innerHTML = "";

  if (presets.length === 0) {
    presetList.innerHTML = `<p class="status">No presets yet. Make your first one ☝️</p>`;
    return;
  }

  for (const p of presets) {
    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <div class="rowTop">
        <div>
          <div style="font-weight:700">${escapeHtml(p.name)}</div>
          <div class="badge">${p.type === "dashboard" ? "Dashboard" : "Photo Tile"}</div>
        </div>
        <button class="smallBtn" data-del="${p.id}">Delete</button>
      </div>
      <div style="color:#a8a8b3;font-size:13px">ID: ${p.id}</div>
    `;

    presetList.appendChild(row);
  }

  presetList.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      const next = loadPresets().filter(x => x.id !== id);
      savePresets(next);
      render();
      setStatus("Deleted ✅");
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

createBtn.addEventListener("click", () => {
  const name = presetName.value.trim();
  const type = presetType.value;

  if (!name) {
    setStatus("Type a name first 🙂");
    presetName.focus();
    return;
  }

  const presets = loadPresets();

  const preset = {
    id: uid(),
    name,
    type,
    createdAt: Date.now(),
    // placeholder data for later steps:
    data: type === "dashboard"
      ? { quote: "", stats: [] }
      : { caption: "", imageRef: null }
  };

  presets.unshift(preset);
  savePresets(presets);
  presetName.value = "";
  render();
  setStatus("Saved ✅");
});

wipeBtn.addEventListener("click", () => {
  const ok = confirm("Delete ALL presets? This cannot be undone.");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
  setStatus("All cleared 🧼");
});

render();