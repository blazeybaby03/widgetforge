const STORAGE_KEY = "wf_presets_v1";
const BUILD = "Step 3 build: STEP3-1 ✅";

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
  // Build tag (permanent)
  const buildTag = document.getElementById("buildTag");
  if (buildTag) buildTag.textContent = BUILD;

  // HOME
  const presetName = document.getElementById("presetName");
  const presetType = document.getElementById("presetType");
  const createBtn = document.getElementById("createBtn");
  const presetList = document.getElementById("presetList");
  const wipeBtn = document.getElementById("wipeBtn");
  const statusEl = document.getElementById("status");

  // SCREENS
  const homeScreen = document.getElementById("homeScreen");
  const editorScreen = document.getElementById("editorScreen");

  // EDITOR COMMON
  const editorTitle = document.getElementById("editorTitle");
  const saveContentBtn = document.getElementById("saveContentBtn");
  const editorStatus = document.getElementById("editorStatus");
  const backBtn = document.getElementById("backBtn");

  // STEP 3 FIELDS
  const dashboardFields = document.getElementById("dashboardFields");
  const photoFields = document.getElementById("photoFields");

  const contentInput = document.getElementById("contentInput"); // dashboard quote
  const photoCaptionInput = document.getElementById("photoCaptionInput"); // photo caption

  const s1Label = document.getElementById("s1Label");
  const s1Value = document.getElementById("s1Value");
  const s1Unit = document.getElementById("s1Unit");

  const s2Label = document.getElementById("s2Label");
  const s2Value = document.getElementById("s2Value");
  const s2Unit = document.getElementById("s2Unit");

  const s3Label = document.getElementById("s3Label");
  const s3Value = document.getElementById("s3Value");
  const s3Unit = document.getElementById("s3Unit");

  let activePresetId = null;

  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    setTimeout(() => {
      if (statusEl.textContent === msg) statusEl.textContent = "";
    }, 1600);
  }

  function setEditorStatus(msg) {
    if (!editorStatus) return;
    editorStatus.textContent = msg;
    setTimeout(() => {
      if (editorStatus.textContent === msg) editorStatus.textContent = "";
    }, 1400);
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

    presetList.querySelectorAll("[data-edit]").forEach(el => {
      el.addEventListener("click", () => openEditor(el.getAttribute("data-edit")));
    });
  }

  function openEditor(id) {
    const presets = loadPresets();
    const preset = presets.find(p => p.id === id);
    if (!preset) return;

    activePresetId = id;

    if (homeScreen) homeScreen.style.display = "none";
    if (editorScreen) editorScreen.style.display = "block";

    if (preset.type === "dashboard") {
      if (editorTitle) editorTitle.textContent = "Edit Dashboard";
      if (dashboardFields) dashboardFields.style.display = "block";
      if (photoFields) photoFields.style.display = "none";

      if (contentInput) contentInput.value = preset.data?.quote || "";

      const stats = Array.isArray(preset.data?.stats) && preset.data.stats.length
        ? preset.data.stats
        : [{}, {}, {}];

      if (s1Label) s1Label.value = stats[0]?.label || "";
      if (s1Value) s1Value.value = stats[0]?.value || "";
      if (s1Unit)  s1Unit.value  = stats[0]?.unit  || "";

      if (s2Label) s2Label.value = stats[1]?.label || "";
      if (s2Value) s2Value.value = stats[1]?.value || "";
      if (s2Unit)  s2Unit.value  = stats[1]?.unit  || "";

      if (s3Label) s3Label.value = stats[2]?.label || "";
      if (s3Value) s3Value.value = stats[2]?.value || "";
      if (s3Unit)  s3Unit.value  = stats[2]?.unit  || "";
    } else {
      if (editorTitle) editorTitle.textContent = "Edit Photo Tile";
      if (dashboardFields) dashboardFields.style.display = "none";
      if (photoFields) photoFields.style.display = "block";
      if (photoCaptionInput) photoCaptionInput.value = preset.data?.caption || "";
    }
  }

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
          ? {
              quote: "",
              stats: [
                { label: "", value: "", unit: "" },
                { label: "", value: "", unit: "" },
                { label: "", value: "", unit: "" }
              ]
            }
          : { caption: "", imageRef: null }
      };

      presets.unshift(preset);
      savePresets(presets);

      if (presetName) presetName.value = "";
      render();
      setStatus("Saved ✅");
    });
  }

  if (saveContentBtn) {
    saveContentBtn.addEventListener("click", () => {
      const presets = loadPresets();
      const preset = presets.find(p => p.id === activePresetId);
      if (!preset) return;

      if (preset.type === "dashboard") {
        preset.data.quote = (contentInput?.value || "").trim();
        preset.data.stats = [
          { label: (s1Label?.value || "").trim(), value: (s1Value?.value || "").trim(), unit: (s1Unit?.value || "").trim() },
          { label: (s2Label?.value || "").trim(), value: (s2Value?.value || "").trim(), unit: (s2Unit?.value || "").trim() },
          { label: (s3Label?.value || "").trim(), value: (s3Value?.value || "").trim(), unit: (s3Unit?.value || "").trim() }
        ];
      } else {
        preset.data.caption = (photoCaptionInput?.value || "").trim();
      }

      savePresets(presets);
      setEditorStatus("Saved ✅");
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (editorScreen) editorScreen.style.display = "none";
      if (homeScreen) homeScreen.style.display = "block";
      activePresetId = null;
      render();
    });
  }

  if (wipeBtn) {
    wipeBtn.addEventListener("click", () => {
      const ok = confirm("Delete ALL presets? This cannot be undone.");
      if (!ok) return;
      localStorage.removeItem(STORAGE_KEY);
      render();
      setStatus("All cleared 🧼");
    });
  }

  render();
});