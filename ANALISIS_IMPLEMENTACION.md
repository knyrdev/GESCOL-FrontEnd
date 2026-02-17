# GESCOL FrontEnd - Análisis de Implementación

## 📋 Resumen Ejecutivo

**GESCOL** es un Sistema de Gestión Escolar desarrollado como aplicación de escritorio usando **React + Vite + Electron** con la plantilla **CoreUI**. La aplicación está diseñada para gestionar procesos académicos y administrativos de una institución educativa venezolana.

---

## 🏗️ Arquitectura General

### Stack Tecnológico

```json
{
  "Frontend Framework": "React 18.3.1",
  "Build Tool": "Vite 5.4.19",
  "Desktop Framework": "Electron 38.0.0",
  "UI Framework": "CoreUI React 5.4.0",
  "State Management": "Redux 5.0.1",
  "Router": "React Router DOM 6.26.2",
  "Charts": "Chart.js 4.4.4 + CoreUI ChartJS",
  "Styling": "SCSS/SASS 1.79.3"
}
```

### Estructura de Directorios

```
GESCOL-FrontEnd/
├── main.js                   # Proceso principal de Electron
├── index.html                # Template HTML
├── vite.config.mjs           # Configuración de Vite
├── package.json              # Dependencias y scripts
├── public/                   # Archivos estáticos
└── src/
    ├── App.js                # Componente raíz
    ├── index.js              # Entry point
    ├── routes.js             # Configuración de rutas
    ├── _nav.js               # Configuración de navegación
    ├── store.js              # Redux store
    ├── api/
    │   └── helpFetch.js      # Cliente HTTP customizado
    ├── assets/
    │   └── brand/            # Logos e imágenes
    ├── components/
    │   ├── AppHeader.js      # Header con tema y navegación
    │   ├── AppSidebar.js     # Sidebar con navegación
    │   ├── AppContent.js     # Contenedor de rutas
    │   ├── AppFooter.js      # Footer
    │   └── header/
    │       └── AppHeaderDropdown.js  # Dropdown de usuario
    ├── layout/
    │   └── DefaultLayout.js  # Layout principal
    ├── scss/
    │   ├── style.scss        # Entry point de estilos
    │   ├── _theme.scss       # Estilos del tema
    │   └── _variables.scss   # Variables personalizadas
    └── views/
        ├── dashboard/        # Dashboard principal
        ├── pages/
        │   ├── login/        # Login y registro
        │   ├── user/         # Gestión de usuarios
        │   ├── registro/     # Registro estudiantil
        │   ├── matricula/    # Matrícula estudiantil
        │   ├── estudiantes/  # Listado de estudiantes
        │   ├── brigada/      # Brigadas estudiantiles
        │   ├── secciones/    # Gestión de secciones
        │   ├── personal/     # Gestión de personal
        │   └── profile/      # Perfil de usuario
        └── styles/
            └── theme-variables.js  # Variables de tema JS
```

---

## 🔐 Autenticación y Seguridad

### Sistema de Autenticación

**Tipo**: JWT (JSON Web Tokens)

**Flujo de autenticación**:
1. Login en `/login` con email y password
2. Backend retorna `accessToken`, `refreshToken` y datos de `user`
3. Tokens se almacenan en `localStorage`:
   - `accessToken`: Token de acceso
   - `refreshToken`: Token de refresco
   - `user`: Objeto JSON con datos del usuario

**Gestión de sesión**:
```javascript
// Login (Login.js)
localStorage.setItem('accessToken', response.accessToken)
localStorage.setItem('refreshToken', response.refreshToken)
localStorage.setItem('user', JSON.stringify(response.user))

// Logout (AppHeaderDropdown.js)
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
localStorage.removeItem('user')

// Requests (helpFetch.js)
headers: {
  authorization: `Bearer ${localStorage.getItem('accessToken')}`
}
```

### API Cliente (helpFetch.js)

**URL Base**: `http://localhost:3001`

**Métodos disponibles**:
- `get(endpoint)`: GET requests
- `post(endpoint, options)`: POST requests
- `put(endpoint, options, id)`: PUT requests
- `delet(endpoint, id)`: DELETE requests
- `downloadFile(endpoint)`: Descarga de archivos (PDFs)

**Características**:
- Inyección automática de `Bearer token` en headers
- Manejo centralizado de errores
- Conversión automática de body a JSON
- Soporte para descarga de archivos binarios

---

## 👥 Sistema de Roles y Permisos

### Roles del Sistema

Actualmente la aplicación tiene **un sistema básico de roles**:

**Roles identificados**:
1. **Docente** (ID: 1)
   - Color: Personalizado
   - Función: Personal encargado de la enseñanza
   
2. **Administrador** (ID: 2)
   - Color: Personalizado
   - Función: Personal administrativo
   
3. **Secretaría** (ID: 3)
   - Color: Personalizado
   - Función: Personal de secretaría
   
4. **Mantenimiento** (ID: 4)
   - Color: Personalizado
   - Función: Personal de mantenimiento

### Estado Actual de Permisos

⚠️ **IMPORTANTE**: La aplicación **NO tiene un sistema robusto de control de acceso basado en roles (RBAC)** implementado actualmente.

**Hallazgos**:
- ✅ Los roles existen en el sistema para el módulo de Personal
- ❌ **NO hay validación de permisos** en las rutas
- ❌ **NO hay ocultamiento condicional** de módulos según rol
- ❌ Todos los usuarios autenticados ven **todos los módulos** en el sidebar
- ❌ No hay middlewares de autorización en el frontend

**Código relevante** (`theme-variables.js`):
```javascript
export const getRoleColorById = (roleId) => {
  const roleMap = {
    1: "warning",    // Docente
    2: "danger",     // Administrador
    3: "info",       // Secretaria
    4: "secondary"   // Mantenimiento
  }
  return roleMap[roleId] || "secondary"
}
```

---

## 🧭 Navegación y Rutas

### Rutas Públicas

```javascript
// App.js
<Route exact path="/" element={<Navigate to="/login" replace />} />
<Route exact path="/login" element={<Login />} />
<Route exact path="/register" element={<Register />} />
<Route exact path="/404" element={<Page404 />} />
<Route exact path="/500" element={<Page500 />} />
```

### Rutas Privadas (DefaultLayout)

```javascript
// routes.js
const routes = [
  { path: "/dashboard", name: "Dashboard", element: dashboard },
  { path: "/users", name: "Usuarios", element: users },
  { path: "/registro", name: "Registro", element: registro },
  { path: "/matricula", name: "Matricula", element: matricula },
  { path: "/brigadas", name: "Brigadas", element: brigadas },
  { path: "/secciones", name: "Secciones", element: secciones },
  { path: "/personal", name: "Personal", element: personal },
  { path: "/profile", name: "Profile", element: profile },
  { path: "/infoMatricula/:id", name: "Información de estudiante", element: infoMatricula },
  { path: "/estudiantes", name: "Estudiantes", element: estudiantes }
]
```

### Navegación Sidebar (_nav.js)

```javascript
[
  // Dashboard
  { name: "Dashboard", to: "/dashboard", icon: cilSpeedometer },
  
  // Administración
  { name: "Registro", to: "/registro", icon: cibVerizon },
  { name: "Brigada Estudiantil", to: "/brigadas", icon: cilGroup },
  { name: "Estudiantes", to: "/estudiantes", icon: cilUser },
  
  // Académico
  { name: "Matricula Estudiantil", to: "/matricula", icon: cilBook },
  { name: "Secciones", to: "/secciones", icon: cilSchool },
  
  // Personal
  { name: "Personal", to: "/personal", icon: cilEducation },
  
  // Sistema
  { name: "Usuarios", to: "/users", icon: cibMyspace }
]
```

---

## 📦 Módulos Principales

### 1. Dashboard (`/dashboard`)

**Funcionalidad**:
- Vista general de métricas institucionales
- Estadísticas de estudiantes, personal y secciones
- Gráficos de distribución (Chart.js)
- Sistema de asistencia modal
- Gestión de períodos académicos

**Datos mostrados**:
- Total de estudiantes
- Total de personal por rol
- Secciones activas
- Gráfico de estudiantes por grado
- Gráfico de personal por rol
- Módulo de tomar asistencia por sección

**APIs utilizadas**:
- `/api/dashboard/stats`
- `/api/dashboard/academic-periods`
- `/api/dashboard/sections`
- `/api/attendance` (POST)

---

### 2. Registro Estudiantil (`/registro`)

**Flujo de trabajo multi-paso**:

```
┌─────────────────┐
│ Tipo Inscripción│
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬─────────┐
    │          │          │         │
  Nuevo    Reintegro   Regular   Regular
    │          │          │         │
    v          v          v         │
Crear      Buscar     Buscar        │
Alumno   Estudiante Estudiante      │
    │          │          │         │
    v          v          │         │
Validación Validación     │         │
Grados     Grados         │         │
    │          │          │         │
    v          v          v         v
    └──────────┴──────────┴─────────┘
              │
              v
        Inscripción
         Período
              │
              v
         Completado
```

**Tipos de inscripción**:
1. **Nuevo**: Alumno nuevo → Crear → Validar grados → Inscribir
2. **Reintegro**: Buscar alumno → Validar grados → Inscribir
3. **Regular**: Buscar alumno → Inscribir directamente

**Componentes**:
- `tipo-inscripcion.js`: Selector de tipo
- `buscar-estudiante.js`: Búsqueda por cédula
- `crear-alumno.js`: Formulario completo de creación
- `validacion-grados.js`: Historial académico
- `inscripcion-periodo.js`: Asignación a período

---

### 3. Matrícula (`/matricula`)

**Funcionalidad**:
- Listado de estudiantes matriculados
- Filtrado por grado, período y búsqueda
- Vista detallada de matrícula individual
- Eliminación de matrículas
- Generación de PDFs por grado

**Características**:
- Sistema de badges de colores por grado
- Formato de fechas localizado
- Descarga de reportes PDF
- Navegación a detalle de estudiante (`/infoMatricula/:id`)

**APIs**:
- `/api/matricula` (GET, DELETE)
- `/api/matricula/periodos` (GET)
- `/api/matricula/pdf/:gradeID` (GET - descarga)

---

### 4. Estudiantes (`/estudiantes`)

**Funcionalidad**:
- Listado completo de estudiantes
- Sistema de tabs con filtros
- CRUD completo de estudiantes
- Gestión de representantes

**Tabs disponibles**:
- Todos los estudiantes
- Filtros por estado/condición
- Búsqueda avanzada

---

### 5. Brigadas Estudiantiles (`/brigadas`)

**Funcionalidad**:
- Creación y gestión de brigadas
- Asignación de estudiantes a brigadas
- Asignación de docentes guías
- Dashboard de brigadas activas

**Estructura**:
- Nombre de brigada
- Estudiantes asociados
- Docente guía
- Estado activo/inactivo

---

### 6. Secciones (`/secciones`)

**Funcionalidad**:
- Gestión de secciones académicas
- Asignación de grado y período
- Capacidad de estudiantes
- Asignación de docente guía

**Datos de sección**:
- Nombre (ej: "A", "B", "C")
- Grado asociado
- Período académico
- Capacidad máxima
- Docente asignado

---

### 7. Personal (`/personal`)

**Funcionalidad**:
- CRUD de personal de la institución
- Filtrado por rol
- Sistema de colores por rol
- Gestión de datos personales

**Datos gestionados**:
- Información personal (CI, nombres, contacto)
- Rol en la institución
- Dirección y ubicación (parroquia)
- Estado activo/inactivo

**Roles configurables**:
- Se obtienen desde `/api/personal/utils/roles`

---

### 8. Usuarios del Sistema (`/users`)

**Funcionalidad**:
- Gestión de usuarios del sistema
- Creación de nuevos usuarios
- Activación/Desactivación de usuarios
- Eliminación de usuarios
- Asignación de roles

**Campos**:
- Nombre
- Email
- Password (encriptado)
- Rol del usuario
- Estado (activo/inactivo)

**APIs**:
- `/api/users` (GET)
- `/api/users/register` (POST)
- `/api/users/:id/toggle-status` (PUT)
- `/api/users/:id` (DELETE)

---

### 9. Perfil de Usuario (`/profile`)

**Funcionalidad**:
- Vista y edición de perfil personal
- Cambio de contraseña
- Actualización de datos

---

## 🎨 Sistema de Temas

### Configuración de Temas

**Modos soportados**:
1. **Light** (Claro)
2. **Dark** (Oscuro)
3. **Auto** (Basado en preferencias del sistema)

**Gestión de tema**:
```javascript
// store.js - Estado inicial
const initialState = {
  sidebarShow: true,
  theme: 'light'  // Tema por defecto
}

// AppHeader.js - Selector de tema
const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

// Opciones
setColorMode('light')  // Modo claro
setColorMode('dark')   // Modo oscuro
setColorMode('auto')   // Automático
```

### Variables de Tema Personalizadas

**Archivo**: `src/views/styles/theme-variables.js`

**Variables personalizadas**:
- Colores por rol del personal
- Colores por grado académico
- Estados de estudiantes
- Funciones helper para asignar colores

**Estilos SCSS**:
- `src/scss/_theme.scss`: Estilos personalizados del tema
- `src/scss/_variables.scss`: Variables SCSS
- `src/scss/style.scss`: Entry point que importa CoreUI + custom

---

## ⚡ Configuración de Electron

### Archivo: `main.js`

**Configuración de ventana**:
```javascript
{
  width: 1200,
  height: 800,
  webPreferences: {
    nodeIntegration: false,     // Seguridad
    contextIsolation: true      // Seguridad
  }
}
```

**Modo de desarrollo**:
```javascript
const isDev = false  // Hardcodeado

// URL cargada
isDev 
  ? 'http://localhost:3000'           // Dev (Vite)
  : 'file://${__dirname}/build/index.html'  // Production
```

⚠️ **PROBLEMA IDENTIFICADO**: 
- `isDev` está **hardcodeado a `false`**
- Debería usar `electron-is-dev` (que está instalado)
- La URL de dev está apuntando a puerto 3000, pero Vite usa 5173 (conflicto)

**Corrección recomendada**:
```javascript
const isDev = require('electron-is-dev')

win.loadURL(
  isDev
    ? 'http://localhost:5173'  // Puerto correcto de Vite
    : `file://${path.join(__dirname, 'build/index.html')}`
)
```

---

## 🚀 Scripts de Desarrollo

### package.json

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "build": "vite build",
    "lint": "eslint \"src/**/*.js\"",
    "serve": "vite preview",
    "start": "vite",
    "electron": "electron .",
    "build-electron": "npm run build && electron-builder"
  }
}
```

**Flujo de desarrollo**:
1. `npm run dev`: Inicia Vite + Electron concurrentemente
2. Vite se levanta en `localhost:5173`
3. `wait-on` espera a que Vite esté listo
4. Electron se inicia y carga la URL de Vite

**Build para producción**:
1. `npm run build`: Compila con Vite → carpeta `build/`
2. `npm run build-electron`: Build + empaquetado de Electron

### Configuración de Electron Builder

```json
{
  "build": {
    "appId": "com.gescol.frontend",
    "productName": "GESCOL FrontEnd",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "build/**/*",
      "main.js",
      "package.json"
    ],
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

---

## 🐛 Errores y Problemas Conocidos

### 1. Configuración de Electron

**Problema**: Puerto incorrecto en `main.js`
```javascript
// ❌ Actual
isDev ? 'http://localhost:3000' : ...

// ✅ Debería ser
isDev ? 'http://localhost:5173' : ...
```

**Problema**: `isDev` hardcodeado
```javascript
// ❌ Actual
const isDev = false

// ✅ Debería ser
const isDev = require('electron-is-dev')
```

---

### 2. Seguridad y Permisos

**Problemas identificados**:
- ❌ No hay validación de roles en rutas
- ❌ No hay middleware de autorización
- ❌ Tokens en `localStorage` (vulnerable a XSS)
- ❌ No hay refresh token automático
- ❌ No hay manejo de expiración de tokens

**Recomendaciones**:
1. Implementar HOC/wrapper para rutas protegidas
2. Validar rol del usuario en cada ruta
3. Implementar refresh token automático
4. Considerar httpOnly cookies (requiere cambios en backend)
5. Añadir interceptor para manejar 401/403

---

### 3. Vite Configuration

**Configuración actual** (`vite.config.mjs`):
```javascript
{
  base: './',           // Importante para Electron
  build: {
    outDir: 'build'     // Debe coincidir con electron-builder
  },
  server: {
    port: 3000          // ⚠️ CONFLICTO: Debería ser 5173 (default Vite)
  }
}
```

**Problema**: El puerto está configurado a 3000, pero el script `dev` espera 5173.

---

### 4. API Base URL

**Problema**: URL hardcodeada en `helpFetch.js`
```javascript
const URL = 'http://localhost:3001'  // ❌ Hardcoded
```

**Recomendación**:
```javascript
const URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

Crear archivo `.env`:
```
VITE_API_URL=http://localhost:3001
```

---

## 📊 Modelo de Datos (Inferido)

### Entidades Principales

**Student** (Estudiante):
- id
- name, lastName
- ci (cédula)
- birthDate
- address
- idRepresentante
- status

**Representative** (Representante):
- id
- name, lastName
- ci
- phone
- email
- relationship

**Matricula** (Matrícula):
- id
- idStudent
- idPeriod
- idGrade
- idSection
- enrollmentDate
- status

**Section** (Sección):
- id
- name (A, B, C, etc.)
- idGrade
- idPeriod
- capacity
- idTeacher (docente guía)

**Personnel** (Personal):
- id
- name, lastName
- ci
- idRole
- phone
- email
- address
- idParroquia
- status

**User** (Usuario del Sistema):
- id
- name
- email
- password (hash)
- role
- status

**Grade** (Grado):
- id
- name (1ero, 2do, etc.)
- level

**AcademicPeriod** (Período Académico):
- id
- name
- startDate
- endDate
- status (active/inactive)

**Brigade** (Brigada):
- id
- name
- idTeacher (guía)
- students[]
- status

---

## 🔧 Configuración de Desarrollo

### Variables de Entorno Recomendadas

Crear `.env` y `.env.production`:

```env
# .env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=GESCOL
VITE_APP_VERSION=1.0.0
```

### ESLint

Configurado en `.eslintrc.js`:
- Reglas de React
- Prettier integration
- React hooks rules

---

## 📈 Métricas y Rendimiento

### Tamaño del Proyecto

- **Total de archivos JS**: 56+ archivos
- **Componentes principales**: ~30
- **Rutas**: 10 rutas principales
- **Dependencias**: 22 producción + 14 dev

### Build

**Salida**:
- `build/` - Archivos compilados de Vite
- `dist-electron/` - Aplicación empaquetada de Electron

---

## 🎯 Recomendaciones de Mejora

### Prioridad Alta

1. **Corregir configuración de Electron**:
   - Usar `electron-is-dev`
   - Actualizar puerto a 5173
   - Sincronizar Vite config

2. **Implementar RBAC (Control de Acceso)**:
   - Crear componente `ProtectedRoute`
   - Validar permisos por rol
   - Ocultar módulos no autorizados

3. **Mejorar Seguridad**:
   - Implementar refresh token
   - Manejo de expiración de sesión
   - Validación de tokens en frontend

### Prioridad Media

4. **Variables de Entorno**:
   - Externalizar API URL
   - Configuración por ambiente

5. **Manejo de Errores**:
   - Interceptor global de errores
   - Mensajes de error consistentes
   - Logging estructurado

6. **Testing**:
   - Unit tests para componentes críticos
   - Integration tests para flujos
   - E2E tests con Playwright/Cypress

### Prioridad Baja

7. **Optimización**:
   - Code splitting
   - Lazy loading de módulos
   - Optimización de imágenes

8. **Documentación**:
   - JSDoc en funciones críticas
   - README actualizado
   - Guía de contribución

---

## 📝 Conclusiones

### Fortalezas

✅ **Arquitectura moderna**: React + Vite + Electron
✅ **UI consistente**: CoreUI framework bien implementado
✅ **Modularidad**: Código bien organizado por features
✅ **Tema dinámico**: Soporte light/dark mode
✅ **Funcionalidad completa**: Módulos académicos completos

### Debilidades

❌ **Seguridad limitada**: Sin RBAC implementado, tokens en localStorage
❌ **Configuración inconsistente**: Puertos y modos no sincronizados
❌ **Sin testing**: No hay tests implementados
❌ **API hardcodeada**: URL sin externalizar
❌ **Manejo de errores básico**: Falta interceptores y logging

### Siguiente Paso Recomendado

**Fase 1 - Correcciones Críticas** (1-2 días):
1. Corregir configuración de Electron
2. Implementar variables de entorno
3. Sincronizar puertos Vite/Electron

**Fase 2 - Seguridad** (3-5 días):
4. Implementar RBAC
5. Protected routes
6. Refresh token flow

**Fase 3 - UX/UI** (según necesidad):
7. Mejorar interfaces según feedback
8. Optimizar flujos de usuario
9. Añadir validaciones faltantes

---

## 📞 Información de Contacto del Proyecto

**Nombre del Sistema**: GESCOL - Sistema de Gestión Escolar  
**Institución**: José Gonzalo Méndez  
**Versión**: 1.0.0  
**Licencia**: MIT  

---

*Documento generado el: 2026-02-12*  
*Autor: Análisis automatizado del código fuente*
