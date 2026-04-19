const { app, BrowserWindow, shell } = require('electron')
const http = require('http')
const fs = require('fs')
const path = require('path')

// Required when running as root (e.g. in containers / CI)
if (process.getuid && process.getuid() === 0) {
  app.commandLine.appendSwitch('no-sandbox')
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.jsx':  'application/javascript; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
}

function startServer(appDir) {
  const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0]
    const file = urlPath === '/' ? '/index.html' : urlPath
    fs.readFile(path.join(appDir, file), (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return }
      const ext = path.extname(file)
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' })
      res.end(data)
    })
  })
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port))
  })
}

async function createWindow() {
  const appDir = app.isPackaged
    ? path.dirname(process.execPath)  // next to the .exe
    : __dirname

  const port = await startServer(appDir)

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

  win.setMenuBarVisibility(false)
  win.loadURL(`http://127.0.0.1:${port}/`)

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
