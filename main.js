const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

// Required when running as root (e.g. in containers / CI)
if (process.getuid && process.getuid() === 0) {
  app.commandLine.appendSwitch('no-sandbox')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: 'Marginalia — Sermon Notes',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Hide the default menu bar (File/Edit/View/etc.)
  win.setMenuBarVisibility(false)

  win.loadFile('index.html')

  // Open external links (YouTube, etc.) in the system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => app.quit())

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
