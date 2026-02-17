const { app, BrowserWindow } = require('electron');
const path = require('path');

// Detectar si estamos en modo desarrollo
// app.isPackaged es false en desarrollo y true en producción
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';

function createWindow() {
  // Crea la ventana del navegador.
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'), // Comentado porque preload.js no existe
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
    // Configuración de la ventana
    backgroundColor: '#ffffff',
    show: false, // No mostrar hasta que esté listo
    icon: path.join(__dirname, 'public/favicon.ico'),
  });

  // Mostrar ventana cuando esté lista para evitar flash
  win.once('ready-to-show', () => {
    win.show();
  });

  // Carga la URL de tu aplicación de Vite.
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, 'build/index.html')}`;

  win.loadURL(startUrl);

  // Abre las herramientas de desarrollo si está en modo de desarrollo.
  if (isDev) {
    win.webContents.openDevTools();
  }

  // Manejo de errores de carga
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
  });
}

// Este método se llamará cuando Electron haya terminado de inicializarse
// y esté listo para crear ventanas de navegador.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS, es común recrear una ventana en la aplicación cuando el
    // icono del dock es clicado y no hay otras ventanas abiertas.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
