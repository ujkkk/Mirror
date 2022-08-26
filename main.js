//DISPLAY=:0 xrandr --output HDMI-1 --rotate right
const { app, BrowserWindow } = require("electron");

function createWindow() {
    let options = {
        // width: 1200,
        // height: 1900,
        width: 270*2,
        height: 480*2,
        x: 0,
        y: 0,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        backgroundColor: "#000000"
    }
    // options.fullscreen = true;
    options.autoHideMenuBar = true;
    const win = new BrowserWindow(options);

    //win.webContents.openDevTools();  
    // win.loadFile("index.html");
    win.loadFile("new_index.html");
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});