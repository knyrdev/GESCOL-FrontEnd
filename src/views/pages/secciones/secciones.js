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
  CCardFooter,
  CAlert,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import {
  cilSchool,
  cilPlus,
  cilPencil,
  cilTrash,
  cilUser,
  cilSearch,
  cilX,
  cilInfo,
  cilCheckCircle,
  cilWarning,
  cilPeople,
  cilCalendar,
  cilReload,
  cilGroup,
} from "@coreui/icons"
import { helpFetch } from "../../../api/helpFetch"
import { detectDarkMode, customCSS } from "../../styles/theme-variables.js"
import { useError } from "../../../context/ErrorContext"

const SectionManagement = () => {
  // Estados principales
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Estados para períodos académicos
  const [academicPeriods, setAcademicPeriods] = useState([])
  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(null)

  // Estados para datos auxiliares
  const [grades, setGrades] = useState([])
  const [teachers, setTeachers] = useState([])

  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSections, setFilteredSections] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sectionsPerPage] = useState(10)

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Estados para datos seleccionados
  const [selectedSection, setSelectedSection] = useState(null)
  const [sectionStudents, setSectionStudents] = useState([])

  // Estados para formularios
  const [sectionForm, setSectionForm] = useState({
    seccion: "",
    gradeID: "",
    teacherCI: "",
    academicPeriodID: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados para toasts
  const [toasts, setToasts] = useState([])

  // Instancia de API
  const { showError } = useError()
  const api = helpFetch(showError)

  // Inyectar CSS personalizado
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = customCSS
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // Detectar tema del sistema
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(detectDarkMode())
    }

    // Detectar tema inicial
    handleThemeChange()

    // Observar cambios en el tema
    const observer = new MutationObserver(handleThemeChange)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-coreui-theme"],
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-coreui-theme"],
    })

    // Escuchar cambios en preferencias del sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", handleThemeChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", handleThemeChange)
    }
  }, [])

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

  // Recargar secciones y docentes cuando cambie el período seleccionado
  useEffect(() => {
    if (selectedPeriod) {
      loadSections()
      loadAvailableTeachers() // Recargar docentes disponibles
    }
  }, [selectedPeriod])

  // Filtrar secciones cuando cambie el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSections(sections)
    } else {
      const filtered = sections.filter(
        (section) =>
          section.seccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.grade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (section.teacher_name &&
            `${section.teacher_name} ${section.teacher_lastName}`.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredSections(filtered)
    }
    setCurrentPage(1)
  }, [searchTerm, sections])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      console.log("🔄 Cargando datos iniciales...")

      // Cargar períodos académicos
      const periodsResponse = await api.get("/api/matriculas/academic-periods")
      if (periodsResponse && periodsResponse.ok) {
        setAcademicPeriods(periodsResponse.periods || [])

        // Buscar período actual
        const current = periodsResponse.periods?.find((p) => p.is_current) || periodsResponse.periods?.[0]
        if (current) {
          setCurrentPeriod(current)
          setSelectedPeriod(current.id)
        }
      } else {
        throw new Error(periodsResponse?.msg || "Error al cargar períodos académicos")
      }

      // Cargar grados
      const gradesResponse = await api.get("/api/matriculas/grades")
      if (gradesResponse && gradesResponse.ok) {
        setGrades(gradesResponse.grades || [])
      } else {
        console.warn("⚠️ Error cargando grados:", gradesResponse?.msg)
        setGrades([])
      }

      // Cargar docentes disponibles (inicialmente todos)
      await loadAvailableTeachers()
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableTeachers = async (excludeSectionId = null) => {
    try {
      console.log("👨‍🏫 Cargando docentes disponibles...")

      // Obtener todos los docentes
      const teachersResponse = await api.get("/api/matriculas/teachers")
      if (!teachersResponse || !teachersResponse.ok) {
        throw new Error(teachersResponse?.msg || "Error al cargar docentes")
      }

      let availableTeachers = teachersResponse.teachers || []

      // Si hay período seleccionado, filtrar docentes ya asignados
      if (selectedPeriod) {
        const sectionsResponse = await api.get(`/api/matriculas/sections?academicPeriodId=${selectedPeriod}`)
        if (sectionsResponse && sectionsResponse.ok) {
          const assignedTeacherIds =
            sectionsResponse.sections
              ?.filter((section) => section.teacherCI && section.id !== excludeSectionId)
              .map((section) => section.teacherCI) || []

          // Filtrar docentes ya asignados
          availableTeachers = availableTeachers.filter((teacher) => !assignedTeacherIds.includes(teacher.id))
        }
      }

      setTeachers(availableTeachers)
      console.log("✅ Docentes disponibles cargados:", availableTeachers.length)
    } catch (error) {
      console.error("❌ Error cargando docentes disponibles:", error)
      setTeachers([])
      // No mostrar error aquí, solo log
    }
  }

  const loadSections = async () => {
    try {
      console.log("🔄 Cargando secciones para período:", selectedPeriod)

      const params = selectedPeriod ? `?academicPeriodId=${selectedPeriod}` : ""
      const response = await api.get(`/api/matriculas/sections${params}`)

      if (response.ok) {
        setSections(response.sections || [])
        console.log("✅ Secciones cargadas:", response.sections?.length || 0)
      } else {
        throw new Error(response.msg || "Error al cargar secciones")
      }
    } catch (error) {
      console.error("❌ Error cargando secciones:", error)
    }
  }

  const loadSectionStudents = async (sectionId) => {
    try {
      console.log(`🔄 Cargando estudiantes de sección ${sectionId}...`)
      const response = await api.get(`/api/matriculas/sections/${sectionId}/students`)
      if (response.ok) {
        setSectionStudents(response.students || [])
        console.log("✅ Estudiantes de sección cargados:", response.students?.length || 0)
      } else {
        console.warn("⚠️ Error cargando estudiantes de sección:", response.msg)
        setSectionStudents([])
      }
    } catch (error) {
      console.error("❌ Error cargando estudiantes de sección:", error)
      setSectionStudents([])
    }
  }

  const validateSectionForm = () => {
    const errors = {}

    if (!sectionForm.seccion.trim()) {
      errors.seccion = "El nombre de la sección es requerido"
    } else if (sectionForm.seccion.length > 10) {
      errors.seccion = "El nombre de la sección es demasiado largo (máximo 10 caracteres)"
    } else if (!/^[A-Za-z0-9\s]+$/.test(sectionForm.seccion)) {
      errors.seccion = "El nombre de la sección solo puede contener letras, números y espacios"
    }

    if (!sectionForm.gradeID) {
      errors.gradeID = "Debe seleccionar un grado"
    }

    if (!sectionForm.teacherCI) {
      errors.teacherCI = "Debe seleccionar un docente"
    }

    if (!sectionForm.academicPeriodID) {
      errors.academicPeriodID = "Debe seleccionar un período académico"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateSection = async () => {
    try {
      if (!validateSectionForm()) return

      setIsSubmitting(true)
      console.log("➕ Creando sección...")

      const response = await api.post("/api/matriculas/sections", {
        body: {
          ...sectionForm,
          gradeID: Number.parseInt(sectionForm.gradeID),
          teacherCI: Number.parseInt(sectionForm.teacherCI),
          academicPeriodID: Number.parseInt(sectionForm.academicPeriodID),
        },
      })

      if (response && response.ok) {
        addToast("Sección creada exitosamente", "success")
        setShowCreateModal(false)
        resetSectionForm()
        await loadSections()
        console.log("✅ Sección creada")
      } else if (response?.status === 400) {
        const errorMessage = response?.msg || "Error al crear sección"
        if (errorMessage.includes("Ya existe una sección")) {
          setFormErrors({ seccion: errorMessage })
        } else if (errorMessage.includes("docente ya está asignado")) {
          setFormErrors({ teacherCI: errorMessage })
        }
      }
    } catch (error) {
      console.error("❌ Error creando sección:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSection = async () => {
    try {
      if (!validateSectionForm()) return

      setIsSubmitting(true)
      console.log("✏️ Actualizando sección...")

      const response = await api.put(
        "/api/matriculas/sections",
        {
          body: {
            ...sectionForm,
            gradeID: Number.parseInt(sectionForm.gradeID),
            teacherCI: Number.parseInt(sectionForm.teacherCI),
            academicPeriodID: Number.parseInt(sectionForm.academicPeriodID),
          },
        },
        selectedSection.id,
      )

      if (response && response.ok) {
        addToast("Sección actualizada exitosamente", "success")
        setShowEditModal(false)
        resetSectionForm()
        await loadSections()
        console.log("✅ Sección actualizada")
      } else if (response?.status === 400) {
        const errorMessage = response?.msg || "Error al actualizar sección"
        if (errorMessage.includes("Ya existe otra sección")) {
          setFormErrors({ seccion: errorMessage })
        } else if (errorMessage.includes("docente ya está asignado")) {
          setFormErrors({ teacherCI: errorMessage })
        }
      }
    } catch (error) {
      console.error("❌ Error actualizando sección:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSection = async () => {
    try {
      if (!selectedSection) return

      setIsSubmitting(true)

      console.log("🗑️ Eliminando sección...")

      const response = await api.delet("/api/matriculas/sections", selectedSection.id)

      if (response && response.ok) {
        addToast("Sección eliminada exitosamente", "success")
        setShowDeleteModal(false)
        setSelectedSection(null)
        await loadSections()
        console.log("✅ Sección eliminada")
      } else {
        // Manejar errores específicos del backend
        const errorMessage = response?.msg || "Error al eliminar sección"
        addToast(errorMessage, "error")
      }
    } catch (error) {
      console.error("❌ Error eliminando sección:", error)
      addToast("Error inesperado al eliminar sección", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetSectionForm = () => {
    setSectionForm({
      seccion: "",
      gradeID: "",
      teacherCI: "",
      academicPeriodID: selectedPeriod || "",
    })
    setFormErrors({})
  }

  const openCreateModal = () => {
    resetSectionForm()
    setSectionForm((prev) => ({ ...prev, academicPeriodID: selectedPeriod || "" }))
    loadAvailableTeachers() // Cargar docentes disponibles
    setShowCreateModal(true)
  }

  const openEditModal = (section) => {
    setSelectedSection(section)
    setSectionForm({
      seccion: section.seccion,
      gradeID: section.gradeID?.toString() || "",
      teacherCI: section.teacherCI?.toString() || "",
      academicPeriodID: section.academicPeriodID?.toString() || "",
    })
    setFormErrors({})
    // Cargar docentes disponibles excluyendo la sección actual
    loadAvailableTeachers(section.id)
    setShowEditModal(true)
  }

  const openDeleteModal = (section) => {
    setSelectedSection(section)
    setShowDeleteModal(true)
  }

  const openDetailsModal = async (section) => {
    setSelectedSection(section)
    await loadSectionStudents(section.id)
    setShowDetailsModal(true)
  }

  // Calcular secciones para la página actual
  const indexOfLastSection = currentPage * sectionsPerPage
  const indexOfFirstSection = indexOfLastSection - sectionsPerPage
  const currentSections = filteredSections.slice(indexOfFirstSection, indexOfLastSection)
  const totalPages = Math.ceil(filteredSections.length / sectionsPerPage)

  // Calcular estadísticas
  const totalStudents = sections.reduce((sum, section) => sum + (Number.parseInt(section.student_count) || 0), 0)
  const sectionsWithTeacher = sections.filter((s) => s.teacher_name).length
  const sectionsWithoutTeacher = sections.length - sectionsWithTeacher

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <CSpinner color="primary" size="lg" />
          <div className="mt-3">
            <h5 className="text-body-emphasis">Cargando sistema de secciones...</h5>
            <p className="text-body-secondary">Inicializando períodos académicos y datos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
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

      {/* Alertas removed as per instruction - using global ErrorModal */}

      {/* Selector de Período Académico */}
      <CCard className="mb-4 border-primary card-theme">
        <CCardHeader className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">
                <CIcon icon={cilCalendar} className="me-2" />
                Período Académico Activo
              </h6>
              <small className="text-white-50">Seleccione el período para gestionar las secciones</small>
            </div>
            <CBadge color="light" className="text-primary">
              {currentPeriod?.is_current ? "PERÍODO ACTUAL" : "PERÍODO HISTÓRICO"}
            </CBadge>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow className="align-items-center">
            <CCol md={6}>
              <CFormLabel htmlFor="periodSelect" className="fw-semibold text-body-emphasis">
                Período Académico:
              </CFormLabel>
              <CFormSelect
                id="periodSelect"
                value={selectedPeriod || ""}
                onChange={(e) => setSelectedPeriod(Number.parseInt(e.target.value))}
                size="lg"
                className="theme-transition"
              >
                <option value="">Seleccionar período...</option>
                {academicPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                    {period.is_current && " (ACTUAL)"}
                    {" - "}
                    {new Date(period.start_date).toLocaleDateString()} a{" "}
                    {new Date(period.end_date).toLocaleDateString()}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              {selectedPeriod && (
                <div className="text-end">
                  <div className="fw-semibold text-primary fs-4">{sections.length}</div>
                  <div className="text-body-secondary">secciones en este período</div>
                  <div className="fw-semibold text-success fs-5">{totalStudents}</div>
                  <div className="text-body-secondary">estudiantes matriculados</div>
                </div>
              )}
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Contenido principal solo si hay período seleccionado */}
      {!selectedPeriod ? (
        <CCard className="card-theme">
          <CCardBody className="text-center py-5">
            <CIcon icon={cilCalendar} size="4xl" className="text-muted mb-4" />
            <h4 className="text-muted mb-3">Seleccione un Período Académico</h4>
            <p className="text-body-secondary">
              Para gestionar las secciones, primero debe seleccionar un período académico en el selector superior.
            </p>
          </CCardBody>
        </CCard>
      ) : (
        <>
          {/* Estadísticas generales */}
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CCard className="text-white bg-primary border-0">
                <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fs-4 fw-semibold">{sections.length}</div>
                    <div>Total Secciones</div>
                  </div>
                  <CIcon icon={cilSchool} height={24} />
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
              <CCard className="text-white bg-info border-0">
                <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fs-4 fw-semibold">{totalStudents}</div>
                    <div>Total Estudiantes</div>
                  </div>
                  <CIcon icon={cilPeople} height={24} />
                </CCardBody>
                <CCardFooter className="px-3 py-2">
                  <div className="text-white-50 small">
                    <CIcon icon={cilGroup} className="me-1" />
                    Matriculados
                  </div>
                </CCardFooter>
              </CCard>
            </CCol>
            <CCol sm={6} lg={3}>
              <CCard className="text-white bg-success border-0">
                <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fs-4 fw-semibold">{sectionsWithTeacher}</div>
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
              <CCard className="text-white bg-warning border-0">
                <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fs-4 fw-semibold">{sectionsWithoutTeacher}</div>
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

          <CCard className="shadow-theme card-theme">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1 text-body-emphasis">
                  <CIcon icon={cilSchool} className="me-2" />
                  Gestión de Secciones - {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                </h5>
                <small className="text-body-secondary">
                  Administra las secciones académicas y sus docentes para el período seleccionado
                </small>
              </div>
              <div className="d-flex gap-2">
                <CButton color="secondary" variant="outline" onClick={loadSections} disabled={loading}>
                  {loading ? <CSpinner size="sm" className="me-1" /> : null}
                  <CIcon icon={cilReload} className="me-1" />
                  Actualizar
                </CButton>
                <CButton color="primary" onClick={openCreateModal}>
                  <CIcon icon={cilPlus} className="me-1" />
                  Nueva Sección
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
                      placeholder="Buscar secciones por nombre, grado o docente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control-lg theme-transition"
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
                    <div className="fw-semibold text-body-emphasis">
                      {currentSections.length} de {filteredSections.length}
                    </div>
                    <small className="text-body-secondary">secciones mostradas</small>
                  </div>
                </CCol>
              </CRow>

              {/* Tabla de secciones */}
              {currentSections.length > 0 ? (
                <>
                  <CTable striped hover responsive className="table-theme">
                    <CTableHead className="bg-body-tertiary">
                      <CTableRow>
                        <CTableHeaderCell className="text-body-emphasis">Sección</CTableHeaderCell>
                        <CTableHeaderCell className="text-body-emphasis">Grado</CTableHeaderCell>
                        <CTableHeaderCell className="text-body-emphasis">Docente</CTableHeaderCell>
                        <CTableHeaderCell className="text-body-emphasis">Estudiantes</CTableHeaderCell>
                        <CTableHeaderCell className="text-body-emphasis">Estado</CTableHeaderCell>
                        <CTableHeaderCell className="text-body-emphasis">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {currentSections.map((section) => (
                        <CTableRow key={section.id} className="theme-transition">
                          <CTableDataCell>
                            <div className="fw-semibold text-body-emphasis text-center">{section.seccion}</div>
                            <small className="text-body-secondary">ID: {section.id}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="info">{section.grade_name}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {section.teacher_name && section.teacher_lastName ? (
                              <div>
                                <div className="fw-semibold text-body-emphasis">
                                  {section.teacher_name} {section.teacher_lastName}
                                </div>
                                <small className="text-body-secondary">CI: {section.teacherCI}</small>
                              </div>
                            ) : (
                              <span className="text-body-secondary">Sin asignar</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="primary">{section.student_count || 0} estudiantes</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={section.teacher_name ? "success" : "warning"}>
                              {section.teacher_name ? "Completa" : "Sin docente"}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex gap-1">
                              <CButton
                                color="info"
                                size="sm"
                                variant="outline"
                                onClick={() => openDetailsModal(section)}
                                title="Ver detalles"
                              >
                                <CIcon icon={cilInfo} />
                              </CButton>
                              <CButton
                                color="warning"
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(section)}
                                title="Editar sección"
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton
                                color="danger"
                                size="sm"
                                variant="outline"
                                onClick={() => openDeleteModal(section)}
                                title="Eliminar sección"
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <CPagination className="shadow-sm">
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
                </>
              ) : (
                <div className="text-center py-5">
                  <CIcon icon={cilSchool} size="4xl" className="text-muted mb-4" />
                  <h4 className="text-muted mb-3">
                    {searchTerm ? "No se encontraron secciones" : "No hay secciones registradas"}
                  </h4>
                  <p className="text-body-secondary mb-4">
                    {searchTerm
                      ? "Intenta con otros términos de búsqueda o limpia el filtro"
                      : `No hay secciones registradas para el período ${academicPeriods.find((p) => p.id === selectedPeriod)?.name}`}
                  </p>
                  {!searchTerm && (
                    <CButton color="primary" size="lg" onClick={openCreateModal}>
                      <CIcon icon={cilPlus} className="me-2" />
                      Crear Primera Sección
                    </CButton>
                  )}
                  {searchTerm && (
                    <CButton color="secondary" onClick={() => setSearchTerm("")}>
                      <CIcon icon={cilX} className="me-2" />
                      Limpiar Búsqueda
                    </CButton>
                  )}
                </div>
              )}
            </CCardBody>
          </CCard>
        </>
      )}

      {/* Modales - Solo se muestran si hay período seleccionado */}
      {selectedPeriod && (
        <>
          {/* Modal Crear Sección */}
          <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} backdrop="static" size="lg">
            <CModalHeader className="bg-primary text-white">
              <CModalTitle>
                <CIcon icon={cilPlus} className="me-2" />
                Crear Nueva Sección
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              <CForm>
                <div className="alert alert-info mb-4">
                  <CIcon icon={cilInfo} className="me-2" />
                  <strong>Período:</strong> {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                  <br />
                  La sección se creará para el período académico seleccionado.
                </div>



                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="sectionName" className="fw-semibold text-body-emphasis">
                        Nombre de la Sección *
                      </CFormLabel>
                      <CFormInput
                        id="sectionName"
                        type="text"
                        value={sectionForm.seccion}
                        onChange={(e) => setSectionForm({ ...sectionForm, seccion: e.target.value })}
                        invalid={!!formErrors.seccion}
                        placeholder="Ej: A, B, C, Única..."
                        maxLength={10}
                        className="theme-transition"
                      />
                      {formErrors.seccion && <div className="invalid-feedback">{formErrors.seccion}</div>}
                      <small className="text-body-secondary">Máximo 10 caracteres</small>
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="gradeSelect" className="fw-semibold text-body-emphasis">
                        Grado *
                      </CFormLabel>
                      <CFormSelect
                        id="gradeSelect"
                        value={sectionForm.gradeID}
                        onChange={(e) => setSectionForm({ ...sectionForm, gradeID: e.target.value })}
                        invalid={!!formErrors.gradeID}
                        className="theme-transition"
                      >
                        <option value="">Seleccionar grado...</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </CFormSelect>
                      {formErrors.gradeID && <div className="invalid-feedback">{formErrors.gradeID}</div>}
                    </div>
                  </CCol>
                </CRow>

                <div className="mb-3">
                  <CFormLabel htmlFor="teacherSelect" className="fw-semibold text-body-emphasis">
                    Docente Encargado *
                  </CFormLabel>
                  <CFormSelect
                    id="teacherSelect"
                    value={sectionForm.teacherCI}
                    onChange={(e) => setSectionForm({ ...sectionForm, teacherCI: e.target.value })}
                    invalid={!!formErrors.teacherCI}
                    className="theme-transition"
                  >
                    <option value="">Seleccionar docente...</option>
                    {teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} {teacher.lastName} - CI: {teacher.ci}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hay docentes disponibles</option>
                    )}
                  </CFormSelect>
                  {formErrors.teacherCI && <div className="invalid-feedback">{formErrors.teacherCI}</div>}
                  <small className="text-body-secondary">
                    {teachers.length > 0
                      ? `${teachers.length} docente(s) disponible(s) para este período`
                      : "No hay docentes disponibles para asignar"}
                  </small>
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter className="bg-body-tertiary">
              <CButton color="secondary" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                Cancelar
              </CButton>
              <CButton color="primary" onClick={handleCreateSection} disabled={isSubmitting}>
                {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilPlus} className="me-2" />}
                Crear Sección
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Editar Sección */}
          <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} backdrop="static" size="lg">
            <CModalHeader className="bg-warning text-white">
              <CModalTitle>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Sección
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              <CForm>
                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="editSectionName" className="fw-semibold text-body-emphasis">
                        Nombre de la Sección *
                      </CFormLabel>
                      <CFormInput
                        id="editSectionName"
                        type="text"
                        value={sectionForm.seccion}
                        onChange={(e) => setSectionForm({ ...sectionForm, seccion: e.target.value })}
                        invalid={!!formErrors.seccion}
                        placeholder="Ej: A, B, C, Única..."
                        maxLength={10}
                        className="theme-transition"
                      />
                      {formErrors.seccion && <div className="invalid-feedback">{formErrors.seccion}</div>}
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="editGradeSelect" className="fw-semibold text-body-emphasis">
                        Grado *
                      </CFormLabel>
                      <CFormSelect
                        id="editGradeSelect"
                        value={sectionForm.gradeID}
                        onChange={(e) => setSectionForm({ ...sectionForm, gradeID: e.target.value })}
                        invalid={!!formErrors.gradeID}
                        className="theme-transition"
                      >
                        <option value="">Seleccionar grado...</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </CFormSelect>
                      {formErrors.gradeID && <div className="invalid-feedback">{formErrors.gradeID}</div>}
                    </div>
                  </CCol>
                </CRow>

                <div className="mb-3">
                  <CFormLabel htmlFor="editTeacherSelect" className="fw-semibold text-body-emphasis">
                    Docente Encargado *
                  </CFormLabel>
                  <CFormSelect
                    id="editTeacherSelect"
                    value={sectionForm.teacherCI}
                    onChange={(e) => setSectionForm({ ...sectionForm, teacherCI: e.target.value })}
                    invalid={!!formErrors.teacherCI}
                    className="theme-transition"
                  >
                    <option value="">Seleccionar docente...</option>
                    {teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} {teacher.lastName} - CI: {teacher.ci}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hay docentes disponibles</option>
                    )}
                  </CFormSelect>
                  {formErrors.teacherCI && <div className="invalid-feedback">{formErrors.teacherCI}</div>}
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter className="bg-body-tertiary">
              <CButton color="secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
                Cancelar
              </CButton>
              <CButton color="warning" onClick={handleUpdateSection} disabled={isSubmitting}>
                {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilPencil} className="me-2" />}
                Actualizar Sección
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Eliminar Sección */}
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
                <h5 className="text-body-emphasis">¿Está seguro de eliminar esta sección?</h5>
                <p className="mb-3 text-body-secondary">
                  Se eliminará permanentemente la sección <strong>"{selectedSection?.seccion}"</strong> del grado{" "}
                  <strong>"{selectedSection?.grade_name}"</strong>
                </p>
                <div className="alert alert-danger">
                  <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer y eliminará:
                  <ul className="mt-2 mb-0 text-start">
                    <li>La sección y toda su información</li>
                    <li>Las matrículas de estudiantes en esta sección</li>
                    <li>Los registros de asistencia asociados</li>
                  </ul>
                </div>
              </div>
            </CModalBody>
            <CModalFooter className="bg-body-tertiary">
              <CButton color="secondary" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>
                Cancelar
              </CButton>
              <CButton color="danger" onClick={handleDeleteSection} disabled={isSubmitting}>
                {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilTrash} className="me-2" />}
                Eliminar Definitivamente
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Detalles de Sección */}
          <CModal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="xl">
            <CModalHeader className="bg-info text-white">
              <CModalTitle>
                <CIcon icon={cilInfo} className="me-2" />
                Detalles de Sección: {selectedSection?.grade_name} - {selectedSection?.seccion}
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4">
              {selectedSection && (
                <>
                  {/* Información General */}
                  <CCard className="mb-4 card-theme">
                    <CCardHeader className="bg-body-tertiary">
                      <h6 className="mb-0 text-body-emphasis">
                        <CIcon icon={cilSchool} className="me-2" />
                        Información General - {academicPeriods.find((p) => p.id === selectedPeriod)?.name}
                      </h6>
                    </CCardHeader>
                    <CCardBody>
                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <strong className="text-body-emphasis">Sección:</strong>
                            <div className="text-body-secondary">{selectedSection.seccion}</div>
                          </div>
                          <div className="mb-3">
                            <strong className="text-body-emphasis">Grado:</strong>
                            <div className="text-body-secondary">{selectedSection.grade_name}</div>
                          </div>
                          <div className="mb-3">
                            <strong className="text-body-emphasis">Total de Estudiantes:</strong>
                            <CBadge color="primary" className="ms-2">
                              {selectedSection.student_count || 0}
                            </CBadge>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <strong className="text-body-emphasis">Docente Encargado:</strong>
                            <div className="text-body-secondary">
                              {selectedSection.teacher_name && selectedSection.teacher_lastName
                                ? `${selectedSection.teacher_name} ${selectedSection.teacher_lastName}`
                                : "Sin asignar"}
                            </div>
                            {selectedSection.teacherCI && (
                              <small className="text-body-secondary">CI: {selectedSection.teacherCI}</small>
                            )}
                          </div>
                          <div className="mb-3">
                            <strong className="text-body-emphasis">ID de Sección:</strong>
                            <div className="text-body-secondary">{selectedSection.id}</div>
                          </div>
                          <div className="mb-3">
                            <strong className="text-body-emphasis">Período Académico:</strong>
                            <div className="text-body-secondary">
                              {academicPeriods.find((p) => p.id === selectedSection.academicPeriodID)?.name}
                            </div>
                          </div>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>

                  {/* Lista de Estudiantes */}
                  <CCard className="card-theme">
                    <CCardHeader className="bg-body-tertiary d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 text-body-emphasis">
                        <CIcon icon={cilPeople} className="me-2" />
                        Estudiantes Matriculados ({sectionStudents.length})
                      </h6>
                      {sectionStudents.length > 0 && (
                        <CBadge color="success">
                          {sectionStudents.filter((s) => s.sex === "Masculino").length}M /{" "}
                          {sectionStudents.filter((s) => s.sex === "Femenino").length}F
                        </CBadge>
                      )}
                    </CCardHeader>
                    <CCardBody>
                      {sectionStudents.length > 0 ? (
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                          <CTable striped hover responsive className="table-theme">
                            <CTableHead className="bg-body-tertiary">
                              <CTableRow>
                                <CTableHeaderCell className="text-body-emphasis">#</CTableHeaderCell>
                                <CTableHeaderCell className="text-body-emphasis">Nombre Completo</CTableHeaderCell>
                                <CTableHeaderCell className="text-body-emphasis">C.I.</CTableHeaderCell>
                                <CTableHeaderCell className="text-body-emphasis">Sexo</CTableHeaderCell>
                                <CTableHeaderCell className="text-body-emphasis">Estado</CTableHeaderCell>
                                <CTableHeaderCell className="text-body-emphasis">Fecha Matrícula</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {sectionStudents.map((student, index) => (
                                <CTableRow key={student.id || index} className="theme-transition">
                                  <CTableDataCell>{index + 1}</CTableDataCell>
                                  <CTableDataCell>
                                    <div className="fw-semibold text-body-emphasis">
                                      {student.name} {student.lastName}
                                    </div>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <code className="px-2 py-1 rounded bg-light text-body-emphasis">
                                      {student.ci || "N/A"}
                                    </code>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color={student.sex === "Masculino" ? "info" : "warning"}>
                                      {student.sex || "N/A"}
                                    </CBadge>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color="success">{student.status || "Activo"}</CBadge>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <small className="text-body-secondary">
                                      {student.enrollmentDate
                                        ? new Date(student.enrollmentDate).toLocaleDateString("es-ES")
                                        : "N/A"}
                                    </small>
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                          </CTable>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CIcon icon={cilPeople} size="3xl" className="text-muted mb-3" />
                          <h6 className="text-muted">No hay estudiantes matriculados</h6>
                          <p className="text-body-secondary">Esta sección aún no tiene estudiantes matriculados.</p>
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                </>
              )}
            </CModalBody>
            <CModalFooter className="bg-body-tertiary">
              <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>
                Cerrar
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </div>
  )
}

export default SectionManagement
