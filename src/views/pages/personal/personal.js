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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
  CFormLabel,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import {
  cilUser,
  cilUserPlus,
  cilTrash,
  cilPencil,
  cilSearch,
  cilReload,
  cilPrint,
  cilEducation,
  cilPeople,
} from "@coreui/icons"
import { helpFetch } from "../../../api/helpFetch.js"
import { detectDarkMode, getRoleColorById, customCSS } from "../../styles/theme-variables.js"
import { useError } from "../../../context/ErrorContext"

const PersonalManagement = () => {
  const { showError } = useError()
  const api = helpFetch(showError)
  // Estados principales
  const [personal, setPersonal] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [filteredPersonal, setFilteredPersonal] = useState([])

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [personalPerPage] = useState(10)

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPersonal, setSelectedPersonal] = useState(null)

  // Estados para datos de utilidad
  const [roles, setRoles] = useState([])
  const [parroquias, setParroquias] = useState([])

  // Estados para formularios
  const [personalForm, setPersonalForm] = useState({
    name: "",
    lastName: "",
    ci: "",
    email: "",
    telephoneNumber: "",
    birthday: "",
    direction: "",
    parishID: "",
    idRole: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    filterPersonal()
  }, [searchTerm, selectedRole, personal])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      console.log("📡 Cargando datos iniciales del personal...")

      // Cargar datos en paralelo
      const [personalData, rolesData, parroquiasData] = await Promise.all([
        api.get("/api/personal"),
        api.get("/api/personal/utils/roles"),
        api.get("/api/personal/utils/parroquias"),
      ])

      console.log("📊 Respuesta personal:", personalData)
      console.log("🎭 Respuesta roles:", rolesData)
      console.log("🏘️ Respuesta parroquias:", parroquiasData)

      // Procesar personal
      if (personalData && personalData.ok) {
        setPersonal(personalData.personal || [])
      } else {
        throw new Error(personalData?.msg || "Error al cargar personal")
      }

      // Procesar roles
      if (rolesData && rolesData.ok) {
        setRoles(rolesData.roles || [])
      } else {
        console.warn("⚠️ No se pudieron cargar los roles")
        setRoles([])
      }

      // Procesar parroquias
      if (parroquiasData && parroquiasData.ok) {
        setParroquias(parroquiasData.parroquias || [])
      } else {
        console.warn("⚠️ No se pudieron cargar las parroquias")
        setParroquias([])
      }

      console.log("✅ Datos iniciales cargados exitosamente")
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPersonal = () => {
    let filtered = personal

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (person) =>
          person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.ci?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por rol
    if (selectedRole) {
      filtered = filtered.filter((person) => String(person.idRole) === String(selectedRole))
    }

    setFilteredPersonal(filtered)
    setCurrentPage(1)
  }

  const getRoleName = (roleId) => {
    if (!roleId && roleId !== 0) return "No especificado"
    if (!roles || roles.length === 0) return "Cargando..."

    const role = roles.find((r) => String(r.id) === String(roleId))
    return role ? role.nombre : `ID: ${roleId}`
  }

  const getParroquiaName = (parroquiaId) => {
    if (!parroquiaId && parroquiaId !== 0) return "No especificada"
    if (!parroquias || parroquias.length === 0) return "Cargando..."

    const parroquia = parroquias.find((p) => String(p.id) === String(parroquiaId))
    return parroquia ? parroquia.nombre : `ID: ${parroquiaId}`
  }

  const handleCreatePersonal = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      setSuccess(null)

      const dataToSend = {
        name: personalForm.name.trim(),
        lastName: personalForm.lastName.trim(),
        ci: personalForm.ci.trim(),
        email: personalForm.email.trim(),
        telephoneNumber: personalForm.telephoneNumber.trim(),
        birthday: personalForm.birthday,
        direction: personalForm.direction.trim(),
        parishID: Number.parseInt(personalForm.parishID),
        idRole: Number.parseInt(personalForm.idRole),
      }

      console.log("👤 Creando personal:", dataToSend)

      const response = await api.post("/api/personal", { body: dataToSend })

      console.log("📡 Respuesta crear personal:", response)

      if (response && response.ok) {
        setSuccess("Personal creado exitosamente")
        setShowCreateModal(false)
        resetForm()
        await loadInitialData()
      } else {
        throw new Error(response?.msg || "Error al crear personal")
      }
    } catch (error) {
      console.error("❌ Error creando personal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePersonal = async () => {
    if (!validateForm() || !selectedPersonal) return

    try {
      setIsSubmitting(true)
      setSuccess(null)

      const dataToSend = {
        name: personalForm.name.trim(),
        lastName: personalForm.lastName.trim(),
        ci: personalForm.ci.trim(),
        email: personalForm.email.trim(),
        telephoneNumber: personalForm.telephoneNumber.trim(),
        birthday: personalForm.birthday,
        direction: personalForm.direction.trim(),
        parishID: Number.parseInt(personalForm.parishID),
        idRole: Number.parseInt(personalForm.idRole),
      }

      console.log("💾 Actualizando personal:", selectedPersonal.id, dataToSend)

      const response = await api.put(`/api/personal/${selectedPersonal.id}`, { body: dataToSend })

      console.log("📡 Respuesta actualizar personal:", response)

      if (response && response.ok) {
        setSuccess("Personal actualizado exitosamente")
        setShowEditModal(false)
        setSelectedPersonal(null)
        resetForm()
        await loadInitialData()
      } else {
        throw new Error(response?.msg || "Error al actualizar personal")
      }
    } catch (error) {
      console.error("❌ Error actualizando personal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePersonal = async () => {
    if (!selectedPersonal) return

    try {
      setIsSubmitting(true)
      setSuccess(null)

      console.log("🗑️ Eliminando personal:", selectedPersonal.id)

      const response = await api.del(`/api/personal/${selectedPersonal.id}`)

      console.log("📡 Respuesta eliminar personal:", response)

      if (response && response.ok) {
        setSuccess("Personal eliminado exitosamente")
        setShowDeleteModal(false)
        setSelectedPersonal(null)
        await loadInitialData()
      } else {
        throw new Error(response?.msg || "Error al eliminar personal")
      }
    } catch (error) {
      console.error("❌ Error eliminando personal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateForm = () => {
    if (
      !personalForm.name ||
      !personalForm.lastName ||
      !personalForm.ci ||
      !personalForm.email ||
      !personalForm.telephoneNumber ||
      !personalForm.birthday ||
      !personalForm.direction ||
      !personalForm.parishID ||
      !personalForm.idRole
    ) {
      showError({
        type: "validation",
        msg: "Por favor, complete todos los campos requeridos",
      })
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalForm.email)) {
      showError({
        type: "validation",
        msg: "Formato de email inválido",
      })
      return false
    }

    return true
  }

  const resetForm = () => {
    setPersonalForm({
      name: "",
      lastName: "",
      ci: "",
      email: "",
      telephoneNumber: "",
      birthday: "",
      direction: "",
      parishID: "",
      idRole: "",
    })
  }

  const openCreateModal = () => {
    resetForm()
    setSelectedPersonal(null)
    setShowCreateModal(true)
  }

  const openEditModal = (person) => {
    setSelectedPersonal(person)
    setPersonalForm({
      name: person.name || "",
      lastName: person.lastName || "",
      ci: person.ci || "",
      email: person.email || "",
      telephoneNumber: person.telephoneNumber || "",
      birthday: person.birthday ? new Date(person.birthday).toISOString().split("T")[0] : "",
      direction: person.direction || "",
      parishID: person.parish || "",
      idRole: person.idRole || "",
    })
    setShowEditModal(true)
  }

  const openViewModal = (person) => {
    setSelectedPersonal(person)
    setShowViewModal(true)
  }

  const openDeleteModal = (person) => {
    setSelectedPersonal(person)
    setShowDeleteModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setPersonalForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDownloadPdf = async (roleId = null, roleName = "Personal") => {
    try {
      let endpoint = "/api/pdf/personal/list/all"

      if (roleId) {
        // Si el rol es 1 (Docente), usamos la ruta específica propuesta
        endpoint = String(roleId) === "1" ? "/api/pdf/personal/teachers/list" : `/api/pdf/personal/list/role/${roleId}`
      }

      const blob = await api.downloadFile(endpoint)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Listado_${roleName.replace(/\s+/g, "_")}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess(`PDF de ${roleName} descargado exitosamente`)
    } catch (error) {
      console.error("❌ Error descargando PDF:", error)
    }
  }

  const handleDownloadPersonalPdf = async (personalId, personalName, roleId) => {
    try {
      // Si el rol es 1 (Docente), usamos la ruta específica propuesta
      const endpoint =
        String(roleId) === "1" ? `/api/pdf/personal/teacher/${personalId}/details` : `/api/pdf/personal/${personalId}/details`

      const blob = await api.downloadFile(endpoint)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Personal_${personalName.replace(/\s+/g, "_")}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess("PDF del personal descargado exitosamente")
    } catch (error) {
      console.error("❌ Error descargando PDF del personal:", error)
    }
  }

  // Calcular personal para la página actual
  const indexOfLastPersonal = currentPage * personalPerPage
  const indexOfFirstPersonal = indexOfLastPersonal - personalPerPage
  const currentPersonal = filteredPersonal.slice(indexOfFirstPersonal, indexOfLastPersonal)
  const totalPages = Math.ceil(filteredPersonal.length / personalPerPage)

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-2 text-body-emphasis">Cargando datos del personal...</span>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <CCard className="shadow-theme card-theme">
        <CCardHeader className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CIcon icon={cilPeople} size="xl" className="me-3" />
              <div>
                <h4 className="mb-0">Gestión de Personal</h4>
                <small className="text-white-50">Sistema de administración del personal institucional</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <CButton
                color="light"
                variant="outline"
                onClick={openCreateModal}
                className="border-2 text-white border-white"
              >
                <CIcon icon={cilUserPlus} className="me-2" />
                Nuevo Personal
              </CButton>
              <CButton
                color="light"
                variant="outline"
                onClick={loadInitialData}
                disabled={loading}
                className="border-2 text-white border-white"
              >
                <CIcon icon={cilReload} className="me-2" />
                Actualizar
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody className="p-4">
          {/* Panel de estadísticas por rol usando colores de CoreUI */}
          <CRow className="mb-4">
            {roles.map((role) => {
              const roleCount = personal.filter((p) => String(p.idRole) === String(role.id)).length
              const roleColor = getRoleColorById(role.id)
              return (
                <CCol md={3} key={role.id}>
                  <CCard className={`border-0 bg-${roleColor} text-white h-100`}>
                    <CCardBody className="text-center">
                      <CIcon icon={role.id === 1 ? cilEducation : cilUser} size="2xl" className="mb-2" />
                      <h3 className="mb-0">{roleCount}</h3>
                      <small>{role.nombre}</small>
                      <div className="mt-2">
                        <CButton
                          color="light"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPdf(role.id, role.nombre)}
                          className="border-2"
                        >
                          <CIcon icon={cilPrint} className="me-1" />
                          PDF
                        </CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              )
            })}
          </CRow>

          {/* Filtros y búsqueda */}
          <CCard className="border-0 mb-4 bg-body-tertiary">
            <CCardBody>
              <CRow className="align-items-end">
                <CCol md={5}>
                  <CFormLabel className="fw-semibold text-body-emphasis">Buscar Personal</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Nombre, apellido, cédula o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="theme-transition"
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel className="fw-semibold text-body-emphasis">Filtrar por Rol</CFormLabel>
                  <CFormSelect
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="theme-transition"
                  >
                    <option value="">Todos los roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.nombre}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4} className="text-end ">
                  <div className="p-3 rounded border theme-transition">
                    <div className="d-flex align-items-center justify-content-end">
                      <CIcon icon={cilPeople} className="me-2 text-primary" />
                      <div>
                        <div className="fw-bold text-primary">{currentPersonal.length}</div>
                        <small className="text-body-secondary">de {filteredPersonal.length} personas</small>
                      </div>
                    </div>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Tabla de personal */}
          <CTable hover responsive className="rounded shadow-sm table-theme">
            <CTableHead className="bg-light">
              <CTableRow>
                <CTableHeaderCell className="text-body-emphasis">Personal</CTableHeaderCell>
                <CTableHeaderCell className="text-body-emphasis">Cédula</CTableHeaderCell>
                <CTableHeaderCell className="text-body-emphasis">Email</CTableHeaderCell>
                <CTableHeaderCell className="text-body-emphasis">Teléfono</CTableHeaderCell>
                <CTableHeaderCell className="text-body-emphasis">Rol</CTableHeaderCell>
                <CTableHeaderCell className="text-body-emphasis">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentPersonal.length > 0 ? (
                currentPersonal.map((person) => (
                  <CTableRow key={person.id} className="theme-transition">
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <div
                            className={`rounded-circle bg-${getRoleColorById(person.idRole)} text-white d-flex align-items-center justify-content-center`}
                            style={{ width: "40px", height: "40px" }}
                          >
                            {person.name?.charAt(0)}
                            {person.lastName?.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="fw-bold text-body-emphasis">
                            {person.name} {person.lastName}
                          </div>
                          <small className="text-body-secondary">{getParroquiaName(person.parish)}</small>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <code className="px-2 py-1 rounded theme-transition text-body-emphasis">{person.ci || "-"}</code>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small className="text-body-secondary">{person.email || "-"}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small className="text-body-secondary">{person.telephoneNumber || "-"}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getRoleColorById(person.idRole)} className="px-3 py-2">
                        {getRoleName(person.idRole)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButtonGroup size="sm">
                        <CButton
                          color="info"
                          variant="outline"
                          onClick={() => openViewModal(person)}
                          title="Ver detalles"
                        >
                          <CIcon icon={cilUser} />
                        </CButton>
                        <CButton color="warning" variant="outline" onClick={() => openEditModal(person)} title="Editar">
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          onClick={() => openDeleteModal(person)}
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
                  <CTableDataCell colSpan={6} className="text-center py-5">
                    <CIcon icon={cilPeople} size="3xl" className="mb-3 text-muted opacity-50" />
                    <h6 className="text-muted">
                      {searchTerm || selectedRole
                        ? "No se encontró personal que coincida con los filtros"
                        : "No hay personal registrado"}
                    </h6>
                    {!searchTerm && !selectedRole && (
                      <CButton color="primary" onClick={openCreateModal} className="mt-2">
                        <CIcon icon={cilUserPlus} className="me-2" />
                        Agregar Primer Personal
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              )}
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
                <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  Siguiente
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modales con clases de CoreUI */}
      {/* Modal para crear personal */}
      <CModal size="lg" visible={showCreateModal} onClose={() => setShowCreateModal(false)} backdrop="static">
        <CModalHeader className="bg-primary text-white">
          <CModalTitle>
            <CIcon icon={cilUserPlus} className="me-2" />
            Crear Nuevo Personal
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Nombres *</CFormLabel>
                <CFormInput
                  name="name"
                  value={personalForm.name}
                  onChange={handleFormChange}
                  placeholder="Ingrese los nombres"
                  required
                  className="theme-transition"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Apellidos *</CFormLabel>
                <CFormInput
                  name="lastName"
                  value={personalForm.lastName}
                  onChange={handleFormChange}
                  placeholder="Ingrese los apellidos"
                  required
                  className="theme-transition"
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Cédula *</CFormLabel>
                <CFormInput
                  name="ci"
                  value={personalForm.ci}
                  onChange={handleFormChange}
                  placeholder="Ej: V12345678"
                  required
                  className="theme-transition"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Email *</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={personalForm.email}
                  onChange={handleFormChange}
                  placeholder="correo@ejemplo.com"
                  required
                  className="theme-transition"
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Teléfono *</CFormLabel>
                <CFormInput
                  name="telephoneNumber"
                  value={personalForm.telephoneNumber}
                  onChange={handleFormChange}
                  placeholder="Ej: 04241234567"
                  required
                  className="theme-transition"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Fecha de Nacimiento *</CFormLabel>
                <CFormInput
                  type="date"
                  name="birthday"
                  value={personalForm.birthday}
                  onChange={handleFormChange}
                  required
                  className="theme-transition"
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Dirección *</CFormLabel>
                <CFormInput
                  name="direction"
                  value={personalForm.direction}
                  onChange={handleFormChange}
                  placeholder="Dirección completa"
                  required
                  className="theme-transition"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Parroquia *</CFormLabel>
                <CFormSelect
                  name="parishID"
                  value={personalForm.parishID}
                  onChange={handleFormChange}
                  required
                  className="theme-transition"
                >
                  <option value="">Seleccionar parroquia...</option>
                  {parroquias.map((parroquia) => (
                    <option key={parroquia.id} value={parroquia.id}>
                      {parroquia.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Rol *</CFormLabel>
                <CFormSelect
                  name="idRole"
                  value={personalForm.idRole}
                  onChange={handleFormChange}
                  required
                  className="theme-transition"
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCreatePersonal} disabled={isSubmitting}>
            {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilUserPlus} className="me-2" />}
            {isSubmitting ? "Creando..." : "Crear Personal"}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para editar personal */}
      <CModal size="lg" visible={showEditModal} onClose={() => setShowEditModal(false)} backdrop="static">
        <CModalHeader className="bg-warning text-white">
          <CModalTitle>
            <CIcon icon={cilPencil} className="me-2" />
            Editar Personal
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Nombres *</CFormLabel>
                <CFormInput
                  name="name"
                  value={personalForm.name}
                  onChange={handleFormChange}
                  placeholder="Ingrese los nombres"
                  required
                  className="theme-transition"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Apellidos *</CFormLabel>
                <CFormInput
                  name="lastName"
                  value={personalForm.lastName}
                  onChange={handleFormChange}
                  placeholder="Ingrese los apellidos"
                  required
                  className="theme-transition"
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Cédula *</CFormLabel>
                <CFormInput
                  name="ci"
                  value={personalForm.ci}
                  onChange={handleFormChange}
                  placeholder="Ej: V12345678"
                  required
                  className="theme-transition"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Email *</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={personalForm.email}
                  onChange={handleFormChange}
                  placeholder="correo@ejemplo.com"
                  required
                  className="theme-transition"
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Teléfono *</CFormLabel>
                <CFormInput
                  name="telephoneNumber"
                  value={personalForm.telephoneNumber}
                  onChange={handleFormChange}
                  placeholder="Ej: 04241234567"
                  required
                  className="theme-transition"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Fecha de Nacimiento *</CFormLabel>
                <CFormInput
                  type="date"
                  name="birthday"
                  value={personalForm.birthday}
                  onChange={handleFormChange}
                  required
                  className="theme-transition"
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Dirección *</CFormLabel>
                <CFormInput
                  name="direction"
                  value={personalForm.direction}
                  onChange={handleFormChange}
                  placeholder="Dirección completa"
                  required
                  className="theme-transition"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Parroquia *</CFormLabel>
                <CFormSelect
                  name="parishID"
                  value={personalForm.parishID}
                  onChange={handleFormChange}
                  required
                  className="theme-transition"
                >
                  <option value="">Seleccionar parroquia...</option>
                  {parroquias.map((parroquia) => (
                    <option key={parroquia.id} value={parroquia.id}>
                      {parroquia.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold text-body-emphasis">Rol *</CFormLabel>
                <CFormSelect
                  name="idRole"
                  value={personalForm.idRole}
                  onChange={handleFormChange}
                  required
                  className="theme-transition"
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </CButton>
          <CButton color="warning" onClick={handleUpdatePersonal} disabled={isSubmitting}>
            {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilPencil} className="me-2" />}
            {isSubmitting ? "Actualizando..." : "Actualizar Personal"}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para ver detalles del personal */}
      <CModal size="lg" visible={showViewModal} onClose={() => setShowViewModal(false)}>
        <CModalHeader className="bg-info text-white">
          <CModalTitle>
            <CIcon icon={cilUser} className="me-2" />
            Detalles del Personal
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          {selectedPersonal && (
            <div>
              <div className="text-center mb-4">
                <div
                  className={`rounded-circle bg-${getRoleColorById(selectedPersonal.idRole)} text-white d-inline-flex align-items-center justify-content-center mb-3`}
                  style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                >
                  {selectedPersonal.name?.charAt(0)}
                  {selectedPersonal.lastName?.charAt(0)}
                </div>
                <h4 className="text-body-emphasis">
                  {selectedPersonal.name} {selectedPersonal.lastName}
                </h4>
                <CBadge color={getRoleColorById(selectedPersonal.idRole)} className="px-3 py-2">
                  {getRoleName(selectedPersonal.idRole)}
                </CBadge>
              </div>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong className="text-body-emphasis">Cédula:</strong>
                    <div className="text-body-secondary">{selectedPersonal.ci || "No especificada"}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-body-emphasis">Email:</strong>
                    <div className="text-body-secondary">{selectedPersonal.email || "No especificado"}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-body-emphasis">Teléfono:</strong>
                    <div className="text-body-secondary">{selectedPersonal.telephoneNumber || "No especificado"}</div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong className="text-body-emphasis">Fecha de Nacimiento:</strong>
                    <div className="text-body-secondary">
                      {selectedPersonal.birthday
                        ? new Date(selectedPersonal.birthday).toLocaleDateString("es-ES")
                        : "No especificada"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-body-emphasis">Dirección:</strong>
                    <div className="text-body-secondary">{selectedPersonal.direction || "No especificada"}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-body-emphasis">Parroquia:</strong>
                    <div className="text-body-secondary">{getParroquiaName(selectedPersonal.parish)}</div>
                  </div>
                </CCol>
              </CRow>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="success"
            onClick={() =>
              handleDownloadPersonalPdf(selectedPersonal.id, `${selectedPersonal.name}_${selectedPersonal.lastName}`, selectedPersonal.idRole)
            }
          >
            <CIcon icon={cilPrint} className="me-2" />
            Descargar PDF
          </CButton>
          <CButton color="secondary" onClick={() => setShowViewModal(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para confirmar eliminación */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader className="bg-danger text-white">
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedPersonal && (
            <div className="text-center">
              <CIcon icon={cilTrash} size="3xl" className="text-danger mb-3" />
              <h5 className="text-body-emphasis">¿Está seguro de eliminar este personal?</h5>
              <p className="text-body-secondary">
                <strong>
                  {selectedPersonal.name} {selectedPersonal.lastName}
                </strong>
                <br />
                {getRoleName(selectedPersonal.idRole)}
              </p>
              <div className="alert alert-warning">
                <small>⚠️ Esta acción no se puede deshacer</small>
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeletePersonal} disabled={isSubmitting}>
            {isSubmitting ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilTrash} className="me-2" />}
            {isSubmitting ? "Eliminando..." : "Eliminar"}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default PersonalManagement
