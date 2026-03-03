"use client"

import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CAlert } from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilWarning, cilXCircle, cilLockLocked } from "@coreui/icons"

export default function ErrorModal({ visible, onClose, error }) {
  if (!error) return null

  const getErrorIcon = () => {
    switch (error.type) {
      case "server":
        return cilXCircle
      case "validation":
        return cilWarning
      case "auth":
        return cilLockLocked
      case "network":
        return cilWarning
      default:
        return cilWarning
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case "server":
        return "danger"
      case "validation":
        return "warning"
      case "auth":
        return "info"
      case "network":
        return "secondary"
      default:
        return "danger"
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case "server":
        return "Error del Servidor"
      case "validation":
        return "Error de Validación"
      case "auth":
        return "Error de Autenticación"
      case "network":
        return "Error de Conexión"
      default:
        return "Error"
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" keyboard={false}>
      <CModalHeader>
        <CModalTitle>
          <CIcon icon={getErrorIcon()} className="me-2" />
          {error.title || getErrorTitle()}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CAlert color={getErrorColor()} className="mb-3">
          <div className="d-flex align-items-start">
            <CIcon icon={getErrorIcon()} size="lg" className="me-3 mt-1" />
            <div>
              <h6 className="alert-heading mb-2">{error.title || getErrorTitle()}</h6>
              <p className="mb-2">{error.message}</p>
              {error.details && (
                <details className="mt-2">
                  <summary className="text-muted" style={{ cursor: "pointer" }}>
                    Ver detalles técnicos
                  </summary>
                  <pre className="mt-2 p-2 bg-light rounded text-sm">
                    <code>{error.details}</code>
                  </pre>
                </details>
              )}
            </div>
          </div>
        </CAlert>

        <div className="text-muted">
          <h6>¿Qué puedes hacer?</h6>
          <ul className="mb-0">
            {error.type === "server" && (
              <>
                <li>Verifica que todos los datos estén correctos</li>
                <li>Intenta nuevamente en unos momentos</li>
                <li>Si el problema persiste, contacta al administrador</li>
              </>
            )}
            {error.type === "validation" && (
              <>
                <li>Revisa los campos marcados en rojo</li>
                <li>Asegúrate de completar todos los campos obligatorios</li>
                <li>Verifica el formato de los datos ingresados</li>
              </>
            )}
            {error.type === "auth" && (
              <>
                <li>Verifica tus credenciales de acceso</li>
                <li>Inicia sesión nuevamente si es necesario</li>
                <li>Contacta al administrador si no tienes permisos</li>
              </>
            )}
            {error.type === "network" && (
              <>
                <li>Verifica tu conexión a internet</li>
                <li>Intenta recargar la página</li>
                <li>Contacta al soporte técnico si el problema persiste</li>
              </>
            )}
          </ul>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={onClose}>
          Entendido
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
