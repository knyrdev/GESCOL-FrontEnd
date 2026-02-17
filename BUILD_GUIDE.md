# GESCOL - Guía de Build con Electron

## 🚀 Scripts Disponibles

### Desarrollo

```bash
# Iniciar en modo desarrollo (Vite + Electron)
npm run dev

# Solo Vite (sin Electron)
npm start

# Solo Electron (requiere build previo)
npm run electron
```

### Build de Producción

```bash
# Build solo del código (Vite) - Genera carpeta build/
npm run build

# Build completo para la plataforma actual
npm run build-electron

# Build específico para Windows
npm run build-electron:win

# Build específico para Linux
npm run build-electron:linux

# Build para Windows y Linux
npm run build-electron:all

# Solo empaquetar sin distribución (útil para testing)
npm run pack

# Build de distribución (alias de build-electron)
npm run dist
```

## 📦 Formatos de Salida

### Windows
- **NSIS Installer** (`.exe`): Instalador completo con opciones de configuración
  - Arquitecturas: x64, ia32 (32-bit)
  - Permite elegir directorio de instalación
  - Crea accesos directos en escritorio y menú inicio
  
- **Portable** (`.exe`): Versión portable que no requiere instalación
  - Solo arquitectura x64
  - Ideal para USB o ejecución sin permisos de administrador

### Linux
- **AppImage** (`.AppImage`): Binario autónomo ejecutable
  - Arquitectura: x64
  - No requiere instalación, solo dar permisos de ejecución
  - Compatible con la mayoría de distribuciones

- **DEB** (`.deb`): Paquete para Debian/Ubuntu
  - Arquitectura: x64
  - Instalación con `dpkg` o gestor de paquetes
  - Incluye dependencias del sistema

### macOS (opcional)
- **DMG** (`.dmg`): Imagen de disco
- **ZIP** (`.zip`): Archivo comprimido

## 📁 Directorio de Salida

Todos los builds se generan en:
```
dist-electron/
├── GESCOL-1.0.0-win-x64.exe          # Instalador Windows 64-bit
├── GESCOL-1.0.0-win-ia32.exe         # Instalador Windows 32-bit
├── GESCOL-1.0.0-portable.exe         # Portable Windows
├── GESCOL-1.0.0.AppImage             # AppImage Linux
├── GESCOL-1.0.0-linux-x64.deb        # Paquete DEB Linux
└── latest.yml / latest-linux.yml     # Archivos de actualización
```

## ⚙️ Configuración

### Puertos
- **Vite dev server**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001` (configurable en `.env`)

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL de la API backend
VITE_API_URL=http://localhost:3001

# Nombre de la aplicación
VITE_APP_NAME=GESCOL

# Versión
VITE_APP_VERSION=1.0.0
```

## 🔧 Requisitos de Build

### Windows
- Node.js 18+
- npm 9+
- (Opcional) NSIS para customizar el instalador

### Linux
- Node.js 18+
- npm 9+
- Paquetes del sistema:
  ```bash
  sudo apt-get install -y \
    gconf2 \
    gconf-service \
    libnotify4 \
    libappindicator1 \
    libxtst6 \
    libnss3
  ```

### Cross-compilation

⚠️ **Nota importante sobre cross-compilation**:

- **En Windows**: Puedes hacer build para Windows y Linux
- **En Linux**: Puedes hacer build para Linux; para Windows necesitas Wine
- **En macOS**: Puedes hacer build para macOS, Linux y Windows

Para build de Windows desde Linux, instala:
```bash
sudo dpkg --add-architecture i386
sudo apt-get update
sudo apt-get install wine wine32 wine64
```

## 🐛 Troubleshooting

### Error: "Failed to load"
- Verifica que el puerto 5173 esté libre
- Asegúrate de que el build de Vite se completó sin errores

### Error: "Cannot find module electron"
```bash
npm install
```

### Build falla en Linux
- Verifica que tienes las dependencias del sistema instaladas
- Revisa permisos de ejecución

### Portable no inicia en Windows
- Verifica que .NET Framework 4.5+ esté instalado
- Ejecuta como administrador si es necesario

## 📝 Notas

### Detección automática de modo desarrollo
La aplicación ahora detecta automáticamente si está en modo desarrollo o producción usando `electron-is-dev`. No necesitas cambiar manualmente ningún flag.

### Configuración de build
La configuración de electron-builder está en `package.json` bajo la sección `"build"`. Puedes personalizar:
- Iconos de la aplicación
- Nombres de archivos de salida
- Opciones del instalador
- Compresión
- Y más...

### Actualizar versión
Para cambiar la versión de tu aplicación:
1. Edita `version` en `package.json`
2. Los archivos generados incluirán automáticamente la nueva versión

## 🎯 Flujo de Trabajo Recomendado

1. **Desarrollo**:
   ```bash
   npm run dev
   ```

2. **Testing de build**:
   ```bash
   npm run pack
   ```

3. **Build de producción**:
   ```bash
   # Para la plataforma actual
   npm run build-electron
   
   # O específicamente
   npm run build-electron:win   # Windows
   npm run build-electron:linux # Linux
   ```

4. **Distribución**:
   - Comparte los archivos de `dist-electron/`
   - Los instaladores están listos para distribución

## 🔐 Firma de Código (Code Signing)

Para builds de producción profesionales, considera firmar tu código:

### Windows
- Necesitas un certificado de firma de código (.pfx)
- Configura en `package.json`:
  ```json
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
  ```

### macOS
- Necesitas Apple Developer Account
- Configura Team ID y certificados

Por ahora, la firma está deshabilitada con `verifyUpdateCodeSignature: false`.

## 📚 Recursos

- [Electron Builder Docs](https://www.electron.build/)
- [Vite Docs](https://vitejs.dev/)
- [Electron Docs](https://www.electronjs.org/docs)
