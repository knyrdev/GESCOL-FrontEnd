const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');

// Registrar el esquema 'app' como privilegiado ANTES de que la app est lista
// Esto es CRUCIAL para que localStorage, cookies y fetch funcionen
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      allowServiceWorkers: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

// Detectar si estamos en modo desarrollo
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';

// Esquema de protocolo personalizado para produccin
function registerAppProtocol() {
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.replace(/^app:\/\/./, '');
    const filePath = path.join(__dirname, 'build', url);
    callback({ path: path.normalize(filePath) });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false,
      webSecurity: true
    },
    backgroundColor: '#ffffff',
    show: false,
    icon: path.join(__dirname, isDev ? 'public/favicon.ico' : 'build/favicon.ico'),
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // Usamos el protocolo 'app://' en produccin
    win.loadURL('app://./index.html');
  }

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
    if (!isDev && validatedURL.startsWith('app://')) {
      win.loadFile(path.join(__dirname, 'build/index.html'));
    }
  });
}

app.whenReady().then(() => {
  if (!isDev) {
    registerAppProtocol();
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
