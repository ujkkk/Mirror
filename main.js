//DISPLAY=:0 xrandr --output HDMI-1 --rotate right
const { app, BrowserWindow } = require("electron");
const electron = require("electron");

function createWindow() {
    let options = {
        // width: 1200,
        // height: 1900,
        // width: 1080,
        // height: 1920,
        x: 0,
        y: 0,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        backgroundColor: "#000000"
    }
    options.fullscreen = true;
    options.autoHideMenuBar = true;
    const win = new BrowserWindow(options);

    // win.webContents.openDevTools();  
    win.loadFile("./init.html");
    // win.loadFile("test.html");
    
    let screenElectron = electron.screen;
    let mainScreen = screenElectron.getPrimaryDisplay();
    console.log(mainScreen);
    
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});