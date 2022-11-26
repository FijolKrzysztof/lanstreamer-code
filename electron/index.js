const electron = require('electron');
const path = require('path');
const os = require('os');
const open = require('open');
require('electron-reload')(__dirname);

const{ app, BrowserWindow, ipcMain } = electron;

const height = os.platform() === 'win32' ? 310 : 280;

ipcMain.on('port', (event, port) => {
    global.port = port;
})

ipcMain.on('password', (event, password) => {
    global.password = password;
})

ipcMain.on('open', () => {
    require('./Server/index');
})

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        show: false,
        width: 500,
        height: height,
        autoHideMenuBar: true,
        resizable: false,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // mainWindow.webContents.openDevTools();
    mainWindow.loadFile(path.join(__dirname, 'Electron.html'));
    mainWindow.webContents.once('did-finish-load', function (){
        mainWindow.show();
    });
})

if(require('electron-squirrel-startup')){
    app.quit();
}

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0){
        createWindow();
    }
});
