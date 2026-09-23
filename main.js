const { app, BrowserWindow } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 900,
        minHeight: 600,
        title: "Ban Simulator 2000",

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.setMenuBarVisibility(false);

    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, "dist", "index.html"));
    } else {
        win.loadURL("http://localhost:5173");
    }
}

app.whenReady().then(() => {
    createWindow();

    // Check for updates only in the packaged app.
    if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify();
    }

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
