"use client"

import { useState, useCallback } from "react"

export function useErrorHandler() {
  const [error, setError] = useState(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const handleError = useCallback((err, context) => {
    console.error("Error capturado:", err, "Contexto:", context)

    let errorInfo

    // Determinar el tipo de error basado en el contenido
    if (err?.status === 401 || err?.message?.includes("credenciales") || err?.message?.includes("autorización")) {
      errorInfo = {
        type: "auth",
        title: "Error de Autenticación",
        message: "No tienes permisos para realizar esta acción o tu sesión ha expirado.",
        details: err?.message || err?.msg || JSON.stringify(err),
      }
    } else if (err?.status >= 400 && err?.status < 500) {
      errorInfo = {
        type: "validation",
        title: "Error de Validación",
        message: err?.message || err?.msg || "Los datos ingresados no son válidos. Por favor, revisa la información.",
        details: err?.details || JSON.stringify(err),
      }
    } else if (err?.status >= 500 || err?.message?.includes("servidor") || err?.message?.includes("server")) {
      errorInfo = {
        type: "server",
        title: "Error del Servidor",
        message: "Ha ocurrido un problema en el servidor. Por favor, intenta nuevamente.",
        details: err?.message || err?.msg || JSON.stringify(err),
      }
    } else if (err?.message?.includes("network") || err?.message?.includes("fetch") || !navigator.onLine) {
      errorInfo = {
        type: "network",
        title: "Error de Conexión",
        message: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        details: err?.message || JSON.stringify(err),
      }
    } else {
      errorInfo = {
        type: "server",
        title: "Error Inesperado",
        message: err?.message || err?.msg || "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.",
        details: JSON.stringify(err),
      }
    }

    setError(errorInfo)
    setShowErrorModal(true)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setShowErrorModal(false)
  }, [])

  return {
    error,
    showErrorModal,
    handleError,
    clearError,
  }
}
