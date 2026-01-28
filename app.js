const STORAGE_KEY = "wf_presets_v1";
const BUILD = "Step 4 build: STEP4-1 📸";

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

  const dashboardFields = document.getElementById("dashboardFields");
  const photoFields = document.getElementById("photoFields");

  const contentInput = document.getElementById("contentInput");
  const photoInput = document.getElementById("photoInput");
  const photoPreview = document.getElementById("photoPreview");
  const photoCaptionInput = document.getElementById("photoCaptionInput");

  let activePresetId = null;
  let tempImageData = null;

  function setStatus(msg) {
    statusEl.textContent = msg;
    setTimeout(() => statusEl.textContent = "", 1500);
  }

  function render() {
    const presets = loadPresets();
    presetList.innerHTML = "";

    presets.forEach(p => {
      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `
        <div class="rowTop" data-id="${p.id}" style="cursor:pointer">
          <strong>${p.name}</strong>
          <span class="badge">${p.type}</span>
        </div>
      `;
      div.onclick = () => openEditor(p.id);
      presetList.appendChild(div);
    });
  }

  function openEditor(id) {
    const preset = loadPresets().find(p => p.id === id);
    if (!preset) return;

    activePresetId = id;
    homeScreen.style.display = "none";
    editorScreen.style.display = "block";

    if (preset.type === "photoTile") {
      editorTitle.textContent = "Edit Photo Tile";
      dashboardFields.style.display = "none";
      photoFields.style.display = "block";

      photoCaptionInput.value = preset.data.caption || "";
      if (preset.data.image) {
        photoPreview.src = preset.data.image;
        photoPreview.style.display = "block";
      }
    } else {
      editorTitle.textContent = "Edit Dashboard";
      photoFields.style.display = "none";
      dashboardFields.style.display = "block";
      contentInput.value = preset.data.quote || "";
    }
  }

  photoInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      tempImageData = reader.result;
      photoPreview.src = tempImageData;
      photoPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  };

  saveContentBtn.onclick = () => {
    const presets = loadPresets();
    const preset = presets.find(p => p.id === activePresetId);
    if (!preset) return;

    if (preset.type === "photoTile") {
      preset.data.caption = photoCaptionInput.value || "";
      if (tempImageData) preset.data.image = tempImageData;
    } else {
      preset.data.quote = contentInput.value || "";
    }

    savePresets(presets);
    editorStatus.textContent = "Saved ✅";
    setTimeout(() => editorStatus.textContent = "", 1200);
  };

  backBtn.onclick = () => {
    editorScreen.style.display = "none";
    homeScreen.style.display = "block";
    tempImageData = null;
    render();
  };

  createBtn.onclick = () => {
    if (!presetName.value) return setStatus("Name required");

    const presets = loadPresets();
    presets.unshift({
      id: uid(),
      name: presetName.value,
      type: presetType.value,
      data: presetType.value === "photoTile"
        ? { caption: "", image: null }
        : { quote: "" }
    });

    savePresets(presets);
    presetName.value = "";
    render();
    setStatus("Saved");
  };

  wipeBtn.onclick = () => {
    if (confirm("Delete all?")) {
      localStorage.removeItem(STORAGE_KEY);
      render();
    }
  };

  render();
});