"use client"
import { useState, useEffect } from "react"
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
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
  cilPrint,
} from "@coreui/icons"
import { helpFetch } from "../../../api/helpFetch.js"
import { useError } from "../../../context/ErrorContext"

const EstudianteList = () => {
  const { showError } = useError()
  const api = helpFetch(showError)
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)


  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEstudiantes, setFilteredEstudiantes] = useState([])

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [estudiantesPerPage] = useState(10)

  // Estados para modal
  const [showModal, setShowModal] = useState(false)
  const [selectedEstudiante, setSelectedEstudiante] = useState(null)
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [editingData, setEditingData] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)

  // Función para obtener color del sexo
  const getSexColor = (sex) => {
    if (sex === "Masculino" || sex === "M") return "primary"
    if (sex === "Femenino" || sex === "F") return "danger"
    return "secondary"
  }

  // Función para obtener texto del sexo
  const getSexText = (sex) => {
    if (sex === "M") return "Masculino"
    if (sex === "F") return "Femenino"
    return sex || "No especificado"
  }

  useEffect(() => {
    loadEstudiantes()
  }, [])

  useEffect(() => {
    filterEstudiantes()
  }, [searchTerm, estudiantes])

  const loadEstudiantes = async () => {
    try {
      setLoading(true)
      console.log("🔄 Cargando estudiantes...")
      const response = await api.get("/api/students/list/all/")

      if (response && response.ok) {
        console.log("✅ Estudiantes cargados:", response.students)
        setEstudiantes(response.students || [])
      }
    } catch (error) {
      console.error("❌ Error en loadEstudiantes:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterEstudiantes = () => {
    let filtered = estudiantes

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (estudiante) =>
          estudiante.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estudiante.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estudiante.ci?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredEstudiantes(filtered)
    setCurrentPage(1)
  }

  // Función para abrir modal con datos del estudiante
  const handleViewEstudiante = (estudiante) => {
    setSelectedEstudiante(estudiante)
    setEditingData({ ...estudiante })
    setActiveTab("personal")
    setIsEditing(false)
    setShowModal(true)
    setSuccess(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedEstudiante(null)
    setEditingData({})
    setActiveTab("personal")
    setIsEditing(false)
    setSuccess(null)
  }

  // Función para eliminar estudiante
  const handleDeleteEstudiante = async (estudianteId, fromModal = false) => {
    const estudiante = fromModal ? selectedEstudiante : estudiantes.find((e) => e.id === estudianteId)
    const nombreCompleto = estudiante ? `${estudiante.name} ${estudiante.lastName}` : "este estudiante"

    if (
      !window.confirm(`¿Está seguro de que desea eliminar a ${nombreCompleto}?\n\nEsta acción no se puede deshacer.`)
    ) {
      return
    }

    try {
      setSuccess(null)
      setUpdateLoading(true)

      console.log("🗑️ Eliminando estudiante:", estudianteId)

      const response = await api.delet("/api/students", estudianteId)

      console.log("📥 Respuesta del servidor:", response)

      if (response && (response.message || response.student || !response.msg)) {
        setSuccess(`Estudiante ${nombreCompleto} eliminado exitosamente`)
        await loadEstudiantes()

        if (fromModal) {
          handleCloseModal()
        }
      }
    } catch (error) {
      console.error("❌ Error eliminando estudiante:", error)
    } finally {
      setUpdateLoading(false)
    }
  }

  // Función para activar modo edición
  const handleEditMode = () => {
    setIsEditing(true)
    setEditingData({ ...selectedEstudiante })
    setSuccess(null)
  }

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingData({ ...selectedEstudiante })
    setSuccess(null)
  }

  // Función para manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Función para actualizar estudiante
  const handleUpdateEstudiante = async () => {
    try {
      setUpdateLoading(true)
      setSuccess(null)

      console.log("💾 Actualizando estudiante:", editingData)

      // Preparar datos para actualización
      const dataToUpdate = {
        ci: editingData.ci,
        name: editingData.name,
        lastName: editingData.lastName,
        sex: editingData.sex,
        birthday: editingData.birthday,
        placeBirth: editingData.placeBirth || null,
        parishID: editingData.parishID || null,
        quantityBrothers: Number.parseInt(editingData.quantityBrothers) || 0,
        motherName: editingData.motherName || null,
        motherCi: editingData.motherCi || null,
        motherTelephone: editingData.motherTelephone || null,
        fatherName: editingData.fatherName || null,
        fatherCi: editingData.fatherCi || null,
        fatherTelephone: editingData.fatherTelephone || null,
        livesMother: editingData.livesMother || false,
        livesFather: editingData.livesFather || false,
        livesBoth: editingData.livesBoth || false,
        livesRepresentative: editingData.livesRepresentative || false,
        rolRopresentative: editingData.rolRopresentative || null,
        representativeID: editingData.representativeID || null,
        status_id: editingData.status_id || 1,
      }

      console.log("📤 Datos a enviar:", dataToUpdate)

      // Usar el método put del helpFetch con el ID
      const response = await api.put("/api/students", { body: dataToUpdate }, editingData.id)

      console.log("📥 Respuesta del servidor:", response)

      if (response && (response.message || response.student || response.ok)) {
        setSuccess("Estudiante actualizado exitosamente")
        setIsEditing(false)

        // Actualizar el estudiante seleccionado con los nuevos datos
        setSelectedEstudiante({ ...selectedEstudiante, ...dataToUpdate })

        // Recargar la lista
        await loadEstudiantes()
      }
    } catch (error) {
      console.error("❌ Error actualizando estudiante:", error)
    } finally {
      setUpdateLoading(false)
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

  // Calcular estudiantes para la página actual
  const indexOfLastEstudiante = currentPage * estudiantesPerPage
  const indexOfFirstEstudiante = indexOfLastEstudiante - estudiantesPerPage
  const currentEstudiantes = filteredEstudiantes.slice(indexOfFirstEstudiante, indexOfLastEstudiante)
  const totalPages = Math.ceil(filteredEstudiantes.length / estudiantesPerPage)

  const handleDownloadPdf = async () => {
    try {
      const blob = await api.downloadFile("/api/pdf/students/list/all")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "Listado_total_estudiantes.pdf")
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error descargando PDF:", error)
    }
  }

  const handleDownloadPdf1 = async (id, nombre) => {
    try {
      if (!id) throw new Error("ID del estudiante no proporcionado")

      const blob = await api.downloadFile(`/api/pdf/student/${id}/details`)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Alumno_${nombre || id}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error descargando PDF del estudiante:", error)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <CSpinner color="primary" size="sm" />
        <span className="ms-2">Cargando estudiantes...</span>
      </div>
    )
  }

  // Assuming the component starts here and `useError` and `helpFetch` are imported
  // Example imports (add these at the top of your file if not present):
  // import { useState, useEffect } from 'react';
  // import { helpFetch } from 'src/helpers/helpFetch'; // Adjust path as needed
  // import { useError } from 'src/hooks/useError'; // Adjust path as needed

  // Inside your functional component:
  // const { showError, showSuccess } = useError();
  // const api = helpFetch(showError, showSuccess); // Pass both showError and showSuccess

  return (
    <>
      {/* Removed local alerts */}

      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0">Gestión de Estudiantes</h5>
          <div className="d-flex gap-2">
            <CButton color="light" variant="outline" onClick={loadEstudiantes} disabled={loading}>
              <CIcon icon={cilReload} className="me-1" />
              Actualizar
            </CButton>
            <CButton color="light" variant="outline" onClick={handleDownloadPdf}>
              <CIcon icon={cilPrint} className="me-1" />
              Imprimir PDF
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {/* Filtros y búsqueda */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar por nombre, apellido o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol md={6} className="text-end">
              <small className="text-muted">
                {currentEstudiantes.length} de {filteredEstudiantes.length} estudiantes
              </small>
            </CCol>
          </CRow>

          {/* Tabla de estudiantes */}
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Estudiante</CTableHeaderCell>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Edad</CTableHeaderCell>
                <CTableHeaderCell>Sexo</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentEstudiantes.length > 0 ? (
                currentEstudiantes.map((estudiante) => (
                  <CTableRow key={estudiante.id}>
                    <CTableDataCell>
                      <strong>
                        {estudiante.name} {estudiante.lastName}
                      </strong>
                    </CTableDataCell>
                    <CTableDataCell>{estudiante.ci || "-"}</CTableDataCell>
                    <CTableDataCell>{calcularEdad(estudiante.birthday)}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getSexColor(estudiante.sex)}>{getSexText(estudiante.sex)}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={estudiante.is_enrolled ? "success" : "secondary"}>
                        {estudiante.is_enrolled ? "Inscrito" : "No inscrito"}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButtonGroup size="sm">
                        <CButton
                          color="info"
                          variant="outline"
                          onClick={() => handleViewEstudiante(estudiante)}
                          title="Ver detalles completos"
                        >
                          <CIcon icon={cilUser} className="me-1" />
                          Ver más
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          onClick={() => handleDeleteEstudiante(estudiante.id)}
                          title="Eliminar"
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CButtonGroup>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={6} className="text-center text-muted">
                    {searchTerm
                      ? "No se encontraron estudiantes que coincidan con los filtros"
                      : "No hay estudiantes registrados"}
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <CPagination>
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
                <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  Siguiente
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal de detalles/edición del estudiante */}
      <CModal size="xl" visible={showModal} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <div className="d-flex align-items-center">
              <CIcon icon={cilUser} className="me-2" />
              {isEditing ? "Editar" : "Detalles del"} Estudiante - {selectedEstudiante?.name}{" "}
              {selectedEstudiante?.lastName}
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEstudiante && (
            <>
              {/* Removed local alerts */}

              {/* Header con información básica */}
              <div className="mb-4 p-3 bg-light rounded">
                <CRow>
                  <CCol md={3}>
                    <strong>ID:</strong> {selectedEstudiante.id}
                  </CCol>
                  <CCol md={3}>
                    <strong>Cédula:</strong> {isEditing ? editingData.ci : selectedEstudiante.ci}
                  </CCol>
                  <CCol md={3}>
                    <strong>Edad:</strong>{" "}
                    {calcularEdad(isEditing ? editingData.birthday : selectedEstudiante.birthday)}
                  </CCol>
                  <CCol md={3}>
                    <CBadge color={selectedEstudiante.is_enrolled ? "success" : "secondary"} size="lg">
                      {selectedEstudiante.is_enrolled ? "Inscrito" : "No inscrito"}
                    </CBadge>
                  </CCol>
                </CRow>
              </div>

              {/* Pestañas de información */}
              <CNav variant="tabs" role="tablist" className="mb-3">
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "personal"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("personal")
                    }}
                  >
                    Datos Personales
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "familiar"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("familiar")
                    }}
                  >
                    Datos Familiares
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "representante"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("representante")
                    }}
                  >
                    Representante
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "convivencia"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("convivencia")
                    }}
                  >
                    Convivencia
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CTabContent>
                {/* Datos Personales */}
                <CTabPane visible={activeTab === "personal"}>
                  {isEditing ? (
                    <CForm>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Nombres *</CFormLabel>
                          <CFormInput
                            value={editingData.name || ""}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            required
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Apellidos *</CFormLabel>
                          <CFormInput
                            value={editingData.lastName || ""}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            required
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Cédula *</CFormLabel>
                          <CFormInput
                            value={editingData.ci || ""}
                            onChange={(e) => handleInputChange("ci", e.target.value)}
                            required
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Sexo *</CFormLabel>
                          <CFormSelect
                            value={editingData.sex || ""}
                            onChange={(e) => handleInputChange("sex", e.target.value)}
                            required
                          >
                            <option value="">Seleccionar...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                          </CFormSelect>
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Fecha de Nacimiento</CFormLabel>
                          <CFormInput
                            type="date"
                            value={formatDateForInput(editingData.birthday)}
                            onChange={(e) => handleInputChange("birthday", e.target.value)}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Lugar de Nacimiento</CFormLabel>
                          <CFormInput
                            value={editingData.placeBirth || ""}
                            onChange={(e) => handleInputChange("placeBirth", e.target.value)}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Cantidad de Hermanos</CFormLabel>
                          <CFormInput
                            type="number"
                            min="0"
                            value={editingData.quantityBrothers || ""}
                            onChange={(e) => handleInputChange("quantityBrothers", e.target.value)}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Parroquia ID</CFormLabel>
                          <CFormInput
                            type="number"
                            value={editingData.parishID || ""}
                            onChange={(e) => handleInputChange("parishID", e.target.value)}
                          />
                        </CCol>
                      </CRow>
                    </CForm>
                  ) : (
                    <CTable striped bordered>
                      <CTableBody>
                        <CTableRow>
                          <CTableHeaderCell style={{ width: "30%" }}>Nombres</CTableHeaderCell>
                          <CTableDataCell>
                            <strong>{selectedEstudiante.name}</strong>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Apellidos</CTableHeaderCell>
                          <CTableDataCell>
                            <strong>{selectedEstudiante.lastName}</strong>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Cédula</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.ci}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Sexo</CTableHeaderCell>
                          <CTableDataCell>
                            <CBadge color={getSexColor(selectedEstudiante.sex)}>
                              {getSexText(selectedEstudiante.sex)}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
                          <CTableDataCell>{formatDate(selectedEstudiante.birthday)}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Lugar de Nacimiento</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.placeBirth || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Cantidad de Hermanos</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.quantityBrothers || "0"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Parroquia ID</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.parishID || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableDataCell>
                            <CBadge color="success">{selectedEstudiante.status_description || "Activo"}</CBadge>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Fecha de Registro</CTableHeaderCell>
                          <CTableDataCell>{formatDate(selectedEstudiante.created_at)}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Última Actualización</CTableHeaderCell>
                          <CTableDataCell>{formatDate(selectedEstudiante.updated_at)}</CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>

                {/* Datos Familiares */}
                <CTabPane visible={activeTab === "familiar"}>
                  {isEditing ? (
                    <CForm>
                      <h6 className="mb-3 text-primary">Datos de la Madre</h6>
                      <CRow className="mb-3">
                        <CCol md={4}>
                          <CFormLabel>Nombre de la Madre</CFormLabel>
                          <CFormInput
                            value={editingData.motherName || ""}
                            onChange={(e) => handleInputChange("motherName", e.target.value)}
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Cédula de la Madre</CFormLabel>
                          <CFormInput
                            value={editingData.motherCi || ""}
                            onChange={(e) => handleInputChange("motherCi", e.target.value)}
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Teléfono de la Madre</CFormLabel>
                          <CFormInput
                            value={editingData.motherTelephone || ""}
                            onChange={(e) => handleInputChange("motherTelephone", e.target.value)}
                          />
                        </CCol>
                      </CRow>

                      <h6 className="mb-3 text-primary">Datos del Padre</h6>
                      <CRow className="mb-3">
                        <CCol md={4}>
                          <CFormLabel>Nombre del Padre</CFormLabel>
                          <CFormInput
                            value={editingData.fatherName || ""}
                            onChange={(e) => handleInputChange("fatherName", e.target.value)}
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Cédula del Padre</CFormLabel>
                          <CFormInput
                            value={editingData.fatherCi || ""}
                            onChange={(e) => handleInputChange("fatherCi", e.target.value)}
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Teléfono del Padre</CFormLabel>
                          <CFormInput
                            value={editingData.fatherTelephone || ""}
                            onChange={(e) => handleInputChange("fatherTelephone", e.target.value)}
                          />
                        </CCol>
                      </CRow>
                    </CForm>
                  ) : (
                    <CTable striped bordered>
                      <CTableBody>
                        <CTableRow>
                          <CTableHeaderCell style={{ width: "30%" }}>Nombre de la Madre</CTableHeaderCell>
                          <CTableDataCell>
                            <strong>{selectedEstudiante.motherName || "-"}</strong>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Cédula de la Madre</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.motherCi || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Teléfono de la Madre</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.motherTelephone || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Nombre del Padre</CTableHeaderCell>
                          <CTableDataCell>
                            <strong>{selectedEstudiante.fatherName || "-"}</strong>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Cédula del Padre</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.fatherCi || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Teléfono del Padre</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.fatherTelephone || "-"}</CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>

                {/* Representante */}
                <CTabPane visible={activeTab === "representante"}>
                  {isEditing ? (
                    <CForm>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Cédula del Representante</CFormLabel>
                          <CFormInput
                            value={editingData.representativeID || ""}
                            onChange={(e) => handleInputChange("representativeID", e.target.value)}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Rol del Representante</CFormLabel>
                          <CFormSelect
                            value={editingData.rolRopresentative || ""}
                            onChange={(e) => handleInputChange("rolRopresentative", e.target.value)}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Madre">Madre</option>
                            <option value="Padre">Padre</option>
                            <option value="Abuelo/a">Abuelo/a</option>
                            <option value="Tío/a">Tío/a</option>
                            <option value="Hermano/a">Hermano/a</option>
                            <option value="Otro">Otro</option>
                          </CFormSelect>
                        </CCol>
                      </CRow>
                    </CForm>
                  ) : (
                    <CTable striped bordered>
                      <CTableBody>
                        <CTableRow>
                          <CTableHeaderCell style={{ width: "30%" }}>ID del Representante</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.representativeID || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Nombres del Representante</CTableHeaderCell>
                          <CTableDataCell>
                            <strong>{selectedEstudiante.representative_name || "-"}</strong>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Apellidos del Representante</CTableHeaderCell>
                          <CTableDataCell>
                            <strong>{selectedEstudiante.representative_lastName || "-"}</strong>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Teléfono del Representante</CTableHeaderCell>
                          <CTableDataCell>{selectedEstudiante.representative_phone || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Rol del Representante</CTableHeaderCell>
                          <CTableDataCell>
                            <CBadge color="info">{selectedEstudiante.rolRopresentative || "-"}</CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>

                {/* Convivencia */}
                <CTabPane visible={activeTab === "convivencia"}>
                  {isEditing ? (
                    <CForm>
                      <h6 className="mb-3 text-primary">Situación de Convivencia</h6>
                      <CRow className="mb-3">
                        <CCol md={3}>
                          <CFormCheck
                            id="livesMother"
                            label="Vive con la Madre"
                            checked={editingData.livesMother || false}
                            onChange={(e) => handleInputChange("livesMother", e.target.checked)}
                          />
                        </CCol>
                        <CCol md={3}>
                          <CFormCheck
                            id="livesFather"
                            label="Vive con el Padre"
                            checked={editingData.livesFather || false}
                            onChange={(e) => handleInputChange("livesFather", e.target.checked)}
                          />
                        </CCol>
                        <CCol md={3}>
                          <CFormCheck
                            id="livesBoth"
                            label="Vive con Ambos Padres"
                            checked={editingData.livesBoth || false}
                            onChange={(e) => handleInputChange("livesBoth", e.target.checked)}
                          />
                        </CCol>
                        <CCol md={3}>
                          <CFormCheck
                            id="livesRepresentative"
                            label="Vive con Representante"
                            checked={editingData.livesRepresentative || false}
                            onChange={(e) => handleInputChange("livesRepresentative", e.target.checked)}
                          />
                        </CCol>
                      </CRow>
                    </CForm>
                  ) : (
                    <CTable striped bordered>
                      <CTableBody>
                        <CTableRow>
                          <CTableHeaderCell style={{ width: "30%" }}>Vive con la Madre</CTableHeaderCell>
                          <CTableDataCell>
                            <CBadge color={selectedEstudiante.livesMother ? "success" : "secondary"}>
                              {selectedEstudiante.livesMother ? "Sí" : "No"}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Vive con el Padre</CTableHeaderCell>
                          <CTableDataCell>
                            <CBadge color={selectedEstudiante.livesFather ? "success" : "secondary"}>
                              {selectedEstudiante.livesFather ? "Sí" : "No"}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Vive con Ambos Padres</CTableHeaderCell>
                          <CTableDataCell>
                            <CBadge color={selectedEstudiante.livesBoth ? "success" : "secondary"}>
                              {selectedEstudiante.livesBoth ? "Sí" : "No"}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Vive con Representante</CTableHeaderCell>
                          <CTableDataCell>
                            <CBadge color={selectedEstudiante.livesRepresentative ? "success" : "secondary"}>
                              {selectedEstudiante.livesRepresentative ? "Sí" : "No"}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Situación de Convivencia</CTableHeaderCell>
                          <CTableDataCell>
                            <div className="p-2 bg-light rounded">
                              {selectedEstudiante.livesBoth && (
                                <CBadge color="success" className="me-2">
                                  Ambos Padres
                                </CBadge>
                              )}
                              {selectedEstudiante.livesMother && !selectedEstudiante.livesBoth && (
                                <CBadge color="info" className="me-2">
                                  Solo Madre
                                </CBadge>
                              )}
                              {selectedEstudiante.livesFather && !selectedEstudiante.livesBoth && (
                                <CBadge color="primary" className="me-2">
                                  Solo Padre
                                </CBadge>
                              )}
                              {selectedEstudiante.livesRepresentative && (
                                <CBadge color="warning" className="me-2">
                                  Con Representante
                                </CBadge>
                              )}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>
              </CTabContent>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <div className="d-flex justify-content-between w-100">
            <div>
              {!isEditing && (
                <CButton
                  color="danger"
                  variant="outline"
                  onClick={() => handleDeleteEstudiante(selectedEstudiante?.id, true)}
                  disabled={updateLoading}
                >
                  <CIcon icon={cilTrash} className="me-1" />
                  Eliminar
                </CButton>
              )}
            </div>
            <div className="d-flex gap-2">
              {isEditing ? (
                <>
                  <CButton color="secondary" onClick={handleCancelEdit} disabled={updateLoading}>
                    <CIcon icon={cilArrowLeft} className="me-1" />
                    Cancelar
                  </CButton>
                  <CButton color="success" onClick={handleUpdateEstudiante} disabled={updateLoading}>
                    {updateLoading ? (
                      <CSpinner size="sm" className="me-1" />
                    ) : (
                      <CIcon icon={cilSave} className="me-1" />
                    )}
                    {updateLoading ? "Guardando..." : "Guardar Cambios"}
                  </CButton>
                </>
              ) : (
                <>
                  <CButton color="secondary" onClick={handleCloseModal}>
                    <CIcon icon={cilX} className="me-1" />
                    Cerrar
                  </CButton>
                  <CButton
                    color="success"
                    onClick={() => handleDownloadPdf1(selectedEstudiante.id, selectedEstudiante.name)}
                  >
                    <CIcon icon={cilPrint} className="me-1" />
                    Imprimir PDF
                  </CButton>
                  <CButton color="primary" onClick={handleEditMode}>
                    <CIcon icon={cilPencil} className="me-1" />
                    Editar Estudiante
                  </CButton>
                </>
              )}
            </div>
          </div>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default EstudianteList
