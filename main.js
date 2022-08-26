

const { app, BrowserWindow } = require("electron");

function createWindow() {
    let options = {
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    },
    backgroundColor:"#000000"
    }
   // options.fullscreen = true;
    options.autoHideMenuBar = true;
    const win = new BrowserWindow(options);
    
    //win.webContents.openDevTools();  
    //win.loadFile("addFriend/list.html");
    win.loadFile("index.html");
    //win.loadFile("keyboard/keyboard-kr.html");
    // win.loadFile("message_module/messegeSend/testMain.html");
   //win.loadFile("message_module/message.html");
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});