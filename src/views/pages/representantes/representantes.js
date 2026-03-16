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
  cilGroup,
} from "@coreui/icons"
import { helpFetch } from "../../../api/helpFetch"
import { useError } from "../../../context/ErrorContext"

const RepresentantesList = () => {
  const { showError } = useError()
  const api = helpFetch(showError)
  const [representantes, setRepresentantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRepresentantes, setFilteredRepresentantes] = useState([])

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [representantesPerPage] = useState(10)

  // Estados para modal
  const [showModal, setShowModal] = useState(false)
  const [selectedRepresentante, setSelectedRepresentante] = useState(null)
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [editingData, setEditingData] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)

  // Estados para estudiantes del representante
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    loadRepresentantes()
  }, [])

  useEffect(() => {
    filterRepresentantes()
  }, [searchTerm, representantes])

  const loadRepresentantes = async () => {
    try {
      setLoading(true)
      console.log("🔄 Cargando representantes...")
      const response = await api.get("/api/representatives")

      if (response && response.ok) {
        console.log("✅ Representantes cargados:", response.representatives)
        setRepresentantes(response.representatives || [])
      }
    } catch (error) {
      console.error("❌ Error en loadRepresentantes:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRepresentativeDetailsAndStudents = async (ci) => {
    try {
      setLoadingStudents(true)
      
      // Peticiones concurrentes
      const [repResponse, studentsResponse] = await Promise.all([
        api.get(`/api/representatives/${ci}`),
        api.get(`/api/students/representative/${ci}`)
      ])

      if (repResponse && repResponse.ok) {
        setSelectedRepresentante(repResponse.representative)
        setEditingData({ ...repResponse.representative })
      }

      if (studentsResponse && studentsResponse.ok) {
        setStudents(studentsResponse.students || [])
      } else {
        setStudents([])
      }
    } catch (error) {
      console.error("❌ Error cargando detalles y estudiantes:", error)
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  const filterRepresentantes = () => {
    let filtered = representantes

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (rep) =>
          rep.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rep.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rep.ci?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRepresentantes(filtered)
    setCurrentPage(1)
  }

  const handleViewRepresentante = (representante) => {
    setSelectedRepresentante(representante)
    setEditingData({ ...representante })
    setActiveTab("personal")
    setIsEditing(false)
    setShowModal(true)
    setSuccess(null)
    
    // Cargar detalles completos y estudiantes asociados
    if (representante.ci) {
      loadRepresentativeDetailsAndStudents(representante.ci)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedRepresentante(null)
    setEditingData({})
    setActiveTab("personal")
    setIsEditing(false)
    setSuccess(null)
    setStudents([])
  }

  const handleDeleteRepresentante = async (ci, fromModal = false) => {
    const rep = fromModal ? selectedRepresentante : representantes.find((r) => r.ci === ci)
    const nombreCompleto = rep ? `${rep.name} ${rep.lastName}` : "este representante"

    if (
      !window.confirm(`¿Está seguro de que desea eliminar a ${nombreCompleto}?\n\nEsta acción no se puede deshacer.`)
    ) {
      return
    }

    try {
      setSuccess(null)
      setUpdateLoading(true)

      const response = await api.delet("/api/representatives", ci)

      if (response && (response.message || response.ok || !response.msg)) {
        setSuccess(`Representante ${nombreCompleto} eliminado exitosamente`)
        await loadRepresentantes()

        if (fromModal) {
          handleCloseModal()
        }
      }
    } catch (error) {
      console.error("❌ Error eliminando representante:", error)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleEditMode = () => {
    setIsEditing(true)
    setEditingData({ ...selectedRepresentante })
    setSuccess(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingData({ ...selectedRepresentante })
    setSuccess(null)
  }

  const handleInputChange = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUpdateRepresentante = async () => {
    try {
      setUpdateLoading(true)
      setSuccess(null)

      const dataToUpdate = {
        ci: editingData.ci,
        name: editingData.name,
        lastName: editingData.lastName,
        telephoneNumber: editingData.telephoneNumber || null,
        email: editingData.email || null,
        maritalStat: editingData.maritalStat || null,
        profesion: editingData.profesion || null,
        birthday: editingData.birthday || null,
        telephoneHouse: editingData.telephoneHouse || null,
        roomAdress: editingData.roomAdress || null,
        workPlace: editingData.workPlace || null,
        jobNumber: editingData.jobNumber || null,
      }

      const response = await api.put(`/api/representatives`, { body: dataToUpdate }, editingData.ci)

      if (response && (response.message || response.ok)) {
        setSuccess("Representante actualizado exitosamente")
        setIsEditing(false)
        setSelectedRepresentante({ ...selectedRepresentante, ...dataToUpdate })
        await loadRepresentantes()
      }
    } catch (error) {
      console.error("❌ Error actualizando representante:", error)
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

  // Calcular página actual
  const indexOfLastRepresentante = currentPage * representantesPerPage
  const indexOfFirstRepresentante = indexOfLastRepresentante - representantesPerPage
  const currentRepresentantes = filteredRepresentantes.slice(indexOfFirstRepresentante, indexOfLastRepresentante)
  const totalPages = Math.ceil(filteredRepresentantes.length / representantesPerPage)

  if (loading && !showModal) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <CSpinner color="primary" size="sm" />
        <span className="ms-2">Cargando representantes...</span>
      </div>
    )
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0">Gestión de Representantes</h5>
          <div className="d-flex gap-2">
            <CButton color="light" variant="outline" onClick={loadRepresentantes} disabled={loading}>
              <CIcon icon={cilReload} className="me-1" />
              Actualizar
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
                {currentRepresentantes.length} de {filteredRepresentantes.length} representantes
              </small>
            </CCol>
          </CRow>

          {/* Tabla de representantes */}
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Representante</CTableHeaderCell>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Teléfono</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentRepresentantes.length > 0 ? (
                currentRepresentantes.map((rep, index) => (
                  <CTableRow key={rep.ci || index}>
                    <CTableDataCell>
                      <strong>
                        {rep.name} {rep.lastName}
                      </strong>
                    </CTableDataCell>
                    <CTableDataCell>{rep.ci}</CTableDataCell>
                    <CTableDataCell>{rep.telephoneNumber || "N/A"}</CTableDataCell>
                    <CTableDataCell>
                      <CButtonGroup size="sm">
                        <CButton
                          color="info"
                          variant="outline"
                          onClick={() => handleViewRepresentante(rep)}
                          title="Ver detalles"
                        >
                          <CIcon icon={cilUser} className="me-1" />
                          Ver más
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          onClick={() => handleDeleteRepresentante(rep.ci)}
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
                  <CTableDataCell colSpan={4} className="text-center text-muted">
                    {searchTerm
                      ? "No se encontraron representantes que coincidan con los filtros"
                      : "No hay representantes registrados"}
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

      {/* Modal de detalles/edición */}
      <CModal size="xl" visible={showModal} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <div className="d-flex align-items-center">
              <CIcon icon={cilUser} className="me-2" />
              {isEditing ? "Editar" : "Detalles del"} Representante - {selectedRepresentante?.name}{" "}
              {selectedRepresentante?.lastName}
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRepresentante && (
            <>
              {/* Header con información básica */}
              <div className="mb-4 p-3 bg-light rounded">
                <CRow>
                  <CCol md={4}>
                    <strong>Cédula:</strong> {selectedRepresentante.ci}
                  </CCol>
                  <CCol md={4}>
                    <strong>Teléfono:</strong> {selectedRepresentante.telephoneNumber || "-"}
                  </CCol>
                  <CCol md={4}>
                    <strong>Email:</strong> {selectedRepresentante.email || "-"}
                  </CCol>
                </CRow>
              </div>

              {/* Pestañas */}
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
                    Datos Generales
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === "estudiantes"}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab("estudiantes")
                    }}
                  >
                    Estudiantes Asignados <CBadge color="primary" className="ms-1">{students.length}</CBadge>
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CTabContent>
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
                        <CCol md={4}>
                          <CFormLabel>Cédula *</CFormLabel>
                          <CFormInput
                            value={editingData.ci || ""}
                            disabled
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Teléfono Celular *</CFormLabel>
                          <CFormInput
                            value={editingData.telephoneNumber || ""}
                            onChange={(e) => handleInputChange("telephoneNumber", e.target.value)}
                            required
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Email</CFormLabel>
                          <CFormInput
                            type="email"
                            value={editingData.email || ""}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={4}>
                          <CFormLabel>Fecha de Nacimiento</CFormLabel>
                          <CFormInput
                            type="date"
                            value={formatDateForInput(editingData.birthday)}
                            onChange={(e) => handleInputChange("birthday", e.target.value)}
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Estado Civil</CFormLabel>
                          <CFormSelect
                            value={editingData.maritalStat || ""}
                            onChange={(e) => handleInputChange("maritalStat", e.target.value)}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="soltero">Soltero(a)</option>
                            <option value="casado">Casado(a)</option>
                            <option value="divorciado">Divorciado(a)</option>
                            <option value="viudo">Viudo(a)</option>
                            <option value="concubinato">Concubinato</option>
                          </CFormSelect>
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Profesión</CFormLabel>
                          <CFormInput
                            value={editingData.profesion || ""}
                            onChange={(e) => handleInputChange("profesion", e.target.value)}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Teléfono de Casa</CFormLabel>
                          <CFormInput
                            value={editingData.telephoneHouse || ""}
                            onChange={(e) => handleInputChange("telephoneHouse", e.target.value)}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Dirección de Habitación</CFormLabel>
                          <CFormInput
                            value={editingData.roomAdress || ""}
                            onChange={(e) => handleInputChange("roomAdress", e.target.value)}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Lugar de Trabajo</CFormLabel>
                          <CFormInput
                            value={editingData.workPlace || ""}
                            onChange={(e) => handleInputChange("workPlace", e.target.value)}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Teléfono del Trabajo</CFormLabel>
                          <CFormInput
                            value={editingData.jobNumber || ""}
                            onChange={(e) => handleInputChange("jobNumber", e.target.value)}
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
                            <strong>{selectedRepresentante.name}</strong>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Apellidos</CTableHeaderCell>
                          <CTableDataCell>
                            <strong>{selectedRepresentante.lastName}</strong>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Cédula</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.ci}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Teléfono Celular</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.telephoneNumber || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Email</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.email || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
                          <CTableDataCell>{formatDate(selectedRepresentante.birthday)}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Estado Civil</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.maritalStat || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Profesión</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.profesion || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Teléfono de Casa</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.telephoneHouse || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Dirección</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.roomAdress || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Lugar de Trabajo</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.workPlace || "-"}</CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Teléfono de Trabajo</CTableHeaderCell>
                          <CTableDataCell>{selectedRepresentante.jobNumber || "-"}</CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>

                <CTabPane visible={activeTab === "estudiantes"}>
                  {loadingStudents ? (
                    <div className="d-flex justify-content-center align-items-center py-4">
                      <CSpinner color="primary" size="sm" />
                      <span className="ms-2">Cargando estudiantes asignados...</span>
                    </div>
                  ) : (
                    <CTable hover responsive bordered>
                      <CTableHead color="light">
                        <CTableRow>
                          <CTableHeaderCell>Cédula</CTableHeaderCell>
                          <CTableHeaderCell>Nombres</CTableHeaderCell>
                          <CTableHeaderCell>Apellidos</CTableHeaderCell>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {students.length > 0 ? (
                          students.map((student) => (
                            <CTableRow key={student.id}>
                              <CTableDataCell>{student.ci || "Sin cédula"}</CTableDataCell>
                              <CTableDataCell>{student.name}</CTableDataCell>
                              <CTableDataCell>{student.lastName}</CTableDataCell>
                              <CTableDataCell>
                                <CBadge color={student.is_enrolled ? "success" : "secondary"}>
                                  {student.status_description || (student.is_enrolled ? "Inscrito" : "No inscrito")}
                                </CBadge>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        ) : (
                          <CTableRow>
                            <CTableDataCell colSpan={4} className="text-center text-muted">
                              Este representante no tiene estudiantes asignados.
                            </CTableDataCell>
                          </CTableRow>
                        )}
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
                  onClick={() => handleDeleteRepresentante(selectedRepresentante?.ci, true)}
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
                  <CButton color="success" onClick={handleUpdateRepresentante} disabled={updateLoading}>
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
                  <CButton color="primary" onClick={handleEditMode}>
                    <CIcon icon={cilPencil} className="me-1" />
                    Editar Representante
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

export default RepresentantesList
