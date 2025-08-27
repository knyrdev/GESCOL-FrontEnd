"use client"
import { useState, useEffect } from "react"
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CButtonGroup,
  CBadge,
  CSpinner,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CForm,
  CFormLabel,
  CFormCheck,
  CFormTextarea,
  CProgress,
  CProgressBar,
  CAvatar,
  CListGroup,
  CListGroupItem,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import {
  cilSearch,
  cilTrash,
  cilReload,
  cilPencil,
  cilUser,
  cilX,
  cilSave,
  cilArrowLeft,
  cilPlus,
  cilSchool,
  cilPeople,
  cilCalendar,
  cilMedicalCross,
  cilClipboard,
  cilHome,
  cilLocationPin,
  cilStar,
  cilCheckCircle,
  cilXCircle,
  cilWarning,
  cilPrint,
} from "@coreui/icons"
import { helpFetch } from "../../../api/helpFetch.js"

const api = helpFetch()

const MatriculasList = () => {
  const [matriculas, setMatriculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [filteredMatriculas, setFilteredMatriculas] = useState([])

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [matriculasPerPage] = useState(8)

  // Estados para modal
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedMatricula, setSelectedMatricula] = useState(null)
  const [activeTab, setActiveTab] = useState("estudiante")
  const [isEditing, setIsEditing] = useState(false)
  const [editingData, setEditingData] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)

  // Estados para datos de utilidad
  const [grados, setGrados] = useState([])
  const [secciones, setSecciones] = useState([])
  const [docentes, setDocentes] = useState([])

  // Estados para crear matrícula
  const [createData, setCreateData] = useState({
    studentCi: "",
    sectionID: "",
    registrationDate: new Date().toISOString().split("T")[0],
    repeater: false,
    chemiseSize: "",
    pantsSize: "",
    shoesSize: "",
    weight: "",
    stature: "",
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

  useEffect(() => {
    loadMatriculas()
    loadUtilityData()
  }, [])

  useEffect(() => {
    filterMatriculas()
  }, [searchTerm, selectedGrade, matriculas])

  const loadMatriculas = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Cargando matrículas...")
      const response = await api.get("/api/matriculas/all")

      if (response.ok) {
        console.log("✅ Matrículas cargadas:", response.inscriptions)
        setMatriculas(response.inscriptions || [])
      } else {
        console.error("❌ Error al cargar matrículas:", response)
        setError(response.msg || "Error al cargar matrículas")
      }
    } catch (error) {
      console.error("❌ Error en loadMatriculas:", error)
      setError("Error al cargar matrículas")
    } finally {
      setLoading(false)
    }
  }

  const loadUtilityData = async () => {
    try {
      // Cargar grados
      const gradosResponse = await api.get("/api/matriculas/grades")
      if (gradosResponse.ok) {
        setGrados(gradosResponse.grades || [])
      }

      // Cargar docentes
      const docentesResponse = await api.get("/api/matriculas/teachers")
      if (docentesResponse.ok) {
        setDocentes(docentesResponse.teachers || [])
      }
    } catch (error) {
      console.error("❌ Error cargando datos de utilidad:", error)
    }
  }

  const loadSectionsByGrade = async (gradeId) => {
    try {
      const response = await api.get(`/api/matriculas/sections/${gradeId}`)
      if (response.ok) {
        setSecciones(response.sections || [])
      }
    } catch (error) {
      console.error("❌ Error cargando secciones:", error)
    }
  }

  const filterMatriculas = () => {
    let filtered = matriculas

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (matricula) =>
          matricula.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          matricula.student_lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          matricula.student_ci?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por grado
    if (selectedGrade) {
      filtered = filtered.filter((matricula) => matricula.grade_name === selectedGrade)
    }

    setFilteredMatriculas(filtered)
    setCurrentPage(1)
  }

  const handleViewMatricula = (matricula) => {
    setSelectedMatricula(matricula)
    setEditingData({ ...matricula })
    setActiveTab("estudiante")
    setIsEditing(false)
    setShowModal(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedMatricula(null)
    setEditingData({})
    setActiveTab("estudiante")
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  const handleCreateMatricula = async () => {
    try {
      setUpdateLoading(true)
      setError(null)
      setSuccess(null)

      console.log("📝 Creando nueva matrícula:", createData)

      const response = await api.post("/api/matriculas/inscription", { body: createData })

      if (response.ok) {
        setSuccess("Matrícula creada exitosamente")
        setShowCreateModal(false)
        setCreateData({
          studentCi: "",
          sectionID: "",
          registrationDate: new Date().toISOString().split("T")[0],
          repeater: false,
          chemiseSize: "",
          pantsSize: "",
          shoesSize: "",
          weight: "",
          stature: "",
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
        await loadMatriculas()
      } else {
        setError(response.msg || "Error al crear matrícula")
      }
    } catch (error) {
      console.error("❌ Error creando matrícula:", error)
      setError(error.msg || "Error al crear matrícula")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleUpdateMatricula = async () => {
    try {
      setUpdateLoading(true)
      setError(null)
      setSuccess(null)

      console.log("💾 Actualizando matrícula y datos del estudiante:", editingData)

      // Preparar datos de matrícula
      const matriculaData = {
        sectionID: editingData.sectionID,
        registrationDate: editingData.registrationDate,
        repeater: editingData.repeater,
        chemiseSize: editingData.chemiseSize,
        pantsSize: editingData.pantsSize,
        shoesSize: editingData.shoesSize,
        weight: Number.parseFloat(editingData.weight) || null,
        stature: Number.parseFloat(editingData.stature) || null,
        diseases: editingData.diseases,
        observation: editingData.observation,
        birthCertificateCheck: editingData.birthCertificateCheck,
        vaccinationCardCheck: editingData.vaccinationCardCheck,
        studentPhotosCheck: editingData.studentPhotosCheck,
        representativePhotosCheck: editingData.representativePhotosCheck,
        representativeCopyIDCheck: editingData.representativeCopyIDCheck,
        representativeRIFCheck: editingData.representativeRIFCheck,
        autorizedCopyIDCheck: editingData.autorizedCopyIDCheck,
      }

      // Si se editaron datos del estudiante, incluirlos
      if (
        editingData.student_name !== selectedMatricula.student_name ||
        editingData.student_lastName !== selectedMatricula.student_lastName ||
        editingData.student_ci !== selectedMatricula.student_ci ||
        editingData.student_sex !== selectedMatricula.student_sex ||
        editingData.student_birthday !== selectedMatricula.student_birthday
      ) {
        matriculaData.studentData = {
          name: editingData.student_name,
          lastName: editingData.student_lastName,
          ci: editingData.student_ci,
          sex: editingData.student_sex,
          birthday: editingData.student_birthday,
          placeBirth: editingData.student_placeBirth,
          motherName: editingData.student_motherName,
          motherCi: editingData.student_motherCi,
          motherTelephone: editingData.student_motherTelephone,
          fatherName: editingData.student_fatherName,
          fatherCi: editingData.student_fatherCi,
          fatherTelephone: editingData.student_fatherTelephone,
          livesMother: editingData.student_livesMother,
          livesFather: editingData.student_livesFather,
          livesBoth: editingData.student_livesBoth,
          livesRepresentative: editingData.student_livesRepresentative,
          quantityBrothers: Number.parseInt(editingData.student_quantityBrothers) || 0,
        }
      }

      const response = await api.put("/api/matriculas", { body: matriculaData }, editingData.id)

      if (response.ok) {
        setSuccess("Matrícula y datos del estudiante actualizados exitosamente")
        setIsEditing(false)
        setSelectedMatricula({ ...selectedMatricula, ...editingData })
        await loadMatriculas()
      } else {
        setError(response.msg || "Error al actualizar matrícula")
      }
    } catch (error) {
      console.error("❌ Error actualizando matrícula:", error)
      setError(error.msg || "Error al actualizar matrícula")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDeleteMatricula = async (matriculaId, fromModal = false) => {
    const matricula = fromModal ? selectedMatricula : matriculas.find((m) => m.id === matriculaId)
    const nombreCompleto = matricula ? `${matricula.student_name} ${matricula.student_lastName}` : "esta matrícula"

    if (!window.confirm(`¿Está seguro de que desea eliminar la matrícula de ${nombreCompleto}?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      setUpdateLoading(true)

      console.log("🗑️ Eliminando matrícula:", matriculaId)

      const response = await api.delet("/api/matriculas", matriculaId)

      if (response && (response.ok || response.inscription)) {
        setSuccess(`Matrícula de ${nombreCompleto} eliminada exitosamente`)
        await loadMatriculas()

        if (fromModal) {
          handleCloseModal()
        }
      } else {
        setError(response?.msg || "Error al eliminar matrícula")
      }
    } catch (error) {
      console.error("❌ Error eliminando matrícula:", error)
      setError(error.msg || "Error al eliminar matrícula")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleEditMode = () => {
    setIsEditing(true)
    setEditingData({ ...selectedMatricula })
    setError(null)
    setSuccess(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingData({ ...selectedMatricula })
    setError(null)
    setSuccess(null)
  }

  const handleInputChange = (field, value) => {
    if (isEditing) {
      setEditingData((prev) => ({
        ...prev,
        [field]: value,
      }))
    } else {
      setCreateData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toISOString().split("T")[0]
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "-"
    const nacimiento = new Date(fechaNacimiento)
    const hoy = new Date()
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return `${edad} años`
  }

  const getSexColor = (sex) => {
    if (sex === "M" || sex === "Masculino") return "primary"
    if (sex === "F" || sex === "Femenino") return "danger"
    return "secondary"
  }

  const getSexText = (sex) => {
    if (sex === "M") return "Masculino"
    if (sex === "F") return "Femenino"
    return sex || "No especificado"
  }

  const getDocumentProgress = (matricula) => {
    const documents = [
      matricula.birthCertificateCheck,
      matricula.vaccinationCardCheck,
      matricula.studentPhotosCheck,
      matricula.representativePhotosCheck,
      matricula.representativeCopyIDCheck,
      matricula.autorizedCopyIDCheck,
    ]
    const completed = documents.filter(Boolean).length
    return Math.round((completed / documents.length) * 100)
  }

  const handleDownloadGradePdf = async (gradeId, gradeName) => {
    try {
      setError(null)
      console.log(`📄 Descargando PDF para grado ${gradeName} (ID: ${gradeId})`)

      const blob = await api.downloadFile(`/api/pdf/students/list/grade/${gradeId}`)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Listado_estudiantes_${gradeName.replace(/\s+/g, "_")}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess(`PDF del grado ${gradeName} descargado exitosamente`)
    } catch (error) {
      console.error("❌ Error descargando PDF del grado:", error)
      setError(`Error al generar el PDF del grado ${gradeName}`)
    }
  }

  const handleDownloadAllEnrolledPdf = async () => {
    try {
      setError(null)
      console.log("📄 Descargando PDF de todos los estudiantes matriculados")

      const blob = await api.downloadFile("/api/pdf/students/enrolled/list/all")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "Listado_todos_estudiantes_matriculados.pdf")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess("PDF de todos los estudiantes matriculados descargado exitosamente")
    } catch (error) {
      console.error("❌ Error descargando PDF de todos los estudiantes:", error)
      setError("Error al generar el PDF de todos los estudiantes matriculados")
    }
  }

  // Calcular matrículas para la página actual
  const indexOfLastMatricula = currentPage * matriculasPerPage
  const indexOfFirstMatricula = indexOfLastMatricula - matriculasPerPage
  const currentMatriculas = filteredMatriculas.slice(indexOfFirstMatricula, indexOfLastMatricula)
  const totalPages = Math.ceil(filteredMatriculas.length / matriculasPerPage)

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <CSpinner color="primary" size="lg" />
        <div className="ms-3">
          <h5>Cargando matrículas...</h5>
          <small className="text-muted">Obteniendo datos del sistema</small>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <div className="d-flex align-items-center">
            <CIcon icon={cilXCircle} className="me-2" />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        </CAlert>
      )}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
          <div className="d-flex align-items-center">
            <CIcon icon={cilCheckCircle} className="me-2" />
            <div>
              <strong>Éxito:</strong> {success}
            </div>
          </div>
        </CAlert>
      )}

      <CCard className="shadow-lg border-0">
        <CCardHeader className="bg-gradient-primary text-white border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CIcon icon={cilSchool} size="xl" className="me-3" />
              <div>
                <h4 className="mb-0">Gestión de Matrículas Escolares</h4>
                <small className="opacity-75">Sistema de inscripciones y registro estudiantil</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <CButton color="light" variant="outline" onClick={() => setShowCreateModal(true)} className="border-2">
                <CIcon icon={cilPlus} className="me-2" />
                Nueva Matrícula
              </CButton>
              <CButton color="light" variant="outline" onClick={handleDownloadAllEnrolledPdf} className="border-2">
                <CIcon icon={cilPrint} className="me-2" />
                PDF General
              </CButton>
              <CButton color="light" variant="outline" onClick={loadMatriculas} disabled={loading} className="border-2">
                <CIcon icon={cilReload} className="me-2" />
                Actualizar
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody className="p-4">
          {/* Panel de estadísticas */}
          <CRow className="mb-4">
            <CCol md={3}>
              <CCard className="border-0 bg-primary text-white h-100">
                <CCardBody className="text-center">
                  <CIcon icon={cilPeople} size="2xl" className="mb-2" />
                  <h3 className="mb-0">{filteredMatriculas.length}</h3>
                  <small>Total Matrículas</small>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={3}>
              <CCard className="border-0 bg-success text-white h-100">
                <CCardBody className="text-center">
                  <CIcon icon={cilCheckCircle} size="2xl" className="mb-2" />
                  <h3 className="mb-0">{filteredMatriculas.filter((m) => !m.repeater).length}</h3>
                  <small>Nuevos Ingresos</small>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={3}>
              <CCard className="border-0 bg-warning text-white h-100">
                <CCardBody className="text-center">
                  <CIcon icon={cilWarning} size="2xl" className="mb-2" />
                  <h3 className="mb-0">{filteredMatriculas.filter((m) => m.repeater).length}</h3>
                  <small>Repitientes</small>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={3}>
              <CCard className="border-0 bg-info text-white h-100">
                <CCardBody className="text-center">
                  <CIcon icon={cilStar} size="2xl" className="mb-2" />
                  <h3 className="mb-0">{grados.length}</h3>
                  <small>Grados Activos</small>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {/* Panel de acciones rápidas por grado */}
          <CRow className="mb-4">
            <CCol md={12}>
              <CCard className="border-0 bg-light">
                <CCardBody>
                  <h6 className="text-primary mb-3">
                    <CIcon icon={cilPrint} className="me-2" />
                    Reportes por Grado
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {grados.map((grado) => {
                      const estudiantesEnGrado = filteredMatriculas.filter((m) => m.grade_name === grado.name).length
                      return (
                        <CButton
                          key={grado.id}
                          color="primary"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadGradePdf(grado.id, grado.name)}
                          className="d-flex align-items-center"
                          disabled={estudiantesEnGrado === 0}
                        >
                          <CIcon icon={cilPrint} className="me-1" />
                          {grado.name}
                          <CBadge color="primary" className="ms-2">
                            {estudiantesEnGrado}
                          </CBadge>
                        </CButton>
                      )
                    })}
                    <CButton
                      color="success"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAllEnrolledPdf}
                      className="d-flex align-items-center ms-3"
                    >
                      <CIcon icon={cilPrint} className="me-1" />
                      Todos los Grados
                      <CBadge color="success" className="ms-2">
                        {filteredMatriculas.length}
                      </CBadge>
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {/* Filtros y búsqueda mejorados */}
          <CCard className="border-0 bg-light mb-4">
            <CCardBody>
              <CRow className="align-items-end">
                <CCol md={5}>
                  <CFormLabel className="fw-semibold text-dark">Buscar Estudiante</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText className="bg-white border-end-0">
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Nombre, apellido o cédula del estudiante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-start-0"
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel className="fw-semibold text-dark">Filtrar por Grado</CFormLabel>
                  <div className="d-flex gap-2">
                    <CFormSelect
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="flex-grow-1"
                    >
                      <option value="">Todos los grados</option>
                      {grados.map((grado) => (
                        <option key={grado.id} value={grado.name}>
                          {grado.name}
                        </option>
                      ))}
                    </CFormSelect>
                    {selectedGrade && (
                      <CButton
                        color="primary"
                        variant="outline"
                        onClick={() => {
                          const selectedGradeObj = grados.find((g) => g.name === selectedGrade)
                          if (selectedGradeObj) {
                            handleDownloadGradePdf(selectedGradeObj.id, selectedGrade)
                          }
                        }}
                        title={`Descargar PDF del grado ${selectedGrade}`}
                      >
                        <CIcon icon={cilPrint} />
                      </CButton>
                    )}
                  </div>
                </CCol>
                <CCol md={4} className="text-end">
                  <div className="bg-white p-3 rounded border">
                    <div className="d-flex align-items-center justify-content-end">
                      <CIcon icon={cilClipboard} className="me-2 text-primary" />
                      <div>
                        <div className="fw-bold text-primary">{currentMatriculas.length}</div>
                        <small className="text-muted">de {filteredMatriculas.length} matrículas</small>
                      </div>
                    </div>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Grid de matrículas mejorado */}
          <CRow>
            {currentMatriculas.length > 0 ? (
              currentMatriculas.map((matricula) => (
                <CCol md={6} lg={4} xl={3} key={matricula.id} className="mb-4">
                  <CCard className="h-100 shadow-sm border-0 hover-shadow">
                    <CCardHeader className="bg-white border-bottom-0 pb-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center">
                          <CAvatar
                            size="md"
                            color={getSexColor(matricula.student_sex)}
                            textColor="white"
                            className="me-2"
                          >
                            {matricula.student_name?.charAt(0)}
                            {matricula.student_lastName?.charAt(0)}
                          </CAvatar>
                          <div>
                            <CBadge color={matricula.repeater ? "warning" : "success"} className="mb-1">
                              {matricula.repeater ? "Repitiente" : "Nuevo"}
                            </CBadge>
                          </div>
                        </div>
                        <CButtonGroup size="sm">
                          <CButton
                            color="primary"
                            variant="ghost"
                            onClick={() => handleViewMatricula(matricula)}
                            title="Ver detalles"
                          >
                            <CIcon icon={cilUser} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="ghost"
                            onClick={() => handleDeleteMatricula(matricula.id)}
                            title="Eliminar"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CButtonGroup>
                      </div>
                    </CCardHeader>
                    <CCardBody className="pt-2">
                      <h6 className="card-title mb-2 text-truncate">
                        {matricula.student_name} {matricula.student_lastName}
                      </h6>
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          <CIcon icon={cilLocationPin} className="me-1" />
                          CI: {matricula.student_ci || "No registrada"}
                        </small>
                        <small className="text-muted d-block">
                          <CIcon icon={cilCalendar} className="me-1" />
                          {formatDate(matricula.registrationDate)}
                        </small>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Documentos</small>
                          <small className="fw-bold">{getDocumentProgress(matricula)}%</small>
                        </div>
                        <CProgress height={6}>
                          <CProgressBar
                            value={getDocumentProgress(matricula)}
                            color={
                              getDocumentProgress(matricula) === 100
                                ? "success"
                                : getDocumentProgress(matricula) > 50
                                  ? "warning"
                                  : "danger"
                            }
                          />
                        </CProgress>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <CBadge color="primary" className="me-1">
                            {matricula.grade_name}
                          </CBadge>
                          <CBadge color="secondary">{matricula.section_name}</CBadge>
                        </div>
                        <CBadge color={getSexColor(matricula.student_sex)} variant="outline">
                          {getSexText(matricula.student_sex)}
                        </CBadge>
                      </div>

                      {matricula.teacher_name && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-muted">
                            <CIcon icon={cilUser} className="me-1" />
                            {matricula.teacher_name} {matricula.teacher_lastName}
                          </small>
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
              ))
            ) : (
              <CCol xs={12}>
                <CCard className="border-0 bg-light text-center py-5">
                  <CCardBody>
                    <CIcon icon={cilSchool} size="3xl" className="text-muted mb-3" />
                    <h5 className="text-muted">
                      {searchTerm || selectedGrade
                        ? "No se encontraron matrículas que coincidan con los filtros"
                        : "No hay matrículas registradas"}
                    </h5>
                    <p className="text-muted">
                      {!searchTerm && !selectedGrade && "Comience creando una nueva matrícula"}
                    </p>
                    {!searchTerm && !selectedGrade && (
                      <CButton color="primary" onClick={() => setShowCreateModal(true)}>
                        <CIcon icon={cilPlus} className="me-2" />
                        Crear Primera Matrícula
                      </CButton>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            )}
          </CRow>

          {/* Paginación mejorada */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <CPagination className="shadow-sm">
                <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  <CIcon icon={cilArrowLeft} />
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
                <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  <CIcon icon={cilArrowLeft} style={{ transform: "rotate(180deg)" }} />
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal para crear nueva matrícula */}
      <CModal size="lg" visible={showCreateModal} onClose={() => setShowCreateModal(false)} backdrop="static">
        <CModalHeader className="bg-primary text-white">
          <CModalTitle>
            <CIcon icon={cilPlus} className="me-2" />
            Nueva Matrícula Escolar
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <CForm>
            <div className="bg-light p-3 rounded mb-4">
              <h6 className="text-primary mb-3">
                <CIcon icon={cilUser} className="me-2" />
                Información del Estudiante
              </h6>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Cédula del Estudiante *</CFormLabel>
                  <CFormInput
                    value={createData.studentCi}
                    onChange={(e) => handleInputChange("studentCi", e.target.value)}
                    placeholder="Ej: 12345678"
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Fecha de Inscripción *</CFormLabel>
                  <CFormInput
                    type="date"
                    value={createData.registrationDate}
                    onChange={(e) => handleInputChange("registrationDate", e.target.value)}
                    required
                  />
                </CCol>
              </CRow>
            </div>

            <div className="bg-light p-3 rounded mb-4">
              <h6 className="text-primary mb-3">
                <CIcon icon={cilSchool} className="me-2" />
                Asignación Académica
              </h6>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Grado *</CFormLabel>
                  <CFormSelect
                    value={createData.gradeID || ""}
                    onChange={(e) => {
                      const gradeId = e.target.value
                      handleInputChange("gradeID", gradeId)
                      if (gradeId) {
                        loadSectionsByGrade(gradeId)
                      }
                    }}
                    required
                  >
                    <option value="">Seleccionar grado...</option>
                    {grados.map((grado) => (
                      <option key={grado.id} value={grado.id}>
                        {grado.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Sección *</CFormLabel>
                  <CFormSelect
                    value={createData.sectionID}
                    onChange={(e) => handleInputChange("sectionID", e.target.value)}
                    required
                    disabled={!createData.gradeID}
                  >
                    <option value="">Seleccionar sección...</option>
                    {secciones.map((seccion) => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.seccion} - {seccion.teacher_name} {seccion.teacher_lastName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
            </div>

            <div className="bg-light p-3 rounded mb-4">
              <h6 className="text-primary mb-3">
                <CIcon icon={cilMedicalCross} className="me-2" />
                Datos Físicos y Uniformes
              </h6>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel className="fw-semibold">Talla Camisa</CFormLabel>
                  <CFormInput
                    value={createData.chemiseSize}
                    onChange={(e) => handleInputChange("chemiseSize", e.target.value)}
                    placeholder="Ej: M, L, XL"
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel className="fw-semibold">Talla Pantalón</CFormLabel>
                  <CFormInput
                    value={createData.pantsSize}
                    onChange={(e) => handleInputChange("pantsSize", e.target.value)}
                    placeholder="Ej: 32, 34, 36"
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel className="fw-semibold">Talla Zapatos</CFormLabel>
                  <CFormInput
                    value={createData.shoesSize}
                    onChange={(e) => handleInputChange("shoesSize", e.target.value)}
                    placeholder="Ej: 38, 39, 40"
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Peso (kg)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.1"
                    value={createData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="Ej: 45.5"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">Estatura (m)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.01"
                    value={createData.stature}
                    onChange={(e) => handleInputChange("stature", e.target.value)}
                    placeholder="Ej: 1.65"
                  />
                </CCol>
              </CRow>
            </div>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormCheck
                  id="repeater"
                  label="¿Es estudiante repitiente?"
                  checked={createData.repeater}
                  onChange={(e) => handleInputChange("repeater", e.target.checked)}
                />
              </CCol>
            </CRow>

            <div className="bg-light p-3 rounded">
              <h6 className="text-primary mb-3">
                <CIcon icon={cilClipboard} className="me-2" />
                Control de Documentos
              </h6>
              <CRow>
                <CCol md={6}>
                  <CFormCheck
                    id="birthCertificateCheck"
                    label="Partida de Nacimiento"
                    checked={createData.birthCertificateCheck}
                    onChange={(e) => handleInputChange("birthCertificateCheck", e.target.checked)}
                  />
                  <CFormCheck
                    id="vaccinationCardCheck"
                    label="Carnet de Vacunas"
                    checked={createData.vaccinationCardCheck}
                    onChange={(e) => handleInputChange("vaccinationCardCheck", e.target.checked)}
                  />
                  <CFormCheck
                    id="studentPhotosCheck"
                    label="Fotos del Estudiante"
                    checked={createData.studentPhotosCheck}
                    onChange={(e) => handleInputChange("studentPhotosCheck", e.target.checked)}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    id="representativePhotosCheck"
                    label="Fotos del Representante"
                    checked={createData.representativePhotosCheck}
                    onChange={(e) => handleInputChange("representativePhotosCheck", e.target.checked)}
                  />
                  <CFormCheck
                    id="representativeCopyIDCheck"
                    label="Copia de Cédula del Representante"
                    checked={createData.representativeCopyIDCheck}
                    onChange={(e) => handleInputChange("representativeCopyIDCheck", e.target.checked)}
                  />
                  <CFormCheck
                    id="autorizedCopyIDCheck"
                    label="Copia de Cédula Autorizada"
                    checked={createData.autorizedCopyIDCheck}
                    onChange={(e) => handleInputChange("autorizedCopyIDCheck", e.target.checked)}
                  />
                </CCol>
              </CRow>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter className="bg-light">
          <CButton color="secondary" onClick={() => setShowCreateModal(false)}>
            <CIcon icon={cilX} className="me-2" />
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCreateMatricula} disabled={updateLoading}>
            {updateLoading ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilSave} className="me-2" />}
            {updateLoading ? "Creando..." : "Crear Matrícula"}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de detalles/edición de matrícula mejorado */}
      <CModal size="xl" visible={showModal} onClose={handleCloseModal} backdrop="static">
        <CModalHeader className="bg-gradient-primary text-white">
          <CModalTitle>
            <div className="d-flex align-items-center">
              <CAvatar size="lg" color={getSexColor(selectedMatricula?.student_sex)} textColor="white" className="me-3">
                {selectedMatricula?.student_name?.charAt(0)}
                {selectedMatricula?.student_lastName?.charAt(0)}
              </CAvatar>
              <div>
                <h5 className="mb-0">{isEditing ? "Editar" : "Perfil de"} Matrícula</h5>
                <small className="opacity-75">
                  {selectedMatricula?.student_name} {selectedMatricula?.student_lastName}
                </small>
              </div>
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-0">
          {selectedMatricula && (
            <>
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)} className="m-4 mb-0">
                  <CIcon icon={cilXCircle} className="me-2" />
                  {error}
                </CAlert>
              )}
              {success && (
                <CAlert color="success" dismissible onClose={() => setSuccess(null)} className="m-4 mb-0">
                  <CIcon icon={cilCheckCircle} className="me-2" />
                  {success}
                </CAlert>
              )}

              {/* Header con información básica */}
              <div className="bg-light p-4 border-bottom">
                <CRow>
                  <CCol md={3}>
                    <div className="text-center">
                      <CBadge color={selectedMatricula.repeater ? "warning" : "success"} size="lg" className="mb-2">
                        {selectedMatricula.repeater ? "Repitiente" : "Nuevo Ingreso"}
                      </CBadge>
                      <div className="fw-bold">ID: {selectedMatricula.id}</div>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <CBadge color="primary" size="lg" className="mb-2">
                        {selectedMatricula.grade_name}
                      </CBadge>
                      <div className="fw-bold">Grado</div>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <CBadge color="secondary" size="lg" className="mb-2">
                        {selectedMatricula.section_name}
                      </CBadge>
                      <div className="fw-bold">Sección</div>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="text-center">
                      <div className="fw-bold text-primary mb-1">{getDocumentProgress(selectedMatricula)}%</div>
                      <CProgress height={8} className="mb-1">
                        <CProgressBar
                          value={getDocumentProgress(selectedMatricula)}
                          color={getDocumentProgress(selectedMatricula) === 100 ? "success" : "warning"}
                        />
                      </CProgress>
                      <small className="text-muted">Documentos</small>
                    </div>
                  </CCol>
                </CRow>
              </div>

              {/* Pestañas de navegación mejoradas */}
              <CNav variant="tabs" role="tablist" className="bg-white border-bottom">
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "estudiante"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("estudiante")
                    }}
                    className="d-flex align-items-center"
                  >
                    <CIcon icon={cilUser} className="me-2" />
                    Datos del Estudiante
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "matricula"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("matricula")
                    }}
                    className="d-flex align-items-center"
                  >
                    <CIcon icon={cilSchool} className="me-2" />
                    Datos de Matrícula
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "fisicos"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("fisicos")
                    }}
                    className="d-flex align-items-center"
                  >
                    <CIcon icon={cilMedicalCross} className="me-2" />
                    Datos Físicos
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "familiares"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("familiares")
                    }}
                    className="d-flex align-items-center"
                  >
                    <CIcon icon={cilHome} className="me-2" />
                    Datos Familiares
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "documentos"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("documentos")
                    }}
                    className="d-flex align-items-center"
                  >
                    <CIcon icon={cilClipboard} className="me-2" />
                    Documentos
                  </CNavLink>
                </CNavItem>
              </CNav>

              <div className="p-4">
                <CTabContent>
                  {/* Datos del Estudiante */}
                  <CTabPane visible={activeTab === "estudiante"}>
                    {isEditing ? (
                      <CForm>
                        <div className="bg-light p-3 rounded mb-4">
                          <h6 className="text-primary mb-3">Información Personal</h6>
                          <CRow className="mb-3">
                            <CCol md={6}>
                              <CFormLabel className="fw-semibold">Nombres *</CFormLabel>
                              <CFormInput
                                value={editingData.student_name || ""}
                                onChange={(e) => handleInputChange("student_name", e.target.value)}
                                required
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel className="fw-semibold">Apellidos *</CFormLabel>
                              <CFormInput
                                value={editingData.student_lastName || ""}
                                onChange={(e) => handleInputChange("student_lastName", e.target.value)}
                                required
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Cédula *</CFormLabel>
                              <CFormInput
                                value={editingData.student_ci || ""}
                                onChange={(e) => handleInputChange("student_ci", e.target.value)}
                                required
                              />
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Sexo *</CFormLabel>
                              <CFormSelect
                                value={editingData.student_sex || ""}
                                onChange={(e) => handleInputChange("student_sex", e.target.value)}
                                required
                              >
                                <option value="">Seleccionar...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                              </CFormSelect>
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Fecha de Nacimiento</CFormLabel>
                              <CFormInput
                                type="date"
                                value={formatDateForInput(editingData.student_birthday)}
                                onChange={(e) => handleInputChange("student_birthday", e.target.value)}
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol md={6}>
                              <CFormLabel className="fw-semibold">Lugar de Nacimiento</CFormLabel>
                              <CFormInput
                                value={editingData.student_placeBirth || ""}
                                onChange={(e) => handleInputChange("student_placeBirth", e.target.value)}
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel className="fw-semibold">Cantidad de Hermanos</CFormLabel>
                              <CFormInput
                                type="number"
                                min="0"
                                value={editingData.student_quantityBrothers || ""}
                                onChange={(e) => handleInputChange("student_quantityBrothers", e.target.value)}
                              />
                            </CCol>
                          </CRow>
                        </div>
                      </CForm>
                    ) : (
                      <CRow>
                        <CCol md={8}>
                          <CListGroup flush>
                            <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                              <div>
                                <strong>Nombres Completos</strong>
                                <div className="text-muted">
                                  {selectedMatricula.student_name} {selectedMatricula.student_lastName}
                                </div>
                              </div>
                              <CBadge color={getSexColor(selectedMatricula.student_sex)} variant="outline">
                                {getSexText(selectedMatricula.student_sex)}
                              </CBadge>
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                              <div>
                                <strong>Cédula de Identidad</strong>
                                <div className="text-muted">{selectedMatricula.student_ci || "No registrada"}</div>
                              </div>
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                              <div>
                                <strong>Fecha de Nacimiento</strong>
                                <div className="text-muted">{formatDate(selectedMatricula.student_birthday)}</div>
                              </div>
                              <CBadge color="info">{calcularEdad(selectedMatricula.student_birthday)}</CBadge>
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                              <div>
                                <strong>Lugar de Nacimiento</strong>
                                <div className="text-muted">
                                  {selectedMatricula.student_placeBirth || "No especificado"}
                                </div>
                              </div>
                            </CListGroupItem>
                          </CListGroup>
                        </CCol>
                        <CCol md={4}>
                          <CCard className="border-0 bg-light">
                            <CCardBody className="text-center">
                              <CIcon icon={cilCalendar} size="2xl" className="text-primary mb-2" />
                              <h6>Fecha de Inscripción</h6>
                              <div className="fw-bold text-primary">
                                {formatDate(selectedMatricula.registrationDate)}
                              </div>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      </CRow>
                    )}
                  </CTabPane>

                  {/* Datos de Matrícula */}
                  <CTabPane visible={activeTab === "matricula"}>
                    {isEditing ? (
                      <CForm>
                        <div className="bg-light p-3 rounded mb-4">
                          <h6 className="text-primary mb-3">Información de Matrícula</h6>
                          <CRow className="mb-3">
                            <CCol md={6}>
                              <CFormLabel className="fw-semibold">Fecha de Inscripción</CFormLabel>
                              <CFormInput
                                type="date"
                                value={formatDateForInput(editingData.registrationDate)}
                                onChange={(e) => handleInputChange("registrationDate", e.target.value)}
                              />
                            </CCol>
                            <CCol md={6}>
                              <div className="pt-4">
                                <CFormCheck
                                  id="repeaterEdit"
                                  label="¿Es estudiante repitiente?"
                                  checked={editingData.repeater || false}
                                  onChange={(e) => handleInputChange("repeater", e.target.checked)}
                                />
                              </div>
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol md={12}>
                              <CFormLabel className="fw-semibold">Observaciones</CFormLabel>
                              <CFormTextarea
                                rows={3}
                                value={editingData.observation || ""}
                                onChange={(e) => handleInputChange("observation", e.target.value)}
                                placeholder="Observaciones adicionales sobre la matrícula..."
                              />
                            </CCol>
                          </CRow>
                        </div>
                      </CForm>
                    ) : (
                      <CRow>
                        <CCol md={6}>
                          <CCard className="border-0 bg-light h-100">
                            <CCardBody>
                              <h6 className="text-primary mb-3">
                                <CIcon icon={cilSchool} className="me-2" />
                                Información Académica
                              </h6>
                              <CListGroup flush>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Grado:</strong> {selectedMatricula.grade_name}
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Sección:</strong> {selectedMatricula.section_name}
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Docente:</strong>{" "}
                                  {selectedMatricula.teacher_name && selectedMatricula.teacher_lastName
                                    ? `${selectedMatricula.teacher_name} ${selectedMatricula.teacher_lastName}`
                                    : "No asignado"}
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Tipo de Ingreso:</strong>
                                  <CBadge color={selectedMatricula.repeater ? "warning" : "success"} className="ms-2">
                                    {selectedMatricula.repeater ? "Repitiente" : "Nuevo Ingreso"}
                                  </CBadge>
                                </CListGroupItem>
                              </CListGroup>
                            </CCardBody>
                          </CCard>
                        </CCol>
                        <CCol md={6}>
                          <CCard className="border-0 bg-light h-100">
                            <CCardBody>
                              <h6 className="text-primary mb-3">
                                <CIcon icon={cilClipboard} className="me-2" />
                                Observaciones
                              </h6>
                              <div className="bg-white p-3 rounded border">
                                {selectedMatricula.observation ? (
                                  <p className="mb-0">{selectedMatricula.observation}</p>
                                ) : (
                                  <em className="text-muted">Sin observaciones registradas</em>
                                )}
                              </div>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      </CRow>
                    )}
                  </CTabPane>

                  {/* Datos Físicos */}
                  <CTabPane visible={activeTab === "fisicos"}>
                    {isEditing ? (
                      <CForm>
                        <div className="bg-light p-3 rounded mb-4">
                          <h6 className="text-primary mb-3">Medidas y Uniformes</h6>
                          <CRow className="mb-3">
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Talla Camisa</CFormLabel>
                              <CFormInput
                                value={editingData.chemiseSize || ""}
                                onChange={(e) => handleInputChange("chemiseSize", e.target.value)}
                                placeholder="Ej: S, M, L, XL"
                              />
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Talla Pantalón</CFormLabel>
                              <CFormInput
                                value={editingData.pantsSize || ""}
                                onChange={(e) => handleInputChange("pantsSize", e.target.value)}
                                placeholder="Ej: 28, 30, 32"
                              />
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Talla Zapatos</CFormLabel>
                              <CFormInput
                                value={editingData.shoesSize || ""}
                                onChange={(e) => handleInputChange("shoesSize", e.target.value)}
                                placeholder="Ej: 36, 38, 40"
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol md={6}>
                              <CFormLabel className="fw-semibold">Peso (kg)</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.1"
                                value={editingData.weight || ""}
                                onChange={(e) => handleInputChange("weight", e.target.value)}
                                placeholder="Ej: 45.5"
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel className="fw-semibold">Estatura (m)</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={editingData.stature || ""}
                                onChange={(e) => handleInputChange("stature", e.target.value)}
                                placeholder="Ej: 1.65"
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol md={12}>
                              <CFormLabel className="fw-semibold">Enfermedades o Alergias</CFormLabel>
                              <CFormTextarea
                                rows={3}
                                value={editingData.diseases || ""}
                                onChange={(e) => handleInputChange("diseases", e.target.value)}
                                placeholder="Especificar enfermedades, alergias o condiciones médicas..."
                              />
                            </CCol>
                          </CRow>
                        </div>
                      </CForm>
                    ) : (
                      <CRow>
                        <CCol md={6}>
                          <CCard className="border-0 bg-light h-100">
                            <CCardBody>
                              <h6 className="text-primary mb-3">
                                <CIcon icon={cilMedicalCross} className="me-2" />
                                Medidas Corporales
                              </h6>
                              <CListGroup flush>
                                <CListGroupItem className="bg-transparent border-0 px-0 d-flex justify-content-between">
                                  <strong>Peso:</strong>
                                  <span>
                                    {selectedMatricula.weight ? `${selectedMatricula.weight} kg` : "No registrado"}
                                  </span>
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0 d-flex justify-content-between">
                                  <strong>Estatura:</strong>
                                  <span>
                                    {selectedMatricula.stature ? `${selectedMatricula.stature} m` : "No registrada"}
                                  </span>
                                </CListGroupItem>
                              </CListGroup>
                            </CCardBody>
                          </CCard>
                        </CCol>
                        <CCol md={6}>
                          <CCard className="border-0 bg-light h-100">
                            <CCardBody>
                              <h6 className="text-primary mb-3">
                                <CIcon icon={cilSchool} className="me-2" />
                                Tallas de Uniforme
                              </h6>
                              <CListGroup flush>
                                <CListGroupItem className="bg-transparent border-0 px-0 d-flex justify-content-between">
                                  <strong>Camisa:</strong>
                                  <CBadge color="secondary">{selectedMatricula.chemiseSize || "No registrada"}</CBadge>
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0 d-flex justify-content-between">
                                  <strong>Pantalón:</strong>
                                  <CBadge color="secondary">{selectedMatricula.pantsSize || "No registrada"}</CBadge>
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0 d-flex justify-content-between">
                                  <strong>Zapatos:</strong>
                                  <CBadge color="secondary">{selectedMatricula.shoesSize || "No registrada"}</CBadge>
                                </CListGroupItem>
                              </CListGroup>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      </CRow>
                    )}

                    {!isEditing && selectedMatricula.diseases && (
                      <CRow className="mt-4">
                        <CCol md={12}>
                          <CCard className="border-0 bg-warning bg-opacity-10 border-warning">
                            <CCardBody>
                              <h6 className="text-warning mb-3">
                                <CIcon icon={cilWarning} className="me-2" />
                                Información Médica Importante
                              </h6>
                              <div className="bg-white p-3 rounded border">{selectedMatricula.diseases}</div>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      </CRow>
                    )}
                  </CTabPane>

                  {/* Datos Familiares */}
                  <CTabPane visible={activeTab === "familiares"}>
                    {isEditing ? (
                      <CForm>
                        <div className="bg-light p-3 rounded mb-4">
                          <h6 className="text-primary mb-3">Información de los Padres</h6>
                          <CRow className="mb-4">
                            <CCol md={12}>
                              <h6 className="text-secondary mb-3">Datos de la Madre</h6>
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Nombre de la Madre</CFormLabel>
                              <CFormInput
                                value={editingData.student_motherName || ""}
                                onChange={(e) => handleInputChange("student_motherName", e.target.value)}
                              />
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Cédula de la Madre</CFormLabel>
                              <CFormInput
                                value={editingData.student_motherCi || ""}
                                onChange={(e) => handleInputChange("student_motherCi", e.target.value)}
                              />
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Teléfono de la Madre</CFormLabel>
                              <CFormInput
                                value={editingData.student_motherTelephone || ""}
                                onChange={(e) => handleInputChange("student_motherTelephone", e.target.value)}
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-4">
                            <CCol md={12}>
                              <h6 className="text-secondary mb-3">Datos del Padre</h6>
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Nombre del Padre</CFormLabel>
                              <CFormInput
                                value={editingData.student_fatherName || ""}
                                onChange={(e) => handleInputChange("student_fatherName", e.target.value)}
                              />
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Cédula del Padre</CFormLabel>
                              <CFormInput
                                value={editingData.student_fatherCi || ""}
                                onChange={(e) => handleInputChange("student_fatherCi", e.target.value)}
                              />
                            </CCol>
                            <CCol md={4}>
                              <CFormLabel className="fw-semibold">Teléfono del Padre</CFormLabel>
                              <CFormInput
                                value={editingData.student_fatherTelephone || ""}
                                onChange={(e) => handleInputChange("student_fatherTelephone", e.target.value)}
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol md={12}>
                              <h6 className="text-secondary mb-3">Situación de Convivencia</h6>
                            </CCol>
                            <CCol md={3}>
                              <CFormCheck
                                id="livesMother"
                                label="Vive con la Madre"
                                checked={editingData.student_livesMother || false}
                                onChange={(e) => handleInputChange("student_livesMother", e.target.checked)}
                              />
                            </CCol>
                            <CCol md={3}>
                              <CFormCheck
                                id="livesFather"
                                label="Vive con el Padre"
                                checked={editingData.student_livesFather || false}
                                onChange={(e) => handleInputChange("student_livesFather", e.target.checked)}
                              />
                            </CCol>
                            <CCol md={3}>
                              <CFormCheck
                                id="livesBoth"
                                label="Vive con Ambos"
                                checked={editingData.student_livesBoth || false}
                                onChange={(e) => handleInputChange("student_livesBoth", e.target.checked)}
                              />
                            </CCol>
                            <CCol md={3}>
                              <CFormCheck
                                id="livesRepresentative"
                                label="Vive con Representante"
                                checked={editingData.student_livesRepresentative || false}
                                onChange={(e) => handleInputChange("student_livesRepresentative", e.target.checked)}
                              />
                            </CCol>
                          </CRow>
                        </div>
                      </CForm>
                    ) : (
                      <CRow>
                        <CCol md={6}>
                          <CCard className="border-0 bg-light h-100">
                            <CCardBody>
                              <h6 className="text-primary mb-3">
                                <CIcon icon={cilUser} className="me-2" />
                                Información de la Madre
                              </h6>
                              <CListGroup flush>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Nombre:</strong> {selectedMatricula.student_motherName || "No registrado"}
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Cédula:</strong> {selectedMatricula.student_motherCi || "No registrada"}
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Teléfono:</strong>{" "}
                                  {selectedMatricula.student_motherTelephone || "No registrado"}
                                </CListGroupItem>
                              </CListGroup>
                            </CCardBody>
                          </CCard>
                        </CCol>
                        <CCol md={6}>
                          <CCard className="border-0 bg-light h-100">
                            <CCardBody>
                              <h6 className="text-primary mb-3">
                                <CIcon icon={cilUser} className="me-2" />
                                Información del Padre
                              </h6>
                              <CListGroup flush>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Nombre:</strong> {selectedMatricula.student_fatherName || "No registrado"}
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Cédula:</strong> {selectedMatricula.student_fatherCi || "No registrado"}
                                </CListGroupItem>
                                <CListGroupItem className="bg-transparent border-0 px-0">
                                  <strong>Teléfono:</strong>{" "}
                                  {selectedMatricula.student_fatherTelephone || "No registrado"}
                                </CListGroupItem>
                              </CListGroup>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      </CRow>
                    )}

                    {!isEditing && (
                      <CRow className="mt-4">
                        <CCol md={12}>
                          <CCard className="border-0 bg-info bg-opacity-10">
                            <CCardBody>
                              <h6 className="text-info mb-3">
                                <CIcon icon={cilHome} className="me-2" />
                                Situación de Convivencia
                              </h6>
                              <div className="d-flex flex-wrap gap-2">
                                {selectedMatricula.student_livesMother && (
                                  <CBadge color="success">Vive con la Madre</CBadge>
                                )}
                                {selectedMatricula.student_livesFather && (
                                  <CBadge color="primary">Vive con el Padre</CBadge>
                                )}
                                {selectedMatricula.student_livesBoth && (
                                  <CBadge color="info">Vive con Ambos Padres</CBadge>
                                )}
                                {selectedMatricula.student_livesRepresentative && (
                                  <CBadge color="warning">Vive con Representante</CBadge>
                                )}
                                {!selectedMatricula.student_livesMother &&
                                  !selectedMatricula.student_livesFather &&
                                  !selectedMatricula.student_livesBoth &&
                                  !selectedMatricula.student_livesRepresentative && (
                                    <CBadge color="secondary">No especificado</CBadge>
                                  )}
                              </div>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      </CRow>
                    )}
                  </CTabPane>

                  {/* Documentos */}
                  <CTabPane visible={activeTab === "documentos"}>
                    {isEditing ? (
                      <CForm>
                        <div className="bg-light p-3 rounded">
                          <h6 className="text-primary mb-3">
                            <CIcon icon={cilClipboard} className="me-2" />
                            Control de Documentos Entregados
                          </h6>
                          <CRow>
                            <CCol md={6}>
                              <div className="mb-3">
                                <CFormCheck
                                  id="birthCertificateCheckEdit"
                                  label="Partida de Nacimiento"
                                  checked={editingData.birthCertificateCheck || false}
                                  onChange={(e) => handleInputChange("birthCertificateCheck", e.target.checked)}
                                />
                              </div>
                              <div className="mb-3">
                                <CFormCheck
                                  id="vaccinationCardCheckEdit"
                                  label="Carnet de Vacunas"
                                  checked={editingData.vaccinationCardCheck || false}
                                  onChange={(e) => handleInputChange("vaccinationCardCheck", e.target.checked)}
                                />
                              </div>
                              <div className="mb-3">
                                <CFormCheck
                                  id="studentPhotosCheckEdit"
                                  label="Fotos del Estudiante"
                                  checked={editingData.studentPhotosCheck || false}
                                  onChange={(e) => handleInputChange("studentPhotosCheck", e.target.checked)}
                                />
                              </div>
                            </CCol>
                            <CCol md={6}>
                              <div className="mb-3">
                                <CFormCheck
                                  id="representativePhotosCheckEdit"
                                  label="Fotos del Representante"
                                  checked={editingData.representativePhotosCheck || false}
                                  onChange={(e) => handleInputChange("representativePhotosCheck", e.target.checked)}
                                />
                              </div>
                              <div className="mb-3">
                                <CFormCheck
                                  id="representativeCopyIDCheckEdit"
                                  label="Copia de Cédula del Representante"
                                  checked={editingData.representativeCopyIDCheck || false}
                                  onChange={(e) => handleInputChange("representativeCopyIDCheck", e.target.checked)}
                                />
                              </div>
                              <div className="mb-3">
                                <CFormCheck
                                  id="autorizedCopyIDCheckEdit"
                                  label="Copia de Cédula Autorizada"
                                  checked={editingData.autorizedCopyIDCheck || false}
                                  onChange={(e) => handleInputChange("autorizedCopyIDCheck", e.target.checked)}
                                />
                              </div>
                            </CCol>
                          </CRow>
                        </div>
                      </CForm>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="text-primary mb-0">
                              <CIcon icon={cilClipboard} className="me-2" />
                              Estado de Documentos
                            </h6>
                            <div className="text-end">
                              <div className="fw-bold text-primary">{getDocumentProgress(selectedMatricula)}%</div>
                              <small className="text-muted">Completado</small>
                            </div>
                          </div>
                          <CProgress height={12} className="mb-3">
                            <CProgressBar
                              value={getDocumentProgress(selectedMatricula)}
                              color={
                                getDocumentProgress(selectedMatricula) === 100
                                  ? "success"
                                  : getDocumentProgress(selectedMatricula) > 50
                                    ? "warning"
                                    : "danger"
                              }
                            />
                          </CProgress>
                        </div>

                        <CRow>
                          <CCol md={6}>
                            <CListGroup flush>
                              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                                <div>
                                  <strong>Partida de Nacimiento</strong>
                                  <div className="text-muted small">Documento oficial de nacimiento</div>
                                </div>
                                <CBadge color={selectedMatricula.birthCertificateCheck ? "success" : "danger"}>
                                  <CIcon
                                    icon={selectedMatricula.birthCertificateCheck ? cilCheckCircle : cilXCircle}
                                    className="me-1"
                                  />
                                  {selectedMatricula.birthCertificateCheck ? "Entregado" : "Pendiente"}
                                </CBadge>
                              </CListGroupItem>
                              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                                <div>
                                  <strong>Carnet de Vacunas</strong>
                                  <div className="text-muted small">Registro de vacunación actualizado</div>
                                </div>
                                <CBadge color={selectedMatricula.vaccinationCardCheck ? "success" : "danger"}>
                                  <CIcon
                                    icon={selectedMatricula.vaccinationCardCheck ? cilCheckCircle : cilXCircle}
                                    className="me-1"
                                  />
                                  {selectedMatricula.vaccinationCardCheck ? "Entregado" : "Pendiente"}
                                </CBadge>
                              </CListGroupItem>
                              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                                <div>
                                  <strong>Fotos del Estudiante</strong>
                                  <div className="text-muted small">Fotografías tipo carnet</div>
                                </div>
                                <CBadge color={selectedMatricula.studentPhotosCheck ? "success" : "danger"}>
                                  <CIcon
                                    icon={selectedMatricula.studentPhotosCheck ? cilCheckCircle : cilXCircle}
                                    className="me-1"
                                  />
                                  {selectedMatricula.studentPhotosCheck ? "Entregado" : "Pendiente"}
                                </CBadge>
                              </CListGroupItem>
                            </CListGroup>
                          </CCol>
                          <CCol md={6}>
                            <CListGroup flush>
                              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                                <div>
                                  <strong>Fotos del Representante</strong>
                                  <div className="text-muted small">Fotografías del representante legal</div>
                                </div>
                                <CBadge color={selectedMatricula.representativePhotosCheck ? "success" : "danger"}>
                                  <CIcon
                                    icon={selectedMatricula.representativePhotosCheck ? cilCheckCircle : cilXCircle}
                                    className="me-1"
                                  />
                                  {selectedMatricula.representativePhotosCheck ? "Entregado" : "Pendiente"}
                                </CBadge>
                              </CListGroupItem>
                              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                                <div>
                                  <strong>Cédula del Representante</strong>
                                  <div className="text-muted small">Copia de documento de identidad</div>
                                </div>
                                <CBadge color={selectedMatricula.representativeCopyIDCheck ? "success" : "danger"}>
                                  <CIcon
                                    icon={selectedMatricula.representativeCopyIDCheck ? cilCheckCircle : cilXCircle}
                                    className="me-1"
                                  />
                                  {selectedMatricula.representativeCopyIDCheck ? "Entregado" : "Pendiente"}
                                </CBadge>
                              </CListGroupItem>
                              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0">
                                <div>
                                  <strong>Cédula Autorizada</strong>
                                  <div className="text-muted small">Documento de autorización</div>
                                </div>
                                <CBadge color={selectedMatricula.autorizedCopyIDCheck ? "success" : "danger"}>
                                  <CIcon
                                    icon={selectedMatricula.autorizedCopyIDCheck ? cilCheckCircle : cilXCircle}
                                    className="me-1"
                                  />
                                  {selectedMatricula.autorizedCopyIDCheck ? "Entregado" : "Pendiente"}
                                </CBadge>
                              </CListGroupItem>
                            </CListGroup>
                          </CCol>
                        </CRow>

                        {getDocumentProgress(selectedMatricula) < 100 && (
                          <CAlert color="warning" className="mt-4">
                            <CIcon icon={cilWarning} className="me-2" />
                            <strong>Documentos Pendientes:</strong> Faltan{" "}
                            {6 - Math.round((getDocumentProgress(selectedMatricula) / 100) * 6)} documentos por entregar
                            para completar el expediente.
                          </CAlert>
                        )}
                      </div>
                    )}
                  </CTabPane>
                </CTabContent>
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter className="bg-light border-top">
          <div className="d-flex justify-content-between w-100">
            <div>
              {!isEditing && (
                <CButton
                  color="danger"
                  variant="outline"
                  onClick={() => handleDeleteMatricula(selectedMatricula?.id, true)}
                  disabled={updateLoading}
                >
                  <CIcon icon={cilTrash} className="me-2" />
                  Eliminar Matrícula
                </CButton>
              )}
            </div>
            <div className="d-flex gap-2">
              {isEditing ? (
                <>
                  <CButton color="secondary" onClick={handleCancelEdit} disabled={updateLoading}>
                    <CIcon icon={cilArrowLeft} className="me-2" />
                    Cancelar
                  </CButton>
                  <CButton color="success" onClick={handleUpdateMatricula} disabled={updateLoading}>
                    {updateLoading ? (
                      <CSpinner size="sm" className="me-2" />
                    ) : (
                      <CIcon icon={cilSave} className="me-2" />
                    )}
                    {updateLoading ? "Guardando..." : "Guardar Cambios"}
                  </CButton>
                </>
              ) : (
                <>
                  <CButton color="secondary" onClick={handleCloseModal}>
                    <CIcon icon={cilX} className="me-2" />
                    Cerrar
                  </CButton>
                  <CButton color="primary" onClick={handleEditMode}>
                    <CIcon icon={cilPencil} className="me-2" />
                    Editar Matrícula
                  </CButton>
                </>
              )}
            </div>
          </div>
        </CModalFooter>
      </CModal>

      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #321fdb 0%, #1f2937 100%);
        }
        
        .card-title {
          font-weight: 600;
          color: #2d3748;
        }
        
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </>
  )
}

// Asegurar que este componente se exporte como default
export default MatriculasList
