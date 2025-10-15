const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1700,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
    autoHideMenuBar: true, // Hide menu bar
  });

  // Remove menu bar completely
  Menu.setApplicationMenu(null);

  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    win.loadFile(path.join(__dirname, "../out/index.html"));
  }
};

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
