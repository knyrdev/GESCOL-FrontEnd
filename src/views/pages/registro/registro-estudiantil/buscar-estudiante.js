"use client"

import { useState } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CContainer,
  CAlert,
  CSpinner,
  CBadge,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilSearch, cilUser, cilPhone, cilHome, cilWarning, cilCheckCircle } from "@coreui/icons"
import { helpFetch } from "../../../../api/helpFetch"
import CedulaInput from "../../../../components/cedula-input"
import { useError } from "../../../../context/ErrorContext"

export default function BuscarEstudianteEnhanced({ tipoInscripcion, onStudentFound, onBack }) {
  const { showError } = useError()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [studentCi, setStudentCi] = useState("")
  const [studentFound, setStudentFound] = useState(null)

  const api = helpFetch(showError)

  const buscarEstudiante = async () => {
    if (!studentCi.trim()) {
      showError({
        type: "validation",
        msg: "Ingrese la cédula del estudiante",
      })
      return
    }

    setLoading(true)
    setSuccess(null)

    try {
      console.log("🔍 Buscando estudiante con CI:", studentCi)
      const response = await api.get(`/api/students/${studentCi}`)

      if (response && response.ok) {
        setStudentFound(response.student)
        console.log("✅ Estudiante encontrado:", response.student)
      } else {
        setStudentFound(null)
      }
    } catch (err) {
      console.error("❌ Error buscando estudiante:", err)
      setStudentFound(null)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (studentFound) {
      onStudentFound(studentFound)
    }
  }

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case "1":
        return "success" // Activo
      case "2":
        return "info" // Inscrito
      case "3":
        return "warning" // Graduado
      case "4":
        return "secondary" // Egresado
      case "5":
        return "danger" // Inactivo
      case "6":
        return "dark" // Retirado
      case "7":
        return "danger" // Expulsado
      default:
        return "secondary"
    }
  }

  const getTipoTitle = () => {
    switch (tipoInscripcion) {
      case "reintegro":
        return "Reintegro"
      case "regular":
        return "Estudiante Regular"
      default:
        return ""
    }
  }

  const canContinue = () => {
    if (!studentFound) return false

    // Para reintegro: estudiantes inactivos, retirados o egresados pueden reintegrarse
    if (tipoInscripcion === "reintegro") {
      return ["5", "6", "4"].includes(studentFound.status_id) // Inactivo, Retirado, Egresado
    }

    // Para regular: solo estudiantes activos
    if (tipoInscripcion === "regular") {
      return studentFound.status_id === "1" // Solo activos
    }

    return false
  }

  const getStatusMessage = () => {
    if (!studentFound) return ""

    if (tipoInscripcion === "reintegro") {
      if (["5", "6", "4"].includes(studentFound.status_id)) {
        return "Este estudiante puede ser reintegrado al sistema."
      } else {
        return "Este estudiante no requiere reintegro. Su estado actual no permite esta acción."
      }
    }

    if (tipoInscripcion === "regular") {
      if (studentFound.status_id === "1") {
        return "Este estudiante está disponible para inscripción regular."
      } else {
        return "Este estudiante no está en estado activo para inscripción regular."
      }
    }

    return ""
  }

  return (
    <div className="min-vh-100 bg-body-tertiary py-4">
      <CContainer>
        <div className="mb-4">
          <h2 className="text-center text-body-emphasis">Buscar Estudiante - {getTipoTitle()}</h2>
          <p className="text-center text-body-secondary">
            {tipoInscripcion === "reintegro"
              ? "Busque al estudiante que desea reintegrar al sistema"
              : "Busque al estudiante regular para su inscripción"}
          </p>
        </div>

        {/* Success alert removed */}

        <CCard className="shadow">
          <CCardHeader className="bg-primary text-white">
            <h4 className="mb-0">
              <CIcon icon={cilSearch} className="me-2" />
              Búsqueda de Estudiante
            </h4>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-4">
              <CCol md={8}>
                <CFormLabel className="fw-semibold">Cédula del Estudiante</CFormLabel>
                <CedulaInput value={studentCi} onChange={setStudentCi} placeholder="12345678" />
              </CCol>
              <CCol md={4} className="d-flex align-items-end">
                <CButton color="info" size="lg" onClick={buscarEstudiante} disabled={loading} className="w-100">
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilSearch} className="me-2" />
                      Buscar
                    </>
                  )}
                </CButton>
              </CCol>
            </CRow>

            {studentFound && (
              <CCard className="mt-4 border-success">
                <CCardHeader className="bg-success text-white">
                  <h5 className="mb-0">
                    <CIcon icon={cilUser} className="me-2" />
                    Estudiante Encontrado
                  </h5>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol md={6}>
                      <h6 className="text-primary mb-3">Datos Personales</h6>
                      <div className="mb-2">
                        <strong>Nombre Completo:</strong> {studentFound.name} {studentFound.lastName}
                      </div>
                      <div className="mb-2">
                        <strong>Cédula:</strong> {studentFound.ci}
                      </div>
                      <div className="mb-2">
                        <strong>Sexo:</strong> {studentFound.sex === "M" ? "Masculino" : "Femenino"}
                      </div>
                      <div className="mb-2">
                        <strong>Fecha de Nacimiento:</strong>{" "}
                        {new Date(studentFound.birthday).toLocaleDateString("es-VE")}
                      </div>
                      <div className="mb-2">
                        <strong>Lugar de Nacimiento:</strong> {studentFound.placeBirth || "No especificado"}
                      </div>
                      <div className="mb-2">
                        <strong>Estado:</strong>{" "}
                        <CBadge color={getStatusColor(studentFound.status_id)} className="ms-1">
                          {studentFound.status_description}
                        </CBadge>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <h6 className="text-primary mb-3">Información Familiar</h6>
                      <div className="mb-2">
                        <strong>Representante:</strong> {studentFound.representative_name}{" "}
                        {studentFound.representative_lastName}
                      </div>
                      <div className="mb-2">
                        <strong>Teléfono Representante:</strong>
                        <CIcon icon={cilPhone} size="sm" className="ms-2 me-1" />
                        {studentFound.representative_phone}
                      </div>
                      <div className="mb-2">
                        <strong>Email Representante:</strong> {studentFound.representative_email || "No registrado"}
                      </div>
                      <div className="mb-2">
                        <strong>Madre:</strong> {studentFound.motherName || "No especificado"}
                      </div>
                      <div className="mb-2">
                        <strong>Padre:</strong> {studentFound.fatherName || "No especificado"}
                      </div>
                      <div className="mb-2">
                        <strong>Cantidad de Hermanos:</strong> {studentFound.quantityBrothers || 0}
                      </div>
                    </CCol>
                  </CRow>

                  {studentFound.representative_address && (
                    <CRow className="mt-3">
                      <CCol md={12}>
                        <h6 className="text-primary">Dirección</h6>
                        <div>
                          <CIcon icon={cilHome} size="sm" className="me-2" />
                          {studentFound.representative_address}
                        </div>
                      </CCol>
                    </CRow>
                  )}

                  <CAlert color={canContinue() ? "success" : "warning"} className="mt-4">
                    <CIcon icon={canContinue() ? cilCheckCircle : cilWarning} className="me-2" />
                    <strong>{canContinue() ? "Disponible:" : "Atención:"}</strong> {getStatusMessage()}
                  </CAlert>

                  <div className="mt-4 d-flex justify-content-between">
                    <CButton color="secondary" onClick={onBack}>
                      Volver
                    </CButton>
                    <CButton
                      color={canContinue() ? "success" : "secondary"}
                      size="lg"
                      onClick={handleContinue}
                      disabled={!canContinue()}
                    >
                      {tipoInscripcion === "reintegro" ? "Continuar con Reintegro" : "Continuar con Inscripción"}
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </div>
  )
}
