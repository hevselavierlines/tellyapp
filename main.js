/**
 * Created by Afaci on 22/05/2017.
 */

const { app, BrowserWindow, globalShortcut, ipcMain, clipboard } = require('electron');
const path = require('path');
const url = require('url');

const showDevTools = true;

let win;

function createWindow() {
  if (win == null) {
    win = new BrowserWindow({
      width: showDevTools ? 1000 : 400,
      height: 600,
      icon: path.join(__dirname, 'src', 'logos', 'orf1-128-round.png'),
      webPreferences: {
        nodeIntegration: true,
      },
    });

    if (process.platform === 'darwin') {
      app.dock.setIcon(path.join(__dirname, 'src', 'logos', 'orf1-128-round.png'));
    }

    win.loadURL(url.format({
      pathname: path.join(__dirname, 'public', 'index.html'),
      protocol: 'file:',
      slashes: true,
    }));

    if (showDevTools) {
      win.webContents.openDevTools();
    }

    win.on('closing', () => {
      win = null;
      app.quit();
    });
  }
}

app.on('ready', () => {
  console.log('ready!');
  createWindow();

  ipcMain.on('stationChange', (event, arg) => {
    if (process.platform === 'darwin') {
      app.dock.setIcon(path.join(__dirname, 'src', 'logos', `${arg}-128-round.png`));
    } else {
      win.setIcon(path.join(__dirname, 'src', 'logos', `${arg}-128-round.png`));
    }
  });

  ipcMain.on('songClick', (event, arg0, arg1) => {
    clipboard.writeText(`${arg0} ${arg1}`);
  });
});

app.on('window-all-closed', () => {
  //if (process.platform !== 'darwin') {
    app.quit();
  //}
});

app.on('activate', () => {
  createWindow();
});
