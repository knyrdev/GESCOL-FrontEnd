"use client"

import { useState, useEffect } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
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
import { cilEducation, cilPlus, cilTrash, cilWarning, cilCheckCircle, cilInfo, cilCog } from "@coreui/icons"
import { helpFetch } from "../../../../api/helpFetch"
import { useError } from "../../../../context/ErrorContext"

export default function ValidacionGradosEnhanced({ student, tipoInscripcion, onHistoryCompleted, onBack }) {
  const { showError } = useError()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const api = helpFetch(showError)

  const [grades, setGrades] = useState([])
  const [academicPeriods, setAcademicPeriods] = useState([])
  const [availableGrades, setAvailableGrades] = useState([])

  // Estados para lógica automática
  const [suggestedGrade, setSuggestedGrade] = useState(null)
  const [isRepeater, setIsRepeater] = useState(false)
  const [autoGradeInfo, setAutoGradeInfo] = useState("")

  const [hasPreviousStudies, setHasPreviousStudies] = useState(null)
  const [academicHistory, setAcademicHistory] = useState([])
  const [currentHistory, setCurrentHistory] = useState({
    academicPeriodID: 0,
    gradeID: 0,
    institutionName: "",
    gradeAchieved: "A",
    isApproved: true,
  })



  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      console.log("🔄 Cargando datos para validación de grados...")

      // Cargar grados disponibles
      const gradesData = await api.get("/api/matriculas/grades")
      if (gradesData && gradesData.ok) {
        setGrades(gradesData.grades)
        setAvailableGrades(gradesData.grades)
        console.log("✅ Grados cargados:", gradesData.grades)
      } else {
        throw new Error(gradesData?.msg || "Error al cargar los grados")
      }

      // Cargar períodos académicos
      const periodsData = await api.get("/api/matriculas/academic-periods")
      if (periodsData && periodsData.ok) {
        setAcademicPeriods(periodsData.periods)
        console.log("✅ Períodos académicos cargados:", periodsData.periods)
      } else {
        throw new Error(periodsData?.msg || "Error al cargar los períodos académicos")
      }

      // Aplicar lógica automática de grados
      await determineAutomaticGrade(gradesData.grades)
    } catch (err) {
      console.error("❌ Error cargando datos iniciales:", err)
    } finally {
      setLoading(false)
    }
  }

  const determineAutomaticGrade = async (gradesData) => {
    try {
      console.log("🎯 Determinando grado automático para estudiante:", student.id)

      const recordData = await api.get(`/api/matriculas/history/last/${student.id}`)

      if (recordData && recordData.ok && recordData.record) {
        const lastRecord = recordData.record
        console.log("📚 Último registro académico:", lastRecord)

        const lastGrade = lastRecord.gradeAchieved
        const lastGradeId = Number.parseInt(lastRecord.gradeID)

        // Determinar si es repitiente basado en la nota
        const isRepeaterStatus = ["E", "F"].includes(lastGrade) || !lastRecord.isApproved
        setIsRepeater(isRepeaterStatus)

        // Determinar el grado sugerido
        let nextGradeId
        if (isRepeaterStatus) {
          nextGradeId = lastGradeId // Repite el mismo grado
          setAutoGradeInfo(
            `Repitiente - Última nota: ${lastGrade} (${lastRecord.isApproved ? "Aprobado" : "Reprobado"})`,
          )
        } else {
          nextGradeId = lastGradeId + 1 // Avanza al siguiente grado
          setAutoGradeInfo(`Promoción - Última nota: ${lastGrade} (Aprobado)`)
        }

        console.log(`📊 Análisis: Última nota: ${lastGrade}, Grado anterior: ${lastGradeId}`)
        console.log(`📊 Resultado: Próximo grado: ${nextGradeId}, Repitiente: ${isRepeaterStatus}`)

        // Verificar que el grado existe en la lista de grados disponibles
        const gradeExists = gradesData.find((g) => g.id == nextGradeId)
        if (gradeExists) {
          setSuggestedGrade(nextGradeId)

          // Para reintegro, filtrar grados disponibles
          if (tipoInscripcion === "reintegro") {
            const filteredGrades = gradesData.filter((grade) => grade.id >= nextGradeId)
            setAvailableGrades(filteredGrades)
            console.log("✅ Grados disponibles para reintegro:", filteredGrades)
          }
        } else {
          console.warn("⚠️ El grado calculado no existe en la lista de grados disponibles")
          // Fallback al primer grado disponible
          setSuggestedGrade(gradesData[0]?.id || 1)
          setIsRepeater(false)
          setAutoGradeInfo("Sin historial válido - Asignando primer grado")
        }
      } else {
        console.log("📝 No hay historial académico, asignando primer grado")
        // Si no hay historial, es primer grado y no repitiente
        const firstGrade = gradesData.find((g) => g.name.includes("1er")) || gradesData[0]
        const firstGradeId = firstGrade?.id || 1

        setSuggestedGrade(firstGradeId)
        setIsRepeater(false)
        setAutoGradeInfo("Nuevo estudiante - Sin historial académico previo")
        setAvailableGrades(gradesData)
      }
    } catch (err) {
      console.error("❌ Error determinando grado:", err)

      // Si hay error, asignar primer grado por defecto
      const firstGrade = gradesData.find((g) => g.name.includes("1er")) || gradesData[0]
      const firstGradeId = firstGrade?.id || 1

      setSuggestedGrade(firstGradeId)
      setIsRepeater(false)
      setAutoGradeInfo("Error en análisis - Asignando primer grado por defecto")
      setAvailableGrades(gradesData)
    }
  }

  const addHistoryRecord = () => {
    try {
      if (!currentHistory.gradeID || !currentHistory.institutionName || !currentHistory.academicPeriodID) {
        showError({
          type: "validation",
          msg: "Complete todos los campos del registro académico",
        })
        return
      }

      // Verificar que no se repita el mismo grado y período
      const isDuplicate = academicHistory.some(
        (record) =>
          record.gradeID === currentHistory.gradeID && record.academicPeriodID === currentHistory.academicPeriodID,
      )

      if (isDuplicate) {
        showError({
          type: "validation",
          msg: "Ya existe un registro para este grado y período académico",
        })
        return
      }

      setAcademicHistory((prev) => [...prev, { ...currentHistory }])
      setCurrentHistory({
        academicPeriodID: 0,
        gradeID: 0,
        institutionName: "",
        gradeAchieved: "A",
        isApproved: true,
      })
      setSuccess("Registro académico agregado exitosamente")
      console.log("✅ Registro académico agregado")
    } catch (err) {
      handleError(err, "Agregar registro académico")
    }
  }

  const removeHistoryRecord = (index) => {
    try {
      setAcademicHistory((prev) => prev.filter((_, i) => i !== index))
      setSuccess("Registro académico eliminado")
      console.log("🗑️ Registro académico eliminado")
    } catch (err) {
      handleError(err, "Eliminar registro académico")
    }
  }

  const saveAcademicHistory = async () => {
    setLoading(true)

    try {
      console.log("💾 Guardando historial académico...")

      // Guardar cada registro del historial académico
      for (const history of academicHistory) {
        const response = await api.post("/api/students/registry/academicHistory", {
          body: {
            studentID: student.id,
            ...history,
          },
        })

        if (!response || !response.ok) {
          throw new Error(response?.msg || "Error al guardar el historial académico")
        }
      }

      setSuccess("Historial académico guardado exitosamente")
      console.log("✅ Historial académico guardado exitosamente")

      setTimeout(() => {
        onHistoryCompleted(academicHistory.length > 0)
      }, 1500)
    } catch (err) {
      console.error("❌ Error guardando historial:", err)
      handleError(err, "Guardar historial académico")
    } finally {
      setLoading(false)
    }
  }

  const handleContinueWithoutHistory = () => {
    try {
      console.log("➡️ Continuando sin historial académico")
      onHistoryCompleted(false)
    } catch (err) {
      handleError(err, "Continuar sin historial")
    }
  }

  const getTitle = () => {
    switch (tipoInscripcion) {
      case "nuevo":
        return "Validación de Estudios Previos - Nuevo Ingreso"
      case "reintegro":
        return "Historial Académico - Reintegro"
      default:
        return "Validación de Estudios Previos"
    }
  }

  const getDescription = () => {
    switch (tipoInscripcion) {
      case "nuevo":
        return "¿El estudiante ha cursado años escolares anteriormente en otra institución?"
      case "reintegro":
        return "Registre los años escolares que cursó el estudiante fuera de la institución"
      default:
        return "Información sobre estudios previos"
    }
  }

  const getGradeName = (gradeId) => {
    const grade = grades.find((g) => g.id === gradeId)
    return grade ? grade.name : "No encontrado"
  }

  const getPeriodName = (periodId) => {
    const period = academicPeriods.find((p) => p.id === periodId)
    return period ? period.name : "No encontrado"
  }

  const getSuggestedGradeName = () => {
    if (!suggestedGrade || !grades.length) return "Calculando..."
    const grade = grades.find((g) => g.id === suggestedGrade)
    return grade ? grade.name : "No encontrado"
  }

  return (
    <div className="min-vh-100 bg-body-tertiary py-4">
      <CContainer>
        <div className="mb-4">
          <h2 className="text-center text-body-emphasis">{getTitle()}</h2>
          <p className="text-center text-body-secondary">{getDescription()}</p>
        </div>

        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
            <CIcon icon={cilCheckCircle} className="me-2" />
            {success}
          </CAlert>
        )}



        <CCard className="shadow">
          <CCardHeader className="bg-primary text-white">
            <h4 className="mb-0">
              <CIcon icon={cilEducation} className="me-2" />
              Estudiante: {student.name} {student.lastName}
            </h4>
          </CCardHeader>
          <CCardBody>
            {/* Información de Grado Automático */}
            {suggestedGrade && (
              <CAlert color={isRepeater ? "warning" : "info"} className="mb-4">
                <div className="d-flex align-items-center">
                  <CIcon icon={cilCog} className="me-2" />
                  <div>
                    <h6 className="mb-1">
                      <strong>Grado Sugerido Automáticamente:</strong> {getSuggestedGradeName()}
                    </h6>
                    <small>{autoGradeInfo}</small>
                  </div>
                </div>
              </CAlert>
            )}

            {/* Para nuevo ingreso: pregunta si tiene estudios previos */}
            {tipoInscripcion === "nuevo" && hasPreviousStudies === null && (
              <div className="text-center">
                <h5 className="mb-4">{getDescription()}</h5>
                <div className="d-flex justify-content-center gap-3">
                  <CButton color="success" size="lg" onClick={() => setHasPreviousStudies(true)}>
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    Sí, tiene estudios previos
                  </CButton>
                  <CButton color="info" size="lg" onClick={() => setHasPreviousStudies(false)}>
                    <CIcon icon={cilInfo} className="me-2" />
                    No, no tiene estudios previos
                  </CButton>
                </div>
              </div>
            )}

            {/* Para nuevo ingreso sin estudios previos */}
            {tipoInscripcion === "nuevo" && hasPreviousStudies === false && (
              <div className="text-center">
                <CAlert color="info">
                  <CIcon icon={cilInfo} className="me-2" />
                  <h5>Sin Estudios Previos</h5>
                  <p>El estudiante no tiene estudios previos registrados. Puede continuar con la inscripción.</p>
                  {suggestedGrade && (
                    <p>
                      <strong>Grado asignado:</strong> {getSuggestedGradeName()}
                    </p>
                  )}
                </CAlert>
                <div className="d-flex justify-content-between">
                  <CButton color="secondary" onClick={onBack}>
                    Volver
                  </CButton>
                  <CButton color="primary" onClick={handleContinueWithoutHistory}>
                    Continuar con la Inscripción
                  </CButton>
                </div>
              </div>
            )}

            {/* Para nuevo ingreso con estudios previos O para reintegro */}
            {((tipoInscripcion === "nuevo" && hasPreviousStudies === true) || tipoInscripcion === "reintegro") && (
              <>
                <CAlert color="warning">
                  <CIcon icon={cilWarning} className="me-2" />
                  <h5>Registrar Historial Académico</h5>
                  <p>
                    {tipoInscripcion === "reintegro"
                      ? "Complete la información de los años escolares cursados fuera de la institución."
                      : "Complete la información de los años escolares cursados anteriormente."}
                  </p>
                  {tipoInscripcion === "reintegro" && suggestedGrade && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-info">
                        <strong>Grado sugerido:</strong> {getSuggestedGradeName()} - {autoGradeInfo}
                      </small>
                    </div>
                  )}
                </CAlert>

                <CCard className="mb-4 border-info">
                  <CCardHeader className="bg-info text-white">
                    <h5 className="mb-0">Agregar Registro Académico</h5>
                  </CCardHeader>
                  <CCardBody>
                    <CForm>
                      <CRow className="mb-3">
                        <CCol md={3}>
                          <CFormLabel className="fw-semibold">Período Académico</CFormLabel>
                          <CFormSelect
                            value={currentHistory.academicPeriodID}
                            onChange={(e) =>
                              setCurrentHistory((prev) => ({
                                ...prev,
                                academicPeriodID: Number.parseInt(e.target.value),
                              }))
                            }
                          >
                            <option value={0}>Seleccionar...</option>
                            {academicPeriods.map((period) => (
                              <option key={period.id} value={period.id}>
                                {period.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={3}>
                          <CFormLabel className="fw-semibold">Grado Cursado</CFormLabel>
                          <CFormSelect
                            value={currentHistory.gradeID}
                            onChange={(e) =>
                              setCurrentHistory((prev) => ({
                                ...prev,
                                gradeID: Number.parseInt(e.target.value),
                              }))
                            }
                          >
                            <option value={0}>Seleccionar...</option>
                            {availableGrades.map((grade) => (
                              <option key={grade.id} value={grade.id}>
                                {grade.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel className="fw-semibold">Institución</CFormLabel>
                          <CFormInput
                            type="text"
                            value={currentHistory.institutionName}
                            onChange={(e) =>
                              setCurrentHistory((prev) => ({
                                ...prev,
                                institutionName: e.target.value,
                              }))
                            }
                            placeholder="Nombre de la institución"
                          />
                        </CCol>
                        <CCol md={2}>
                          <CFormLabel className="fw-semibold">Nota Final</CFormLabel>
                          <CFormSelect
                            value={currentHistory.gradeAchieved}
                            onChange={(e) =>
                              setCurrentHistory((prev) => ({
                                ...prev,
                                gradeAchieved: e.target.value,
                                isApproved: !["E", "F"].includes(e.target.value),
                              }))
                            }
                          >
                            <option value="A">A (Excelente)</option>
                            <option value="B">B (Muy Bueno)</option>
                            <option value="C">C (Bueno)</option>
                            <option value="D">D (Regular)</option>
                            <option value="E">E (Deficiente)</option>
                            <option value="F">F (Muy Deficiente)</option>
                          </CFormSelect>
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CCol md={6}>
                          <small className={`text-${currentHistory.isApproved ? "success" : "danger"}`}>
                            <strong>Estado:</strong> {currentHistory.isApproved ? "Aprobado" : "Reprobado"}
                            {!currentHistory.isApproved && " (Notas E y F son reprobatorias)"}
                          </small>
                        </CCol>
                        <CCol md={6} className="text-end">
                          <CButton color="success" onClick={addHistoryRecord}>
                            <CIcon icon={cilPlus} className="me-2" />
                            Agregar Registro
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>

                {academicHistory.length > 0 && (
                  <CCard className="mb-4 border-success">
                    <CCardHeader className="bg-success text-white">
                      <h5 className="mb-0">Historial Académico Registrado ({academicHistory.length})</h5>
                    </CCardHeader>
                    <CCardBody>
                      <CTable striped hover responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Período</CTableHeaderCell>
                            <CTableHeaderCell>Grado</CTableHeaderCell>
                            <CTableHeaderCell>Institución</CTableHeaderCell>
                            <CTableHeaderCell>Nota</CTableHeaderCell>
                            <CTableHeaderCell>Estado</CTableHeaderCell>
                            <CTableHeaderCell>Acciones</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {academicHistory.map((record, index) => (
                            <CTableRow key={index}>
                              <CTableDataCell>{getPeriodName(record.academicPeriodID)}</CTableDataCell>
                              <CTableDataCell>{getGradeName(record.gradeID)}</CTableDataCell>
                              <CTableDataCell>{record.institutionName}</CTableDataCell>
                              <CTableDataCell>
                                <CBadge
                                  color={
                                    record.gradeAchieved === "A"
                                      ? "success"
                                      : record.gradeAchieved === "B"
                                        ? "info"
                                        : record.gradeAchieved === "C"
                                          ? "warning"
                                          : "danger"
                                  }
                                >
                                  {record.gradeAchieved}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>
                                <CBadge color={record.isApproved ? "success" : "danger"}>
                                  {record.isApproved ? "Aprobado" : "Reprobado"}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>
                                <CButton
                                  color="danger"
                                  size="sm"
                                  onClick={() => removeHistoryRecord(index)}
                                  title="Eliminar registro"
                                >
                                  <CIcon icon={cilTrash} />
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </CCardBody>
                  </CCard>
                )}

                <div className="d-flex justify-content-between">
                  <CButton color="secondary" onClick={onBack}>
                    Volver
                  </CButton>
                  <div>
                    {tipoInscripcion === "nuevo" && (
                      <CButton color="warning" className="me-2" onClick={() => setHasPreviousStudies(null)}>
                        Cambiar Respuesta
                      </CButton>
                    )}
                    <CButton
                      color="primary"
                      onClick={saveAcademicHistory}
                      disabled={loading || academicHistory.length === 0}
                    >
                      {loading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilCheckCircle} className="me-2" />
                          Continuar con la Inscripción
                        </>
                      )}
                    </CButton>
                  </div>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </div>
  )
}
