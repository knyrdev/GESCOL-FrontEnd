"use client"
import { useState, useEffect } from "react"
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CPagination,
  CPaginationItem,
  CToast,
  CToastBody,
  CToaster,
  CProgress,
  CCardFooter,
  CAlert,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import {
  cilGroup,
  cilPlus,
  cilPencil,
  cilTrash,
  cilUser,
  cilUserPlus,
  cilSearch,
  cilX,
  cilInfo,
  cilCheckCircle,
  cilWarning,
  cilPeople,
  cilSchool,
  cilCalendar,
  cilReload,
  cilUserFollow,
  cilPrint,
} from "@coreui/icons"
import { helpFetch } from "../../../api/helpFetch"

const BrigadeManagement = () => {
  // Estados principales
  const [brigades, setBrigades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados para períodos académicos
  const [academicPeriods, setAcademicPeriods] = useState([])
  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(null)

  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredBrigades, setFilteredBrigades] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [brigadesPerPage] = useState(8)

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false)
  const [showEnrollStudentsModal, setShowEnrollStudentsModal] = useState(false)

  // Estados para datos seleccionados
  const [selectedBrigade, setSelectedBrigade] = useState(null)
  const [brigadeStudents, setBrigadeStudents] = useState([])
  const [availableTeachers, setAvailableTeachers] = useState([])
  const [availableStudents, setAvailableStudents] = useState([])

  // Estados para formularios
  const [brigadeForm, setBrigadeForm] = useState({
    name: "",
  })

  const [teacherForm, setTeacherForm] = useState({
    personalId: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  const [studentForm, setStudentForm] = useState({
    studentIds: [],
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados para PDFs
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingBrigadePdf, setDownloadingBrigadePdf] = useState({})

  // Estados para toasts
  const [toasts, setToasts] = useState([])

  // Instancia de API
  const api = helpFetch()

  // Función para agregar toast
  const addToast = (message, color = "success") => {
    const id = Date.now()
    const newToast = {
      id,
      message,
      color,
      show: true,
    }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  // Recargar brigadas cuando cambie el período seleccionado
  useEffect(() => {
    if (selectedPeriod) {
      loadBrigades()
      loadAvailableTeachers()
      loadAvailableStudents()
    }
  }, [selectedPeriod])

  // Filtrar brigadas cuando cambie el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBrigades(brigades)
    } else {
      const filtered = brigades.filter(
        (brigade) =>
          brigade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (brigade.encargado_name &&
            `${brigade.encargado_name} ${brigade.encargado_lastName}`.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredBrigades(filtered)
    }
    setCurrentPage(1)
  }, [searchTerm, brigades])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Cargando datos iniciales...")

      // Cargar períodos académicos
      const periodsResponse = await api.get("/api/matriculas/academic-periods")
      if (periodsResponse.ok) {
        setAcademicPeriods(periodsResponse.periods || [])

        // Buscar período actual
        const current = periodsResponse.periods?.find((p) => p.is_current) || periodsResponse.periods?.[0]
        if (current) {
          setCurrentPeriod(current)
          setSelectedPeriod(current.id)
        }
      }
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error)
      setError(`Error al cargar datos iniciales: ${error.msg || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadBrigades = async () => {
    try {
      setError(null)

      console.log("🔄 Cargando brigadas para período:", selectedPeriod)

      const params = selectedPeriod ? `?academicPeriodId=${selectedPeriod}` : ""
      const response = await api.get(`/api/brigadas${params}`)

      if (response.ok) {
        setBrigades(response.brigades || [])
        console.log("✅ Brigadas cargadas:", response.brigades?.length || 0)
      } else {
        throw new Error(response.msg || "Error al cargar brigadas")
      }
    } catch (error) {
      console.error("❌ Error cargando brigadas:", error)
      setError(`Error al cargar brigadas: ${error.msg || error.message}`)
    }
  }

  const loadAvailableTeachers = async () => {
    try {
      console.log("🔄 Cargando docentes disponibles...")
      const params = selectedPeriod ? `?academicPeriodId=${selectedPeriod}` : ""
      const response = await api.get(`/api/brigadas/available-teachers${params}`)
      if (response.ok) {
        setAvailableTeachers(response.teachers || [])
        console.log("✅ Docentes disponibles cargados:", response.teachers?.length || 0)
      } else {
        console.warn("⚠️ Error cargando docentes:", response.msg)
        setAvailableTeachers([])
      }
    } catch (error) {
      console.error("❌ Error cargando docentes:", error)
      setAvailableTeachers([])
    }
  }

  const loadAvailableStudents = async () => {
    try {
      console.log("🔄 Cargando estudiantes disponibles...")
      const params = selectedPeriod ? `?academicPeriodId=${selectedPeriod}` : ""
      const response = await api.get(`/api/brigadas/available-students${params}`)
      if (response.ok) {
        setAvailableStudents(response.students || [])
        console.log("✅ Estudiantes disponibles cargados:", response.students?.length || 0)
      } else {
        console.warn("⚠️ Error cargando estudiantes:", response.msg)
        setAvailableStudents([])
      }
    } catch (error) {
      console.error("❌ Error cargando estudiantes:", error)
      setAvailableStudents([])
    }
  }

  const loadBrigadeStudents = async (brigadeId) => {
    try {
      console.log(`🔄 Cargando estudiantes de brigada ${brigadeId}...`)
      const params = selectedPeriod ? `?academicPeriodId=${selectedPeriod}` : ""
      const response = await api.get(`/api/brigadas/${brigadeId}/students${params}`)
      if (response.ok) {
        setBrigadeStudents(response.students || [])
        console.log("✅ Estudiantes de brigada cargados:", response.students?.length || 0)
      } else {
        console.warn("⚠️ Error cargando estudiantes de brigada:", response.msg)
        setBrigadeStudents([])
      }
    } catch (error) {
      console.error("❌ Error cargando estudiantes de brigada:", error)
      setBrigadeStudents([])
    }
  }

  const validateBrigadeForm = () => {
    const errors = {}

    if (!brigadeForm.name.trim()) {
      errors.name = "El nombre de la brigada es requerido"
    } else if (brigadeForm.name.length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres"
    } else if (brigadeForm.name.length > 100) {
      errors.name = "El nombre es demasiado largo (máximo 100 caracteres)"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateBrigade = async () => {
    try {
      if (!validateBrigadeForm()) return

      setIsSubmitting(true)
      setError(null)

      console.log("➕ Creando brigada...")

      const response = await api.post("/api/brigadas", {
        body: brigadeForm,
      })

      if (response.ok) {
        addToast("Brigada creada exitosamente", "success")
        setShowCreateModal(false)
        resetBrigadeForm()
        await loadBrigades()
        console.log("✅ Brigada creada")
      } else {
        addToast(response.msg || "Error al crear brigada", "danger")
      }
    } catch (error) {
      console.error("❌ Error creando brigada:", error)
      addToast(`Error de conexión: ${error.msg || error.message}`, "danger")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateBrigade = async () => {
    try {
      if (!validateBrigadeForm()) return

      setIsSubmitting(true)
      setError(null)

      console.log("✏️ Actualizando brigada...")

      const response = await api.put(
        "/api/brigadas",
        {
          body: brigadeForm,
        },
        selectedBrigade.id,
      )

      if (response.ok) {
        addToast("Brigada actualizada exitosamente", "success")
        setShowEditModal(false)
        resetBrigadeForm()
        await loadBrigades()
        console.log("✅ Brigada actualizada")
      } else {
        addToast(response.msg || "Error al actualizar brigada", "danger")
      }
    } catch (error) {
      console.error("❌ Error actualizando brigada:", error)
      addToast(`Error de conexión: ${error.msg || error.message}`, "danger")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBrigade = async () => {
    try {
      if (!selectedBrigade) return

      setIsSubmitting(true)
      setError(null)

      console.log("🗑️ Eliminando brigada...")

      const response = await api.delet("/api/brigadas", selectedBrigade.id)

      if (response.ok) {
        addToast("Brigada eliminada exitosamente", "success")
        setShowDeleteModal(false)
        setSelectedBrigade(null)
        await loadBrigades()
        await loadAvailableStudents()
        console.log("✅ Brigada eliminada")
      } else {
        addToast(response.msg || "Error al eliminar brigada", "danger")
      }
    } catch (error) {
      console.error("❌ Error eliminando brigada:", error)
      addToast(`Error de conexión: ${error.msg || error.message}`, "danger")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAssignTeacher = async () => {
    try {
      if (!teacherForm.personalId) {
        addToast("Debe seleccionar un docente", "warning")
        return
      }

      setIsSubmitting(true)
      setError(null)

      console.log("👨‍🏫 Asignando docente...")

      const response = await api.post(`/api/brigadas/${selectedBrigade.id}/teacher`, {
        body: {
          personalId: Number.parseInt(teacherForm.personalId),
          startDate: teacherForm.startDate,
          academicPeriodId: selectedPeriod,
        },
      })

      if (response.ok) {
        addToast("Docente asignado exitosamente", "success")
        setShowAssignTeacherModal(false)
        resetTeacherForm()
        await loadBrigades()
        await loadAvailableTeachers()
        console.log("✅ Docente asignado")
      } else {
        addToast(response.msg || "Error al asignar docente", "danger")
      }
    } catch (error) {
      console.error("❌ Error asignando docente:", error)
      addToast(`Error de conexión: ${error.msg || error.message}`, "danger")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnrollStudents = async () => {
    try {
      if (studentForm.studentIds.length === 0) {
        addToast("Debe seleccionar al menos un estudiante", "warning")
        return
      }

      setIsSubmitting(true)
      setError(null)

      console.log("👥 Inscribiendo estudiantes...")

      const response = await api.post(`/api/brigadas/${selectedBrigade.id}/students`, {
        body: {
          studentIds: studentForm.studentIds.map((id) => Number.parseInt(id)),
          academicPeriodId: selectedPeriod,
        },
      })

      if (response.ok) {
        const enrolled = response.result?.studentsEnrolled || studentForm.studentIds.length
        const total = response.result?.totalRequested || studentForm.studentIds.length
        addToast(`${enrolled} de ${total} estudiantes inscritos exitosamente`, "success")
        setShowEnrollStudentsModal(false)
        resetStudentForm()
        await loadBrigades()
        await loadAvailableStudents()
        console.log("✅ Estudiantes inscritos")
      } else {
        addToast(response.msg || "Error al inscribir estudiantes", "danger")
      }
    } catch (error) {
      console.error("❌ Error inscribiendo estudiantes:", error)
      addToast(`Error de conexión: ${error.msg || error.message}`, "danger")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearBrigade = async (brigade) => {
    try {
      if (
        !window.confirm(
          `¿Está seguro de que desea limpiar la brigada "${brigade.name}"? Esto removerá todos los estudiantes del período actual.`,
        )
      ) {
        return
      }

      setError(null)

      console.log("🧹 Limpiando brigada...")

      const response = await api.post(`/api/brigadas/${brigade.id}/students`, {
        body: { academicPeriodId: selectedPeriod },
      })

      if (response.ok) {
        addToast(
          `Brigada limpiada exitosamente. ${response.result?.studentsRemoved || 0} estudiantes removidos.`,
          "success",
        )
        await loadBrigades()
        await loadAvailableStudents()
        console.log("✅ Brigada limpiada")
      } else {
        addToast(response.msg || "Error al limpiar brigada", "danger")
      }
    } catch (error) {
      console.error("❌ Error limpiando brigada:", error)
      addToast(`Error de conexión: ${error.msg || error.message}`, "danger")
    }
  }

  const handleRemoveTeacher = async (brigade) => {
    try {
      if (
        !window.confirm(
          `¿Está seguro de que desea remover el docente de la brigada "${brigade.name}" para el período actual?`,
        )
      ) {
        return
      }

      setError(null)

      console.log("👨‍🏫 Removiendo docente...")

      const response = await api.post(`/api/brigadas/${brigade.id}/teacher`, {
        body: { academicPeriodId: selectedPeriod },
      })

      if (response.ok) {
        addToast("Docente removido exitosamente", "success")
        await loadBrigades()
        await loadAvailableTeachers()
        console.log("✅ Docente removido")
      } else {
        addToast(response.msg || "Error al remover docente", "danger")
      }
    } catch (error) {
      console.error("❌ Error removiendo docente:", error)
      addToast(`Error de conexión: ${error.msg || error.message}`, "danger")
    }
  }

  const resetBrigadeForm = () => {
    setBrigadeForm({ name: "" })
    setFormErrors({})
  }

  const resetTeacherForm = () => {
    setTeacherForm({
      personalId: "",
      startDate: new Date().toISOString().split("T")[0],
    })
  }

  const resetStudentForm = () => {
    setStudentForm({ studentIds: [] })
  }

  const handleDownloadBrigadesPdf = async () => {
    try {
      setDownloadingPdf(true)
      const blob = await api.downloadFile("/api/pdf/brigades/list")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "Listado_General_Brigadas.pdf")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      addToast("PDF listado de brigadas generado con éxito", "success")
    } catch (error) {
      console.error("❌ Error descargando PDF de brigadas:", error)
      addToast("Error al generar el PDF de brigadas", "danger")
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleDownloadBrigadeDetailsPdf = async (brigade) => {
    try {
      setDownloadingBrigadePdf((prev) => ({ ...prev, [brigade.id]: true }))
      const blob = await api.downloadFile(`/api/pdf/brigades/${brigade.id}/details`)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Detalle_Brigada_${brigade.name.replace(/\s+/g, "_")}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      addToast(`PDF de la brigada ${brigade.name} generado con éxito`, "success")
    } catch (error) {
      console.error("❌ Error descargando PDF de detalle de brigada:", error)
      addToast(`Error al generar el PDF de la brigada ${brigade.name}`, "danger")
    } finally {
      setDownloadingBrigadePdf((prev) => ({ ...prev, [brigade.id]: false }))
    }
  }

  const openCreateModal = () => {
    resetBrigadeForm()
    setShowCreateModal(true)
  }

  const openEditModal = (brigade) => {
    setSelectedBrigade(brigade)
    setBrigadeForm({ name: brigade.name })
    setFormErrors({})
    setShowEditModal(true)
  }

  const openDeleteModal = (brigade) => {
    setSelectedBrigade(brigade)
    setShowDeleteModal(true)
  }

  const openDetailsModal = async (brigade) => {
    setSelectedBrigade(brigade)
    await loadBrigadeStudents(brigade.id)
    setShowDetailsModal(true)
  }

  const openAssignTeacherModal = (brigade) => {
    setSelectedBrigade(brigade)
    resetTeacherForm()
    setShowAssignTeacherModal(true)
  }

  const openEnrollStudentsModal = (brigade) => {
    setSelectedBrigade(brigade)
    resetStudentForm()
    setShowEnrollStudentsModal(true)
  }

  const handleStudentSelection = (studentId) => {
    const currentIds = studentForm.studentIds
    const numericId = Number.parseInt(studentId)

    if (currentIds.includes(numericId)) {
      setStudentForm({
        studentIds: currentIds.filter((id) => id !== numericId),
      })
    } else {
      setStudentForm({
        studentIds: [...currentIds, numericId],
      })
    }
  }

  // Calcular brigadas para la página actual
  const indexOfLastBrigade = currentPage * brigadesPerPage
  const indexOfFirstBrigade = indexOfLastBrigade - brigadesPerPage
  const currentBrigades = filteredBrigades.slice(indexOfFirstBrigade, indexOfLastBrigade)
  const totalPages = Math.ceil(filteredBrigades.length / brigadesPerPage)

  // Calcular estadísticas
  const totalStudents = brigades.reduce((sum, brigade) => sum + (Number.parseInt(brigade.studentCount) || 0), 0)
  const brigadesWithTeacher = brigades.filter((b) => b.encargado_name).length
  const brigadesWithoutTeacher = brigades.length - brigadesWithTeacher

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <CSpinner color="primary" size="lg" />
          <div className="mt-3">
            <h5>Cargando sistema de brigadas...</h5>
            <p className="text-muted">Inicializando períodos académicos y datos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toast Container */}
      <CToaster position="top-end">
        {toasts.map((toast) => (
          <CToast key={toast.id} visible={toast.show} color={toast.color} className="text-white align-items-center">
            <div className="d-flex">
              <CToastBody>{toast.message}</CToastBody>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              ></button>
            </div>
          </CToast>
        ))}
      </CToaster>

      {/* Alertas */}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <strong>❌ Error:</strong> {error}
        </CAlert>
      )}

      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
          <strong>✅ Éxito:</strong> {success}
        </CAlert>
      )}

      {/* Selector de Período Académico */}
      <CCard className="mb-4 border-primary">
        <CCardHeader className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">
                <CIcon icon={cilCalendar} className="me-2" />
                Período Académico Activo
              </h6>
              <small>Seleccione el período para gestionar las brigadas</small>
            </div>
            <CBadge color="light" className="text-primary">
              {currentPeriod?.is_current ? "PERÍODO ACTUAL" : "PERÍODO HISTÓRICO"}
            </CBadge>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow className="align-items-center">
            <CCol md={6}>
              <CFormLabel htmlFor="periodSelect" className="fw-semibold">
                Período Académico:
              </CFormLabel>
              <CFormSelect
                id="periodSelect"
                value={selectedPeriod || ""}
                onChange={(e) => setSelectedPeriod(Number.parseInt(e.target.value))}
                size="lg"
              >
                <option value="">Seleccionar período...</option>
                {academicPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                    {" - "}
                    {period.is_current && " (ACTUAL)"}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              {selectedPeriod && (
                <div className="text-end">
                  <div className="fw-semibold text-primary fs-4">{brigades.length}</div>
                  <div className="text-muted">brigadas en este período</div>
                  <div className="fw-semibold text-success fs-5">{totalStudents}</div>
                  <div className="text-muted">estudiantes participando</div>
                </div>
              )}
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Contenido principal solo si hay período seleccionado */}
      {!selectedPeriod ? (
        <CCard>
          <CCardBody className="text-center py-5">
            <CIcon icon={cilCalendar} size="4xl" className="text-muted mb-4" />
            <h4 className="text-muted mb-3">Seleccione un Período Académico</h4>
            <p className="text-muted">
              Para gestionar las brigadas, primero debe seleccionar un período académico en el selector superior.
            </p>
          </CCardBody>
        </CCard>
      ) : (
        <>
          {/* Estadísticas generales */}
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CCard className="text-white bg-primary">
                <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fs-4 fw-semibold">{brigades.length}</div>
                    <div>Total Brigadas</div>
                  </div>
                  <CIcon icon={cilGroup} height={24} />
                </CCardBody>
                <CCardFooter className="px-3 py-2">
                  <div className="text-white-50 small">
                    <CIcon icon={cilCheckCircle} className="me-1" />
                    Período: {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                  </div>
                </CCardFooter>
              </CCard>
            </CCol>
            <CCol sm={6} lg={3}>
              <CCard className="text-white bg-info">
                <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fs-4 fw-semibold">{totalStudents}</div>
                    <div>Total Estudiantes</div>
                  </div>
                  <CIcon icon={cilPeople} height={24} />
                </CCardBody>
                <CCardFooter className="px-3 py-2">
                  <div className="text-white-50 small">
                    <CIcon icon={cilSchool} className="me-1" />
                    En brigadas
                  </div>
                </CCardFooter>
              </CCard>
            </CCol>
            <CCol sm={6} lg={3}>
              <CCard className="text-white bg-success">
                <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fs-4 fw-semibold">{brigadesWithTeacher}</div>
                    <div>Con Docente</div>
                  </div>
                  <CIcon icon={cilUser} height={24} />
                </CCardBody>
                <CCardFooter className="px-3 py-2">
                  <div className="text-white-50 small">
                    <CIcon icon={cilCheckCircle} className="me-1" />
                    Asignados
                  </div>
                </CCardFooter>
              </CCard>
            </CCol>
            <CCol sm={6} lg={3}>
              <CCard className="text-white bg-warning">
                <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fs-4 fw-semibold">{brigadesWithoutTeacher}</div>
                    <div>Sin Docente</div>
                  </div>
                  <CIcon icon={cilWarning} height={24} />
                </CCardBody>
                <CCardFooter className="px-3 py-2">
                  <div className="text-white-50 small">
                    <CIcon icon={cilX} className="me-1" />
                    Pendientes
                  </div>
                </CCardFooter>
              </CCard>
            </CCol>
          </CRow>

          <CCard className="shadow">
            <CCardHeader className=" d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">
                  <CIcon icon={cilGroup} className="me-2" />
                  Gestión de Brigadas - {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                </h5>
                <small className="text-muted">
                  Administra las brigadas estudiantiles y sus docentes encargados para el período seleccionado
                </small>
              </div>
              <div className="d-flex gap-2">
                <CButton color="secondary" variant="outline" onClick={loadBrigades} disabled={loading}>
                  {loading ? <CSpinner size="sm" className="me-1" /> : null}
                  <CIcon icon={cilReload} className="me-1" />
                  Actualizar
                </CButton>
                <CButton color="info" variant="outline" onClick={handleDownloadBrigadesPdf} disabled={downloadingPdf}>
                  {downloadingPdf ? <CSpinner size="sm" className="me-1" /> : <CIcon icon={cilPrint} className="me-1" />}
                  Imprimir Reporte
                </CButton>
                <CButton color="primary" onClick={openCreateModal}>
                  <CIcon icon={cilPlus} className="me-1" />
                  Nueva Brigada
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody>
              {/* Barra de búsqueda */}
              <CRow className="mb-4">
                <CCol md={8}>
                  <CInputGroup size="lg">
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Buscar brigadas por nombre o encargado..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control-lg"
                    />
                    {searchTerm && (
                      <CButton color="secondary" variant="outline" onClick={() => setSearchTerm("")}>
                        <CIcon icon={cilX} />
                      </CButton>
                    )}
                  </CInputGroup>
                </CCol>
                <CCol md={4} className="d-flex align-items-center justify-content-end">
                  <div className="text-end">
                    <div className="fw-semibold">
                      {currentBrigades.length} de {filteredBrigades.length}
                    </div>
                    <small className="text-muted">brigadas mostradas</small>
                  </div>
                </CCol>
              </CRow>

              {/* Grid de brigadas */}
              <CRow className="g-4">
                {currentBrigades.length > 0 ? (
                  currentBrigades.map((brigade) => (
                    <CCol xs={12} sm={6} md={4} lg={3} key={brigade.id}>
                      <CCard className="h-100 shadow-sm border-0 brigade-card">
                        <CCardBody className="d-flex flex-column p-4">
                          <div className="flex-grow-1">
                            {/* Header de la brigada */}
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h6 className="fw-bold text-truncate mb-0" title={brigade.name}>
                                {brigade.name}
                              </h6>
                              <CBadge color={brigade.encargado_name ? "success" : "warning"} shape="rounded-pill">
                                {brigade.encargado_name ? "Asignado" : "Sin docente"}
                              </CBadge>
                            </div>

                            {/* Información del encargado */}
                            <div className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <CIcon icon={cilUser} className="me-2 text-muted" size="sm" />
                                <small className="text-muted">Encargado:</small>
                              </div>
                              <div className="fw-semibold small">
                                {brigade.encargado_name && brigade.encargado_lastName
                                  ? `${brigade.encargado_name} ${brigade.encargado_lastName}`
                                  : "Sin asignar"}
                              </div>
                              {brigade.encargado_ci && <small className="text-muted">CI: {brigade.encargado_ci}</small>}
                            </div>

                            {/* Estadísticas */}
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center">
                                  <CIcon icon={cilPeople} className="me-2 text-primary" size="sm" />
                                  <span className="fw-semibold">{brigade.studentCount || 0}</span>
                                  <small className="text-muted ms-1">estudiantes</small>
                                </div>
                                {brigade.fecha_inicio && (
                                  <div className="d-flex align-items-center">
                                    <CIcon icon={cilCalendar} className="me-1 text-muted" size="sm" />
                                    <small className="text-muted">
                                      {new Date(brigade.fecha_inicio).toLocaleDateString()}
                                    </small>
                                  </div>
                                )}
                              </div>

                              {/* Barra de progreso visual */}
                              <CProgress
                                value={Math.min((brigade.studentCount || 0) * 2, 100)}
                                color="info"
                                height={4}
                                className="mb-2"
                              />
                            </div>
                          </div>

                          {/* Acciones principales */}
                          <div className="d-grid gap-2">
                            <CButton
                              color="info"
                              size="sm"
                              onClick={() => openDetailsModal(brigade)}
                              className="text-white"
                            >
                              <CIcon icon={cilInfo} className="me-1" />
                              Ver Detalles
                            </CButton>

                            <div className="d-flex gap-1">
                              <CButton
                                color="warning"
                                size="sm"
                                onClick={() => openEditModal(brigade)}
                                className="flex-fill"
                                title="Editar brigada"
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>

                              <CButton
                                color="success"
                                size="sm"
                                onClick={() => openAssignTeacherModal(brigade)}
                                className="flex-fill"
                                title="Asignar Docente"
                              >
                                <CIcon icon={cilUser} />
                              </CButton>

                              <CButton
                                color="primary"
                                size="sm"
                                onClick={() => openEnrollStudentsModal(brigade)}
                                className="flex-fill"
                                title="Inscribir Estudiantes"
                              >
                                <CIcon icon={cilUserPlus} />
                              </CButton>

                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => openDeleteModal(brigade)}
                                className="flex-fill"
                                title="Eliminar brigada"
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </div>

                            {/* Acciones adicionales */}
                            {(brigade.encargado_name || brigade.studentCount > 0) && (
                              <div className="d-flex gap-1">
                                {brigade.studentCount > 0 && (
                                  <CButton
                                    color="outline-danger"
                                    size="sm"
                                    onClick={() => handleClearBrigade(brigade)}
                                    className="flex-fill"
                                    title="Limpiar Brigada"
                                  >
                                    <CIcon icon={cilTrash} className="me-1" />
                                    Limpiar
                                  </CButton>
                                )}
                                {brigade.encargado_name && (
                                  <CButton
                                    color="outline-warning"
                                    size="sm"
                                    onClick={() => handleRemoveTeacher(brigade)}
                                    className="flex-fill"
                                    title="Remover Docente"
                                  >
                                    <CIcon icon={cilUserFollow} className="me-1" />
                                    Remover
                                  </CButton>
                                )}
                              </div>
                            )}
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))
                ) : (
                  <CCol xs={12}>
                    <div className="text-center py-5">
                      <CIcon icon={cilGroup} size="4xl" className="text-muted mb-4" />
                      <h4 className="text-muted mb-3">
                        {searchTerm ? "No se encontraron brigadas" : "No hay brigadas registradas"}
                      </h4>
                      <p className="text-muted mb-4">
                        {searchTerm
                          ? "Intenta con otros términos de búsqueda o limpia el filtro"
                          : `No hay brigadas registradas para el período ${academicPeriods.find((p) => p.id === selectedPeriod)?.name}`}
                      </p>
                      {!searchTerm && (
                        <CButton color="primary" size="lg" onClick={openCreateModal}>
                          <CIcon icon={cilPlus} className="me-2" />
                          Crear Primera Brigada
                        </CButton>
                      )}
                      {searchTerm && (
                        <CButton color="secondary" onClick={() => setSearchTerm("")}>
                          <CIcon icon={cilX} className="me-2" />
                          Limpiar Búsqueda
                        </CButton>
                      )}
                    </div>
                  </CCol>
                )}
              </CRow>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <CPagination size="lg">
                    <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                      Anterior
                    </CPaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <CPaginationItem
                        key={index + 1}
                        active={currentPage === index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </CPaginationItem>
                    ))}
                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </CPaginationItem>
                  </CPagination>
                </div>
              )}
            </CCardBody>
          </CCard>
        </>
      )}

      {/* Modales - Solo se muestran si hay período seleccionado */}
      {selectedPeriod && (
        <>
          {/* Modal Crear Brigada */}
          <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} backdrop="static" size="lg">
            <CModalHeader className="bg-primary text-white">
              <CModalTitle>
                <CIcon icon={cilPlus} className="me-2" />
                Crear Nueva Brigada
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              <CForm>
                <div className="mb-4">
                  <CFormLabel htmlFor="brigadeName" className="fw-semibold">
                    Nombre de la Brigada *
                  </CFormLabel>
                  <CFormInput
                    id="brigadeName"
                    type="text"
                    value={brigadeForm.name}
                    onChange={(e) => setBrigadeForm({ ...brigadeForm, name: e.target.value })}
                    invalid={!!formErrors.name}
                    placeholder="Ej: Brigada Ecológica, Brigada de Seguridad..."
                    size="lg"
                  />
                  {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  <small className="text-muted">
                    El nombre debe ser único y descriptivo de la función de la brigada
                  </small>
                </div>
                <div className="alert alert-info">
                  <CIcon icon={cilInfo} className="me-2" />
                  <strong>Período:</strong> {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                  <br />
                  La brigada se creará para el período académico seleccionado.
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter className="bg-light">
              <CButton color="secondary" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                Cancelar
              </CButton>
              <CButton color="primary" onClick={handleCreateBrigade} disabled={isSubmitting}>
                {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilPlus} className="me-2" />}
                Crear Brigada
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Editar Brigada */}
          <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} backdrop="static" size="lg">
            <CModalHeader className="bg-warning text-white">
              <CModalTitle>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Brigada
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              <CForm>
                <div className="mb-4">
                  <CFormLabel htmlFor="editBrigadeName" className="fw-semibold">
                    Nombre de la Brigada *
                  </CFormLabel>
                  <CFormInput
                    id="editBrigadeName"
                    type="text"
                    value={brigadeForm.name}
                    onChange={(e) => setBrigadeForm({ ...brigadeForm, name: e.target.value })}
                    invalid={!!formErrors.name}
                    placeholder="Ej: Brigada Ecológica, Brigada de Seguridad..."
                    size="lg"
                  />
                  {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter className="bg-light">
              <CButton color="secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
                Cancelar
              </CButton>
              <CButton color="warning" onClick={handleUpdateBrigade} disabled={isSubmitting}>
                {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilPencil} className="me-2" />}
                Actualizar
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Eliminar Brigada */}
          <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static">
            <CModalHeader className="bg-danger text-white">
              <CModalTitle>
                <CIcon icon={cilWarning} className="me-2" />
                Confirmar Eliminación
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              <div className="text-center">
                <CIcon icon={cilWarning} size="3xl" className="text-danger mb-3" />
                <h5>¿Está seguro de eliminar esta brigada?</h5>
                <p className="mb-3">
                  Se eliminará permanentemente la brigada <strong>"{selectedBrigade?.name}"</strong>
                </p>
                <div className="alert alert-danger">
                  <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer y eliminará:
                  <ul className="mt-2 mb-0 text-start">
                    <li>La brigada y toda su información</li>
                    <li>Las asignaciones de docentes de todos los períodos</li>
                    <li>Las inscripciones de estudiantes de todos los períodos</li>
                  </ul>
                </div>
              </div>
            </CModalBody>
            <CModalFooter className="bg-light">
              <CButton color="secondary" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>
                Cancelar
              </CButton>
              <CButton color="danger" onClick={handleDeleteBrigade} disabled={isSubmitting}>
                {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilTrash} className="me-2" />}
                Eliminar Definitivamente
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Detalles de Brigada */}
          <CModal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="xl">
            <CModalHeader className="bg-info text-white">
              <CModalTitle>
                <CIcon icon={cilInfo} className="me-2" />
                Detalles de Brigada: {selectedBrigade?.name}
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              {selectedBrigade && (
                <>
                  {/* Información General */}
                  <CCard className="mb-4">
                    <CCardHeader className="bg-light">
                      <h6 className="mb-0">
                        <CIcon icon={cilGroup} className="me-2" />
                        Información General - {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                      </h6>
                    </CCardHeader>
                    <CCardBody>
                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <strong>Nombre:</strong>
                            <div className="text-muted">{selectedBrigade.name}</div>
                          </div>
                          <div className="mb-3">
                            <strong>Total de Estudiantes:</strong>
                            <CBadge color="primary" className="ms-2">
                              {selectedBrigade.studentCount || 0}
                            </CBadge>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <strong>Encargado:</strong>
                            <div className="text-muted">
                              {selectedBrigade.encargado_name && selectedBrigade.encargado_lastName
                                ? `${selectedBrigade.encargado_name} ${selectedBrigade.encargado_lastName}`
                                : "Sin asignar"}
                            </div>
                            {selectedBrigade.encargado_ci && (
                              <small className="text-muted">CI: {selectedBrigade.encargado_ci}</small>
                            )}
                          </div>
                          <div className="mb-3">
                            <strong>Fecha de Inicio:</strong>
                            <div className="text-muted">
                              {selectedBrigade.fecha_inicio
                                ? new Date(selectedBrigade.fecha_inicio).toLocaleDateString("es-ES")
                                : "No especificada"}
                            </div>
                          </div>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>

                  {/* Lista de Estudiantes */}
                  <CCard>
                    <CCardHeader className="bg-light d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <CIcon icon={cilPeople} className="me-2" />
                        Estudiantes Inscritos ({brigadeStudents.length})
                      </h6>
                      {brigadeStudents.length > 0 && (
                        <CBadge color="success">
                          {brigadeStudents.filter((s) => s.sex === "Masculino").length}M /
                          {brigadeStudents.filter((s) => s.sex === "Femenino").length}F
                        </CBadge>
                      )}
                    </CCardHeader>
                    <CCardBody>
                      {brigadeStudents.length > 0 ? (
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                          <CTable striped hover responsive>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>#</CTableHeaderCell>
                                <CTableHeaderCell>Nombre Completo</CTableHeaderCell>
                                <CTableHeaderCell>C.I.</CTableHeaderCell>
                                <CTableHeaderCell>Sexo</CTableHeaderCell>
                                <CTableHeaderCell>Grado</CTableHeaderCell>
                                <CTableHeaderCell>Sección</CTableHeaderCell>
                                <CTableHeaderCell>Fecha Inscripción</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {brigadeStudents.map((student, index) => (
                                <CTableRow key={student.id || index}>
                                  <CTableDataCell>{index + 1}</CTableDataCell>
                                  <CTableDataCell>
                                    <div className="fw-semibold">
                                      {student.name} {student.lastName}
                                    </div>
                                  </CTableDataCell>
                                  <CTableDataCell>{student.ci || "N/A"}</CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color={student.sex === "Masculino" ? "info" : "warning"}>
                                      {student.sex || "N/A"}
                                    </CBadge>
                                  </CTableDataCell>
                                  <CTableDataCell>{student.grade_name || "N/A"}</CTableDataCell>
                                  <CTableDataCell>{student.section_name || "N/A"}</CTableDataCell>
                                  <CTableDataCell>
                                    {student.assignmentDate
                                      ? new Date(student.assignmentDate).toLocaleDateString("es-ES")
                                      : "N/A"}
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                          </CTable>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CIcon icon={cilPeople} size="3xl" className="text-muted mb-3" />
                          <h6 className="text-muted">No hay estudiantes inscritos</h6>
                          <p className="text-muted">
                            Esta brigada aún no tiene estudiantes asignados para este período.
                          </p>
                          <CButton
                            color="primary"
                            onClick={() => {
                              setShowDetailsModal(false)
                              openEnrollStudentsModal(selectedBrigade)
                            }}
                          >
                            <CIcon icon={cilUserPlus} className="me-2" />
                            Inscribir Estudiantes
                          </CButton>
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                </>
              )}
            </CModalBody>
            <CModalFooter className="bg-light">
              <CButton color="info" onClick={() => handleDownloadBrigadeDetailsPdf(selectedBrigade)} disabled={downloadingBrigadePdf[selectedBrigade?.id]}>
                {downloadingBrigadePdf[selectedBrigade?.id] ? (
                  <CSpinner size="sm" className="me-2" />
                ) : (
                  <CIcon icon={cilPrint} className="me-2" />
                )}
                Imprimir Detalles
              </CButton>
              <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>
                Cerrar
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Asignar Docente */}
          <CModal
            visible={showAssignTeacherModal}
            onClose={() => setShowAssignTeacherModal(false)}
            backdrop="static"
            size="lg"
          >
            <CModalHeader className="bg-success text-white">
              <CModalTitle>
                <CIcon icon={cilUser} className="me-2" />
                Asignar Docente a: {selectedBrigade?.name}
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              <CForm>
                <div className="alert alert-info mb-4">
                  <CIcon icon={cilInfo} className="me-2" />
                  <strong>Período:</strong> {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                  <br />
                  El docente se asignará para el período académico seleccionado.
                </div>
                <div className="mb-4">
                  <CFormLabel htmlFor="teacherSelect" className="fw-semibold">
                    Seleccionar Docente *
                  </CFormLabel>
                  <CFormSelect
                    id="teacherSelect"
                    value={teacherForm.personalId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, personalId: e.target.value })}
                    size="lg"
                  >
                    <option value="">Seleccione un docente...</option>
                    {availableTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} {teacher.lastName} - CI: {teacher.ci} ({teacher.role})
                      </option>
                    ))}
                  </CFormSelect>
                  <small className="text-muted">
                    Solo se muestran docentes disponibles para este período académico
                  </small>
                </div>
                <div className="mb-4">
                  <CFormLabel htmlFor="startDate" className="fw-semibold">
                    Fecha de Inicio
                  </CFormLabel>
                  <CFormInput
                    id="startDate"
                    type="date"
                    value={teacherForm.startDate}
                    onChange={(e) => setTeacherForm({ ...teacherForm, startDate: e.target.value })}
                    size="lg"
                  />
                  <small className="text-muted">Fecha en que el docente comenzará a encargarse de la brigada</small>
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter className="bg-light">
              <CButton color="secondary" onClick={() => setShowAssignTeacherModal(false)} disabled={isSubmitting}>
                Cancelar
              </CButton>
              <CButton color="success" onClick={handleAssignTeacher} disabled={isSubmitting}>
                {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilUser} className="me-2" />}
                Asignar Docente
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Inscribir Estudiantes */}
          <CModal visible={showEnrollStudentsModal} onClose={() => setShowEnrollStudentsModal(false)} size="xl">
            <CModalHeader className="bg-primary text-white">
              <CModalTitle>
                <CIcon icon={cilUserPlus} className="me-2" />
                Inscribir Estudiantes a: {selectedBrigade?.name}
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              <div className="alert alert-info mb-4">
                <CIcon icon={cilInfo} className="me-2" />
                <strong>Período:</strong> {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                <br />
                Los estudiantes se inscribirán para el período académico seleccionado.
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="mb-1">Seleccione los estudiantes a inscribir</h6>
                    <small className="text-muted">
                      Puede seleccionar múltiples estudiantes usando las casillas de verificación
                    </small>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold text-primary">{studentForm.studentIds.length} seleccionados</div>
                    <small className="text-muted">de {availableStudents.length} disponibles</small>
                  </div>
                </div>

                {/* Barra de progreso de selección */}
                <CProgress
                  value={
                    availableStudents.length > 0 ? (studentForm.studentIds.length / availableStudents.length) * 100 : 0
                  }
                  color="primary"
                  className="mb-3"
                />
              </div>

              {availableStudents.length > 0 ? (
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  <CTable striped hover responsive>
                    <CTableHead className="sticky-top bg-light">
                      <CTableRow>
                        <CTableHeaderCell width="50">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setStudentForm({
                                  studentIds: availableStudents.map((s) => s.id),
                                })
                              } else {
                                setStudentForm({ studentIds: [] })
                              }
                            }}
                            checked={
                              studentForm.studentIds.length === availableStudents.length && availableStudents.length > 0
                            }
                          />
                        </CTableHeaderCell>
                        <CTableHeaderCell>Nombre Completo</CTableHeaderCell>
                        <CTableHeaderCell>C.I.</CTableHeaderCell>
                        <CTableHeaderCell>Sexo</CTableHeaderCell>
                        <CTableHeaderCell>Grado</CTableHeaderCell>
                        <CTableHeaderCell>Sección</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {availableStudents.map((student) => (
                        <CTableRow
                          key={student.id}
                          className={studentForm.studentIds.includes(student.id) ? "table-active" : ""}
                        >
                          <CTableDataCell>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={studentForm.studentIds.includes(student.id)}
                              onChange={() => handleStudentSelection(student.id)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="fw-semibold">
                              {student.name} {student.lastName}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{student.ci || "N/A"}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={student.sex === "Masculino" ? "info" : "warning"}>
                              {student.sex || "N/A"}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{student.grade_name || "N/A"}</CTableDataCell>
                          <CTableDataCell>{student.section_name || "N/A"}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              ) : (
                <div className="text-center py-5">
                  <CIcon icon={cilPeople} size="3xl" className="text-muted mb-3" />
                  <h6 className="text-muted">No hay estudiantes disponibles</h6>
                  <p className="text-muted">
                    Todos los estudiantes activos ya están asignados a brigadas para este período o no hay estudiantes
                    registrados.
                  </p>
                </div>
              )}
            </CModalBody>
            <CModalFooter className="bg-light">
              <CButton color="secondary" onClick={() => setShowEnrollStudentsModal(false)} disabled={isSubmitting}>
                Cancelar
              </CButton>
              <CButton
                color="primary"
                onClick={handleEnrollStudents}
                disabled={isSubmitting || studentForm.studentIds.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilUserPlus} className="me-2" />
                    Inscribir {studentForm.studentIds.length} Estudiante
                    {studentForm.studentIds.length !== 1 ? "s" : ""}
                  </>
                )}
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}

      <style jsx>{`
        .brigade-card {
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        .brigade-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
          border-left-color: var(--cui-primary);
        }
        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .table-active {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }
      `}</style>
    </>
  )
}

export default BrigadeManagement
