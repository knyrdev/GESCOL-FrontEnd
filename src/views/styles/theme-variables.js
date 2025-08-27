"use client"

import React from "react"

// Sistema de variables de tema basado en CoreUI
// Utiliza las variables CSS nativas de CoreUI para consistencia

export const themeVariables = {
  // Colores principales de CoreUI (Brand Colors)
  brand: {
    primary: "var(--cui-primary)",
    secondary: "var(--cui-secondary)",
    success: "var(--cui-success)",
    danger: "var(--cui-danger)",
    warning: "var(--cui-warning)",
    info: "var(--cui-info)",
    light: "var(--cui-light)",
    dark: "var(--cui-dark)",
  },

  // Colores de fondo del sistema
  backgrounds: {
    body: "var(--cui-body-bg)",
    surface: "var(--cui-surface-bg, var(--cui-body-bg))",
    card: "var(--cui-card-bg, var(--cui-body-bg))",
    modal: "var(--cui-modal-bg, var(--cui-body-bg))",
    tertiary: "var(--cui-tertiary-bg)",
    // Fondos específicos usando brand colors
    primary: "var(--cui-primary)",
    secondary: "var(--cui-secondary)",
    success: "var(--cui-success)",
    danger: "var(--cui-danger)",
    warning: "var(--cui-warning)",
    info: "var(--cui-info)",
    light: "var(--cui-light)",
    dark: "var(--cui-dark)",
  },

  // Colores de texto del sistema
  text: {
    primary: "var(--cui-body-color)",
    secondary: "var(--cui-text-muted)",
    emphasis: "var(--cui-emphasis-color)",
    white: "var(--cui-white)",
    muted: "var(--cui-text-muted)",
    light: "rgba(255, 255, 255, 0.75)",
    dark: "var(--cui-dark)",
  },

  // Bordes del sistema
  borders: {
    color: "var(--cui-border-color)",
    translucent: "var(--cui-border-color-translucent)",
    width: "var(--cui-border-width)",
    radius: "var(--cui-border-radius)",
    radiusLg: "var(--cui-border-radius-lg)",
    radiusSm: "var(--cui-border-radius-sm)",
  },

  // Sombras del sistema
  shadows: {
    sm: "var(--cui-box-shadow-sm)",
    md: "var(--cui-box-shadow)",
    lg: "var(--cui-box-shadow-lg)",
    inset: "var(--cui-box-shadow-inset)",
  },

  // Estados específicos para roles del personal
  roles: {
    teacher: {
      bg: "var(--cui-success)",
      text: "var(--cui-white)",
      border: "var(--cui-success)",
      class: "bg-success text-white",
    },
    admin: {
      bg: "var(--cui-primary)",
      text: "var(--cui-white)",
      border: "var(--cui-primary)",
      class: "bg-primary text-white",
    },
    secretary: {
      bg: "var(--cui-warning)",
      text: "var(--cui-dark)",
      border: "var(--cui-warning)",
      class: "bg-warning text-dark",
    },
    maintenance: {
      bg: "var(--cui-info)",
      text: "var(--cui-dark)",
      border: "var(--cui-info)",
      class: "bg-info text-dark",
    },
    default: {
      bg: "var(--cui-secondary)",
      text: "var(--cui-white)",
      border: "var(--cui-secondary)",
      class: "bg-secondary text-white",
    },
  },

  // Utilidades de espaciado
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "3rem",
  },

  // Breakpoints responsivos
  breakpoints: {
    xs: "0",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    xxl: "1400px",
  },
}

// Función para detectar tema oscuro usando las mismas técnicas que Colors.js
export const detectDarkMode = () => {
  // Verificar atributo data-coreui-theme
  const theme = document.documentElement.getAttribute("data-coreui-theme")
  if (theme === "dark") return true

  // Verificar clases en body
  if (document.body.classList.contains("dark") || document.body.classList.contains("dark-theme")) return true

  // Verificar variable CSS de fondo
  const bodyBg = getComputedStyle(document.documentElement).getPropertyValue("--cui-body-bg")
  if (bodyBg && bodyBg.includes("dark")) return true

  // Verificar preferencia del sistema como fallback
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

// Función para obtener el color computado (similar a Colors.js)
export const getComputedColor = (element, property = "background-color") => {
  if (!element) return null
  return window.getComputedStyle(element).getPropertyValue(property)
}

// Función para obtener el color de rol basado en ID
export const getRoleColorById = (roleId) => {
  const roleMap = {
    1: "success", // Docente
    2: "primary", // Administrador
    3: "warning", // Secretaria
    4: "info", // Mantenimiento
  }
  return roleMap[roleId] || "secondary"
}

// Función para obtener la configuración completa de rol
export const getRoleConfig = (roleId) => {
  const roleMap = {
    1: themeVariables.roles.teacher, // Docente
    2: themeVariables.roles.admin, // Administrador
    3: themeVariables.roles.secretary, // Secretaria
    4: themeVariables.roles.maintenance, // Mantenimiento
  }
  return roleMap[roleId] || themeVariables.roles.default
}

// CSS personalizado que extiende las clases de CoreUI
export const customCSS = `
  /* Extensiones para mejor soporte de temas */
  .bg-body-tertiary {
    background-color: var(--cui-tertiary-bg) !important;
  }
  
  .text-body-emphasis {
    color: var(--cui-emphasis-color) !important;
  }
  
  .text-body-secondary {
    color: var(--cui-text-muted) !important;
  }
  
  .border-body {
    border-color: var(--cui-border-color) !important;
  }
  
  .shadow-theme {
    box-shadow: var(--cui-box-shadow) !important;
  }
  
  /* Clases específicas para componentes */
  .card-theme {
    background-color: var(--cui-card-bg, var(--cui-body-bg));
    border-color: var(--cui-border-color);
    color: var(--cui-body-color);
  }
  
  .modal-theme {
    background-color: var(--cui-modal-bg, var(--cui-body-bg));
    color: var(--cui-body-color);
  }
  
  .table-theme {
    --cui-table-bg: var(--cui-body-bg);
    --cui-table-striped-bg: var(--cui-tertiary-bg);
    --cui-table-hover-bg: var(--cui-tertiary-bg);
    --cui-table-color: var(--cui-body-color);
  }
  
  /* Clases para roles con mejor contraste */
  .role-teacher {
    background-color: var(--cui-success) !important;
    color: var(--cui-white) !important;
    border-color: var(--cui-success) !important;
  }
  
  .role-admin {
    background-color: var(--cui-primary) !important;
    color: var(--cui-white) !important;
    border-color: var(--cui-primary) !important;
  }
  
  .role-secretary {
    background-color: var(--cui-warning) !important;
    color: var(--cui-dark) !important;
    border-color: var(--cui-warning) !important;
  }
  
  .role-maintenance {
    background-color: var(--cui-info) !important;
    color: var(--cui-dark) !important;
    border-color: var(--cui-info) !important;
  }
  
  /* Mejoras para accesibilidad */
  .btn-outline-theme {
    border-color: var(--cui-border-color);
    color: var(--cui-body-color);
  }
  
  .btn-outline-theme:hover {
    background-color: var(--cui-tertiary-bg);
    border-color: var(--cui-border-color);
  }
  
  /* Estados de focus mejorados */
  .form-control:focus,
  .form-select:focus {
    border-color: var(--cui-primary);
    box-shadow: 0 0 0 0.25rem rgba(var(--cui-primary-rgb), 0.25);
  }
  
  /* Animaciones suaves para cambios de tema */
  .theme-transition {
    transition: background-color 0.15s ease-in-out, 
                border-color 0.15s ease-in-out, 
                color 0.15s ease-in-out;
  }
`

// Hook personalizado para usar el tema (opcional)
export const useTheme = () => {
  const [isDark, setIsDark] = React.useState(detectDarkMode())

  React.useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(detectDarkMode())
    }

    // Observar cambios en el DOM
    const observer = new MutationObserver(handleThemeChange)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-coreui-theme", "class"],
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // Observar cambios en preferencias del sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", handleThemeChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", handleThemeChange)
    }
  }, [])

  return {
    isDark,
    isLight: !isDark,
    theme: isDark ? "dark" : "light",
    variables: themeVariables,
    getRoleColor: getRoleColorById,
    getRoleConfig: getRoleConfig,
  }
}

export default themeVariables
