# 🔧 Instrucciones para Rebuild después del Fix

## ❌ Problema Encontrado

Al ejecutar el build empaquetado de Electron, obtuviste el error:
```
Error: Cannot find module 'electron-is-dev'
```

## ✅ Solución Aplicada

Se ha modificado `main.js` para usar **detección nativa de Electron** en lugar de la dependencia `electron-is-dev`:

```javascript
// ❌ Antes (causaba error en build)
const isDev = require('electron-is-dev');

// ✅ Ahora (funciona en build empaquetado)
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
```

La propiedad `app.isPackaged` es nativa de Electron y funciona perfectamente en builds empaquetados.

---

## 🚀 Pasos para Rebuildar

### Opción 1: Uso del Script Automatizado (Recomendado)

Desde tu terminal WSL en la raíz del proyecto:

```bash
# Dar permisos al script
chmod +x rebuild.sh

# Ejecutar
./rebuild.sh
```

### Opción 2: Ejecutar Comandos Manualmente

```bash
# 1. Limpiar builds anteriores
rm -rf dist-electron build

# 2. Build del código frontend (Vite)
npm run build

# 3. Build de Electron para Windows
npm run build-electron:win
```

---

## 📦 Resultado Esperado

Después del build exitoso, deberías ver en `dist-electron/`:

```
dist-electron/
├── GESCOL Setup 1.0.0.exe   # Instalador NSIS Windows
├── GESCOL 1.0.0.exe         # Versión portable Windows
├── win-unpacked/            # Versión desempaquetada (para testing)
│   └── GESCOL.exe
├── latest.yml               # Archivo de actualización
└── builder-*.yml            # Archivos de configuración
```

---

## 🧪 Testing del Build

### Desde Windows (Recomendado)

1. **Opción A - PowerShell:**
   ```powershell
   cd \\wsl.localhost\Ubuntu\home\knyr\Projects\GESCOL-FrontEnd\dist-electron
   .\GESCOL*.exe
   ```

2. **Opción B - Explorador de Windows:**
   - Abre el Explorador de Windows
   - Navega a: `\\wsl.localhost\Ubuntu\home\knyr\Projects\GESCOL-FrontEnd\dist-electron`
   - Ejecuta cualquiera de los `.exe`

### Verificaciones

✅ La aplicación debe iniciar sin errores
✅ No debe aparecer el error "Cannot find module 'electron-is-dev'"
✅ La ventana debe ser 1400x900
✅ Debe cargar correctamente desde `build/index.html`

---

## 🔍 Troubleshooting

### Si el error persiste:

1. **Asegúrate de limpiar completamente:**
   ```bash
   rm -rf dist-electron build node_modules/.cache
   ```

2. **Rebuild:**
   ```bash
   npm run build
   npm run build-electron:win
   ```

### Si quieres verificar el código antes de rebuildar:

```bash
# Ver el cambio en main.js
cat main.js | head -10
```

Deberías ver:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Detectar si estamos en modo desarrollo
// app.isPackaged es false en desarrollo y true en producción
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
```

---

## 📝 Notas Importantes

### ¿Por qué falló electron-is-dev?

El paquete `electron-is-dev` a veces tiene problemas cuando se empaqueta con `electron-builder` porque:
- Depende de verificar rutas del filesystem
- Puede no estar incluido correctamente en el bundle ASAR
- La detección puede fallar en ciertos escenarios de empaquetado

### ¿Por qué app.isPackaged es mejor?

- ✅ Es una API **nativa** de Electron (no requiere dependencias)
- ✅ Funciona **siempre** en builds empaquetados
- ✅ Más **rápido** (no necesita verificar filesystem)
- ✅ Más **confiable** y mantenible

---

## ✨ Próximos Pasos

Una vez que el build funcione correctamente:

1. **Testear la aplicación** completamente
2. **Verificar** que todos los módulos carguen correctamente
3. **Continuar** con las mejoras de UI/UX que planeabas

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema adicional:
- Copia el error completo
- Verifica los logs de build
- Comparte el output de `npm run build`

---

*Fix aplicado el: 2026-02-12*
*Causa: electron-is-dev no se empaqueta correctamente*
*Solución: Usar app.isPackaged (API nativa de Electron)*
