"use client"

import { useState, useEffect } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CButton,
  CRow,
  CCol,
  CContainer,
  CAlert,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilSchool, cilCheckCircle, cilWarning, cilInfo } from "@coreui/icons"
import { helpFetch } from "../../../../api/helpFetch"

export default function InscripcionPeriodo({
  student,
  tipoInscripcion,
  hasAcademicHistory,
  onInscriptionCompleted,
  onBack,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [grades, setGrades] = useState([])
  const [suggestedGrade, setSuggestedGrade] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)

  // Datos completos de inscripción según el modelo
  const [inscriptionData, setInscriptionData] = useState({
    studentCi: student.ci,
    sectionID: 0,
    brigadeTeacherDateID: null,
    repeater: false,
    chemiseSize: "",
    pantsSize: "",
    shoesSize: "",
    weight: 0,
    stature: 0,
    diseases: "",
    observation: "",
    birthCertificateCheck: false,
    vaccinationCardCheck: false,
    studentPhotosCheck: false,
    representativePhotosCheck: false,
    representativeCopyIDCheck: false,
    representativeRIFCheck: false,
    autorizedCopyIDCheck: false,
  })

  const api = helpFetch()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedGrade && currentPeriod) {
      loadSections(selectedGrade, currentPeriod.id)
    }
  }, [selectedGrade, currentPeriod])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      console.log("🔄 Cargando datos iniciales para inscripción...")

      // Cargar período actual
      const periodData = await api.get("/api/matriculas/academic-periods/current")
      if (periodData && periodData.ok) {
        setCurrentPeriod(periodData.period)
        console.log("✅ Período actual cargado:", periodData.period)
      }

      // Cargar grados disponibles
      const gradesData = await api.get("/api/matriculas/grades")
      if (gradesData && gradesData.ok) {
        setGrades(gradesData.grades)
        console.log("✅ Grados cargados:", gradesData.grades)
      }

      // Determinar grado y estado de repitiente automáticamente
      await determineGradeAndRepeaterStatus(gradesData)
    } catch (err) {
      console.error("❌ Error cargando datos iniciales:", err)
      setError("Error al cargar los datos iniciales")
    } finally {
      setLoading(false)
    }
  }

  const determineGradeAndRepeaterStatus = async (gradesData) => {
    try {
      console.log("🎯 Determinando grado automático para estudiante:", student.id)

      const recordData = await api.get(`/api/matriculas/history/last/${student.id}`)

      if (recordData && recordData.ok && recordData.record) {
        const lastRecord = recordData.record
        console.log("📚 Último registro académico:", lastRecord)

        const lastGrade = lastRecord.gradeAchieved
        const lastGradeId = Number.parseInt(lastRecord.gradeID)

        // Determinar si es repitiente basado en la nota
        const isRepeater = ["E", "F"].includes(lastGrade) || !lastRecord.isApproved

        // Determinar el grado a inscribir
        let nextGradeId
        if (isRepeater) {
          nextGradeId = lastGradeId // Repite el mismo grado
        } else {
          nextGradeId = lastGradeId + 1 // Avanza al siguiente grado
        }

        console.log(`📊 Análisis: Última nota: ${lastGrade}, Grado anterior: ${lastGradeId}`)
        console.log(`📊 Resultado: Próximo grado: ${nextGradeId}, Repitiente: ${isRepeater}`)
        console.log("📊 Grados disponibles:", gradesData.grades.find((g) => g.id == nextGradeId))
        // Verificar que el grado existe en la lista de grados disponibles
        const gradeExists = gradesData.grades.find((g) => g.id == nextGradeId)
        if (gradeExists) {
          setSuggestedGrade(nextGradeId)
          setSelectedGrade(nextGradeId)
          setInscriptionData((prev) => ({
            ...prev,
            repeater: isRepeater,
          }))
        } else {
          console.warn("⚠️ El grado calculado no existe en la lista de grados disponibles")
          // Fallback al primer grado disponible
          setSuggestedGrade(grades[0]?.id || 1)
          setSelectedGrade(grades[0]?.id || 1)
          setInscriptionData((prev) => ({
            ...prev,
            repeater: false,
          }))
        }
      } else {
        console.log("📝 No hay historial académico, asignando primer grado")
        // Si no hay historial, es primer grado y no repitiente
        const firstGrade = grades.find((g) => g.name.includes("1er")) || grades[0]
        const firstGradeId = firstGrade?.id || 1

        setSuggestedGrade(firstGradeId)
        setSelectedGrade(firstGradeId)
        setInscriptionData((prev) => ({
          ...prev,
          repeater: false,
        }))
      }
    } catch (err) {
      console.error("❌ Error determinando grado:", err)
      // Si hay error, asignar primer grado por defecto
      const firstGrade = grades.find((g) => g.name.includes("1er")) || grades[0]
      const firstGradeId = firstGrade?.id || 1

      setSuggestedGrade(firstGradeId)
      setSelectedGrade(firstGradeId)
      setInscriptionData((prev) => ({
        ...prev,
        repeater: false,
      }))
    }
  }

  const loadSections = async (gradeId, periodId) => {
    try {
      console.log("🏫 Cargando secciones para grado:", gradeId, "período:", periodId)

      // Corregir la ruta de la API para que coincida con el backend
      const response = await api.get(`/api/matriculas/sections?academicPeriodId=${periodId}&gradeId=${gradeId}`)

      if (response && response.ok) {
        setSections(response.sections || [])
        console.log("✅ Secciones cargadas:", response.sections?.length || 0)
      } else {
        console.warn("⚠️ No se pudieron cargar las secciones:", response.msg)
        setSections([])
      }
    } catch (err) {
      console.error("❌ Error cargando secciones:", err)
      setError("Error al cargar las secciones")
      setSections([])
    }
  }

  const handleInscription = async () => {
    if (!selectedSection) {
      setError("Debe seleccionar una sección")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("📝 Realizando inscripción con datos:", {
        ...inscriptionData,
        sectionID: selectedSection,
      })

      const response = await api.post("/api/matriculas/inscription", {
        body: {
          ...inscriptionData,
          sectionID: selectedSection,
        },
      })

      if (response && response.ok) {
        setSuccess("¡Inscripción realizada exitosamente!")
        setTimeout(() => {
          onInscriptionCompleted()
        }, 2000)
      } else {
        setError(response.msg || "Error al realizar la inscripción")
      }
    } catch (err) {
      console.error("❌ Error en inscripción:", err)
      setError(err.msg || "Error al realizar la inscripción")
    } finally {
      setLoading(false)
    }
  }

  const getSizeOptions = () => ["4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL"]

  const getShoeSizeOptions = () => [
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
  ]

  const getTipoTitle = () => {
    switch (tipoInscripcion) {
      case "nuevo":
        return "Nuevo Ingreso"
      case "reintegro":
        return "Reintegro"
      case "regular":
        return "Estudiante Regular"
      default:
        return ""
    }
  }

  const getSelectedGradeName = () => {
    if (!selectedGrade || !grades.length) return "Cargando..."
    console.log(grades)
    const grade = grades.find((g) => g.id == selectedGrade)
    return grade ? grade.name : "No encontrado"
  }

  return (
    <div className="min-vh-100 bg-body-tertiary py-4">
      <CContainer>
        <div className="mb-4">
          <h2 className="text-center text-body-emphasis">Inscripción en el Período Actual - {getTipoTitle()}</h2>
          <p className="text-center text-body-secondary">Período Académico: {currentPeriod?.name || "Cargando..."}</p>
        </div>

        {error && (
          <CAlert color="danger" dismissible onClose={() => setError(null)}>
            <CIcon icon={cilWarning} className="me-2" />
            {error}
          </CAlert>
        )}
        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
            <CIcon icon={cilCheckCircle} className="me-2" />
            {success}
          </CAlert>
        )}

        <CCard className="mb-4 border-primary">
          <CCardHeader className="bg-primary text-white">
            <h4 className="mb-0">
              <CIcon icon={cilSchool} className="me-2" />
              Estudiante: {student.name} {student.lastName}
            </h4>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold">Grado Asignado Automáticamente</CFormLabel>
                <CFormInput value={getSelectedGradeName()} disabled className="bg-body-secondary" />
                <small className={`text-${inscriptionData.repeater ? "warning" : "success"}`}>
                  {inscriptionData.repeater ? (
                    <>
                      <CIcon icon={cilWarning} className="me-1" />
                      Estudiante repitiente (nota anterior E o F)
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilCheckCircle} className="me-1" />
                      Promoción al siguiente grado
                    </>
                  )}
                </small>
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold">Sección</CFormLabel>
                <CFormSelect
                  value={selectedSection || ""}
                  onChange={(e) => setSelectedSection(Number.parseInt(e.target.value))}
                  disabled={!selectedGrade || sections.length === 0}
                >
                  <option value="">Seleccionar sección...</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      Sección {section.seccion} -{" "}
                      {section.teacher_name
                        ? `${section.teacher_name} ${(section.teacher_lastName || " ")}`
                        : "Sin docente asignado"}
                      ({section.student_count || 0} estudiantes)
                    </option>
                  ))}
                </CFormSelect>
                {sections.length === 0 && selectedGrade && (
                  <small className="text-warning">
                    <CIcon icon={cilInfo} className="me-1" />
                    No hay secciones disponibles para este grado
                  </small>
                )}
              </CCol>
            </CRow>

            {sections.length > 0 && (
              <CTable striped hover className="mb-4">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Sección</CTableHeaderCell>
                    <CTableHeaderCell>Docente</CTableHeaderCell>
                    <CTableHeaderCell>Estudiantes</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {sections.map((section) => (
                    <CTableRow
                      key={section.id}
                      className={selectedSection === section.id ? "table-active" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <CTableDataCell>
                        <strong>Sección {section.seccion}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        {section.teacher_name ? (
                          `${section.teacher_name} ${section.teacher_lastName}`
                        ) : (
                          <span className="text-muted">Sin asignar</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={section.student_count > 25 ? "warning" : "info"}>
                          {section.student_count || 0} estudiantes
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={section.student_count > 30 ? "danger" : "success"}>
                          {section.student_count > 30 ? "Llena" : "Disponible"}
                        </CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader className="bg-info text-white">
            <h5 className="mb-0">Información Física del Estudiante</h5>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={2}>
                <CFormLabel>Peso (kg)</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.1"
                  min="0"
                  value={inscriptionData.weight}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      weight: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel>Estatura (m)</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  min="0"
                  value={inscriptionData.stature}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      stature: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel>Talla Camisa</CFormLabel>
                <CFormSelect
                  value={inscriptionData.chemiseSize}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      chemiseSize: e.target.value,
                    }))
                  }
                >
                  <option value="">Seleccionar...</option>
                  {getSizeOptions().map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel>Talla Pantalón</CFormLabel>
                <CFormSelect
                  value={inscriptionData.pantsSize}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      pantsSize: e.target.value,
                    }))
                  }
                >
                  <option value="">Seleccionar...</option>
                  {getSizeOptions().map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel>Talla Zapato</CFormLabel>
                <CFormSelect
                  value={inscriptionData.shoesSize}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      shoesSize: e.target.value,
                    }))
                  }
                >
                  <option value="">Seleccionar...</option>
                  {getShoeSizeOptions().map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel>Estado Académico</CFormLabel>
                <CFormInput
                  value={inscriptionData.repeater ? "Repitiente" : "Regular"}
                  disabled
                  className={`bg-body-secondary text-${inscriptionData.repeater ? "warning" : "success"}`}
                />
                <small className="text-muted">Determinado automáticamente</small>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Enfermedades</CFormLabel>
                <CFormInput
                  value={inscriptionData.diseases}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      diseases: e.target.value,
                    }))
                  }
                  placeholder="Indique si padece alguna enfermedad"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Observaciones</CFormLabel>
                <CFormInput
                  value={inscriptionData.observation}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      observation: e.target.value,
                    }))
                  }
                  placeholder="Observaciones adicionales"
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader className="bg-warning text-dark">
            <h5 className="mb-0">Requisitos de Inscripción</h5>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <CFormCheck
                  checked={inscriptionData.birthCertificateCheck}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      birthCertificateCheck: e.target.checked,
                    }))
                  }
                  label="Acta de Nacimiento"
                  className="mb-2"
                />
                <CFormCheck
                  checked={inscriptionData.vaccinationCardCheck}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      vaccinationCardCheck: e.target.checked,
                    }))
                  }
                  label="Tarjeta de Vacunas"
                  className="mb-2"
                />
                <CFormCheck
                  checked={inscriptionData.studentPhotosCheck}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      studentPhotosCheck: e.target.checked,
                    }))
                  }
                  label="Fotos del Estudiante"
                  className="mb-2"
                />
                <CFormCheck
                  checked={inscriptionData.representativePhotosCheck}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      representativePhotosCheck: e.target.checked,
                    }))
                  }
                  label="Fotos del Representante"
                  className="mb-2"
                />
              </CCol>
              <CCol md={6}>
                <CFormCheck
                  checked={inscriptionData.representativeCopyIDCheck}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      representativeCopyIDCheck: e.target.checked,
                    }))
                  }
                  label="Copia de Cédula del Representante"
                  className="mb-2"
                />
                <CFormCheck
                  checked={inscriptionData.representativeRIFCheck}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      representativeRIFCheck: e.target.checked,
                    }))
                  }
                  label="RIF del Representante"
                  className="mb-2"
                />
                <CFormCheck
                  checked={inscriptionData.autorizedCopyIDCheck}
                  onChange={(e) =>
                    setInscriptionData((prev) => ({
                      ...prev,
                      autorizedCopyIDCheck: e.target.checked,
                    }))
                  }
                  label="Copia de Cédula de Personas Autorizadas"
                  className="mb-2"
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <div className="d-flex justify-content-between">
          <CButton color="secondary" onClick={onBack}>
            Volver
          </CButton>
          <CButton color="success" size="lg" onClick={handleInscription} disabled={loading || !selectedSection}>
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Procesando...
              </>
            ) : (
              <>
                <CIcon icon={cilCheckCircle} className="me-2" />
                Completar Inscripción
              </>
            )}
          </CButton>
        </div>
      </CContainer>
    </div>
  )
}
