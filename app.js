const STORAGE_KEY = "wf_presets_v1";
const BUILD = "Step 5 build: STEP5-1 👀";

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

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("buildTag").textContent = BUILD;

  const presetName = document.getElementById("presetName");
  const presetType = document.getElementById("presetType");
  const createBtn = document.getElementById("createBtn");
  const presetList = document.getElementById("presetList");
  const wipeBtn = document.getElementById("wipeBtn");
  const statusEl = document.getElementById("status");

  const homeScreen = document.getElementById("homeScreen");
  const editorScreen = document.getElementById("editorScreen");
  const editorTitle = document.getElementById("editorTitle");
  const backBtn = document.getElementById("backBtn");
  const saveContentBtn = document.getElementById("saveContentBtn");
  const editorStatus = document.getElementById("editorStatus");

  const previewBox = document.getElementById("previewBox");

  const dashboardFields = document.getElementById("dashboardFields");
  const photoFields = document.getElementById("photoFields");

  const contentInput = document.getElementById("contentInput");

  const s1Label = document.getElementById("s1Label");
  const s1Value = document.getElementById("s1Value");
  const s1Unit = document.getElementById("s1Unit");

  const s2Label = document.getElementById("s2Label");
  const s2Value = document.getElementById("s2Value");
  const s2Unit = document.getElementById("s2Unit");

  const s3Label = document.getElementById("s3Label");
  const s3Value = document.getElementById("s3Value");
  const s3Unit = document.getElementById("s3Unit");

  const choosePhotoBtn = document.getElementById("choosePhotoBtn");
  const photoInput = document.getElementById("photoInput");
  const photoPreview = document.getElementById("photoPreview");
  const photoCaptionInput = document.getElementById("photoCaptionInput");

  let activePresetId = null;
  let tempImage = null;

  function renderPreviewDashboard() {
    previewBox.innerHTML = `
      <div style="font-size:16px; margin-bottom:10px">${contentInput.value || "Your quote here…"}</div>
      <div style="display:flex; gap:10px; font-size:13px">
        <div><strong>${s1Value.value || "—"}</strong> ${s1Unit.value}<br>${s1Label.value}</div>
        <div><strong>${s2Value.value || "—"}</strong> ${s2Unit.value}<br>${s2Label.value}</div>
        <div><strong>${s3Value.value || "—"}</strong> ${s3Unit.value}<br>${s3Label.value}</div>
      </div>
    `;
  }

  function renderPreviewPhoto() {
    previewBox.innerHTML = `
      ${tempImage ? `<img src="${tempImage}" style="width:100%;border-radius:12px;margin-bottom:8px"/>` : ""}
      <div style="font-size:14px">${photoCaptionInput.value || "Your caption here…"}</div>
    `;
  }

  function renderPreview(type) {
    if (type === "dashboard") renderPreviewDashboard();
    else renderPreviewPhoto();
  }

  function render() {
    presetList.innerHTML = "";
    loadPresets().forEach(p => {
      const row = document.createElement("div");
      row.className = "row";
      row.textContent = p.name;
      row.onclick = () => openEditor(p.id);
      presetList.appendChild(row);
    });
  }

  function openEditor(id) {
    const preset = loadPresets().find(p => p.id === id);
    if (!preset) return;

    activePresetId = id;
    homeScreen.style.display = "none";
    editorScreen.style.display = "block";

    if (preset.type === "dashboard") {
      editorTitle.textContent = "Edit Dashboard";
      dashboardFields.style.display = "block";
      photoFields.style.display = "none";

      contentInput.value = preset.data.quote || "";

      renderPreview("dashboard");
    } else {
      editorTitle.textContent = "Edit Photo Tile";
      dashboardFields.style.display = "none";
      photoFields.style.display = "block";

      photoCaptionInput.value = preset.data.caption || "";
      tempImage = preset.data.image || null;
      if (tempImage) photoPreview.src = tempImage;

      renderPreview("photo");
    }
  }

  [contentInput, s1Label, s1Value, s1Unit, s2Label, s2Value, s2Unit, s3Label, s3Value, s3Unit]
    .forEach(el => el && el.addEventListener("input", () => renderPreview("dashboard")));

  photoCaptionInput.addEventListener("input", () => renderPreview("photo"));

  choosePhotoBtn.onclick = () => photoInput.click();

  photoInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      tempImage = reader.result;
      photoPreview.src = tempImage;
      photoPreview.style.display = "block";
      renderPreview("photo");
    };
    reader.readAsDataURL(file);
  };

  saveContentBtn.onclick = () => {
    const presets = loadPresets();
    const preset = presets.find(p => p.id === activePresetId);
    if (!preset) return;

    if (preset.type === "dashboard") {
      preset.data.quote = contentInput.value;
    } else {
      preset.data.caption = photoCaptionInput.value;
      preset.data.image = tempImage;
    }

    savePresets(presets);
    editorStatus.textContent = "Saved ✅";
    setTimeout(() => editorStatus.textContent = "", 1200);
  };

  backBtn.onclick = () => {
    editorScreen.style.display = "none";
    homeScreen.style.display = "block";
    render();
  };

  createBtn.onclick = () => {
    if (!presetName.value) return;

    const presets = loadPresets();
    presets.unshift({
      id: uid(),
      name: presetName.value,
      type: presetType.value,
      data: presetType.value === "dashboard"
        ? { quote: "", stats: [] }
        : { caption: "", image: null }
    });

    savePresets(presets);
    presetName.value = "";
    render();
  };

  wipeBtn.onclick = () => {
    if (confirm("Delete all?")) {
      localStorage.removeItem(STORAGE_KEY);
      render();
    }
  };

  render();
});