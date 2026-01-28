alert("app.js loaded");
const STORAGE_KEY = "wf_presets_v1";

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

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("DOMContentLoaded", () => {
  const presetName = document.getElementById("presetName");
  const presetType = document.getElementById("presetType");
  const createBtn = document.getElementById("createBtn");
  const presetList = document.getElementById("presetList");
  const wipeBtn = document.getElementById("wipeBtn");
  const statusEl = document.getElementById("status");

  const homeScreen = document.getElementById("homeScreen");
  const editorScreen = document.getElementById("editorScreen");
  const editorTitle = document.getElementById("editorTitle");
  const contentInput = document.getElementById("contentInput");
  const saveContentBtn = document.getElementById("saveContentBtn");
  const editorStatus = document.getElementById("editorStatus");
  const backBtn = document.getElementById("backBtn");

  let activePresetId = null;

  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    setTimeout(() => {
      if (statusEl.textContent === msg) statusEl.textContent = "";
    }, 1800);
  }

  function setEditorStatus(msg) {
    if (!editorStatus) return;
    editorStatus.textContent = msg;
    setTimeout(() => {
      if (editorStatus.textContent === msg) editorStatus.textContent = "";
    }, 1400);
  }

  function openEditor(id) {
    const presets = loadPresets();
    const preset = presets.find(p => p.id === id);
    if (!preset) return;

    // If editor UI isn't present, don't crash
    if (!homeScreen || !editorScreen || !editorTitle || !contentInput) {
      alert("Editor screen is missing in index.html. We’ll fix that next.");
      return;
    }

    activePresetId = id;
    homeScreen.style.display = "none";
    editorScreen.style.display = "block";

    editorTitle.textContent =
      preset.type === "dashboard" ? "Edit Dashboard Quote" : "Edit Photo Caption";

    contentInput.value =
      preset.type === "dashboard"
        ? (preset.data.quote || "")
        : (preset.data.caption || "");
  }

  function render() {
    if (!presetList) return;

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
        <div class="rowTop" data-edit="${p.id}" style="cursor:pointer">
          <div>
            <div style="font-weight:700">${escapeHtml(p.name)}</div>
            <div class="badge">${p.type === "dashboard" ? "Dashboard" : "Photo Tile"}</div>
          </div>
          <button class="smallBtn" data-del="${p.id}" type="button">Delete</button>
        </div>
        <div style="color:#a8a8b3;font-size:13px">ID: ${p.id}</div>
      `;

      presetList.appendChild(row);
    }

    // Delete
    presetList.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-del");
        const next = loadPresets().filter(x => x.id !== id);
        savePresets(next);
        render();
        setStatus("Deleted ✅");
      });
    });

    // Edit
    presetList.querySelectorAll("[data-edit]").forEach(el => {
      el.addEventListener("click", () => openEditor(el.getAttribute("data-edit")));
    });
  }

  // Create preset
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      const name = (presetName?.value || "").trim();
      const type = presetType?.value || "dashboard";

      if (!name) {
        setStatus("Type a name first 🙂");
        presetName?.focus?.();
        return;
      }

      const presets = loadPresets();
      const preset = {
        id: uid(),
        name,
        type,
        createdAt: Date.now(),
        data: type === "dashboard"
          ? { quote: "", stats: [] }
          : { caption: "", imageRef: null }
      };

      presets.unshift(preset);
      savePresets(presets);
      if (presetName) presetName.value = "";
      render();
      setStatus("Saved ✅");
    });
  }

  // Wipe
  if (wipeBtn) {
    wipeBtn.addEventListener("click", () => {
      const ok = confirm("Delete ALL presets? This cannot be undone.");
      if (!ok) return;
      localStorage.removeItem(STORAGE_KEY);
      render();
      setStatus("All cleared 🧼");
    });
  }

  // Save content (only if editor elements exist)
  if (saveContentBtn) {
    saveContentBtn.addEventListener("click", () => {
      const presets = loadPresets();
      const preset = presets.find(p => p.id === activePresetId);
      if (!preset) return;

      const text = (contentInput?.value || "").trim();

      if (preset.type === "dashboard") preset.data.quote = text;
      else preset.data.caption = text;

      savePresets(presets);
      setEditorStatus("Saved ✅");
    });
  }

  // Back (only if editor elements exist)
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (editorScreen) editorScreen.style.display = "none";
      if (homeScreen) homeScreen.style.display = "block";
      activePresetId = null;
      render();
    });
  }

  render();
});