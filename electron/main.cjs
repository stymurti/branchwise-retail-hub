const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

// URL aplikasi online (versi terpublikasi). Jika offline / gagal, fallback ke build lokal.
const ONLINE_URL = "https://branchflow-suite.lovable.app";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#0f172a",
    title: "BranchFlow Suite",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Coba muat versi online (membutuhkan internet)
  mainWindow.loadURL(ONLINE_URL).catch(() => loadOffline());

  mainWindow.webContents.on("did-fail-load", (_e, code) => {
    console.warn("Online load failed (" + code + "), fallback ke offline build.");
    loadOffline();
  });

  // Buka link eksternal di browser default
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function loadOffline() {
  const indexPath = path.join(__dirname, "..", "dist", "index.html");
  mainWindow.loadFile(indexPath).catch((err) => {
    console.error("Offline build tidak tersedia:", err);
  });
}

const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: () => mainWindow?.reload(),
      },
      {
        label: "Mode Online",
        click: () => mainWindow?.loadURL(ONLINE_URL).catch(() => loadOffline()),
      },
      {
        label: "Mode Offline",
        click: () => loadOffline(),
      },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "togglefullscreen" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { role: "resetZoom" },
      { type: "separator" },
      { role: "toggleDevTools" },
    ],
  },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
