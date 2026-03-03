'use client'
import { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
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
  CSpinner,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilUserPlus,
  cilTrash,
  cilLockLocked,
  cilLockUnlocked,
  cilSearch,
  cilReload,
} from '@coreui/icons'
import { helpFetch } from '../../../api/helpFetch.js'

const api = helpFetch()

const UserManagement = () => {
  // Estados principales
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Estados para formularios
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityWord: '',
    securityAnswer: '',
    personalId: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar usuarios al montar
  useEffect(() => {
    loadUsers()
  }, [])

  // Filtrar usuarios cuando cambie el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
    setCurrentPage(1)
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/api/user/list')
      if (!response.error) {
        setUsers(response.users)
      } else {
        setError(response.msg || 'Error al cargar usuarios')
      }
    } catch (error) {
      setError(`Error al cargar usuarios: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const validateUserForm = () => {
    const errors = {}
    if (!userForm.username) errors.username = 'El usuario es requerido'
    if (!userForm.password) errors.password = 'La contraseña es requerida'
    else if (userForm.password.length < 8) errors.password = 'Mínimo 8 caracteres'
    if (userForm.password !== userForm.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async () => {
    if (!validateUserForm()) return

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      const response = await api.post('/api/user/register', {
        body: {
          username: userForm.username.trim(),
          password: userForm.password,
          securityWord: userForm.securityWord.trim(),
          securityAnswer: userForm.securityAnswer.trim(),
          personalId: userForm.personalId ? Number.parseInt(userForm.personalId) : null,
        },
      })

      if (response.error) {
        setError(response.msg || 'Error al crear el usuario')
        return
      }

      setSuccess('Usuario creado exitosamente')
      setShowCreateModal(false)
      loadUsers()
      resetForm()
    } catch (error) {
      setError(`Error al crear usuario: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setError(null)
      setSuccess(null)
      const response = await api.put(`/api/user/status/${userId}`, {
        body: { isActive: !currentStatus }
      })

      if (!response.error) {
        setSuccess(`Usuario ${currentStatus ? 'desactivado' : 'activado'} exitosamente`)
        loadUsers()
      } else {
        setError(response.msg || 'Error al cambiar estado')
      }
    } catch (error) {
      setError(`Error al cambiar estado: ${error.message}`)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    try {
      setIsSubmitting(true)
      setError(null)
      const response = await api.delet('/api/user', selectedUser.id)
      if (!response.error) {
        setSuccess('Usuario eliminado exitosamente')
        setShowDeleteModal(false)
        setSelectedUser(null)
        loadUsers()
      } else {
        setError(response.msg || 'Error al eliminar usuario')
      }
    } catch (error) {
      setError(`Error al eliminar usuario: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setUserForm({
      username: '',
      password: '',
      confirmPassword: '',
      securityWord: '',
      securityAnswer: '',
      personalId: '',
    })
    setFormErrors({})
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setUserForm((prev) => ({ ...prev, [name]: value }))
  }

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-2">Cargando usuarios...</span>
      </div>
    )
  }

  return (
    <>
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </CAlert>
      )}

      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center bg-info text-white">
          <h5 className="mb-0">
            <CIcon icon={cilUser} className="me-2" />
            Gestión de Usuarios
          </h5>
          <div className="d-flex gap-2">
            <CButton color="warning" onClick={loadUsers} className="text-white">
              <CIcon icon={cilReload} className="me-1" />
              Actualizar
            </CButton>
            <CButton color="primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
              <CIcon icon={cilUserPlus} className="me-1" />
              Nuevo Usuario
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                <CFormInput
                  placeholder="Buscar por usuario o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
            </CCol>
          </CRow>

          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Usuario</CTableHeaderCell>
                <CTableHeaderCell>Nombre Completo</CTableHeaderCell>
                <CTableHeaderCell>Rol</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentUsers.map((user) => (
                <CTableRow key={user.id}>
                  <CTableDataCell><strong>{user.username}</strong></CTableDataCell>
                  <CTableDataCell>{user.nombre_completo || 'Usuario Externo'}</CTableDataCell>
                  <CTableDataCell><CBadge color="info">{user.rol_nombre || 'Usuario'}</CBadge></CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButtonGroup size="sm">
                      <CButton
                        color={user.isActive ? 'warning' : 'success'}
                        variant="outline"
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                      >
                        <CIcon icon={user.isActive ? cilLockLocked : cilLockUnlocked} />
                      </CButton>
                      <CButton
                        color="danger"
                        variant="outline"
                        onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CButtonGroup>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {totalPages > 1 && (
            <CPagination className="justify-content-center">
              {[...Array(totalPages)].map((_, i) => (
                <CPaginationItem
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}
            </CPagination>
          )}
        </CCardBody>
      </CCard>

      {/* Modal Crear */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <CModalHeader className="bg-info text-white">
          <CModalTitle>Crear Usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormInput
                  label="Usuario *"
                  name="username"
                  value={userForm.username}
                  onChange={handleFormChange}
                  invalid={!!formErrors.username}
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormInput
                  label="ID Personal (Opcional)"
                  name="personalId"
                  value={userForm.personalId}
                  onChange={handleFormChange}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormInput
                  label="Contraseña *"
                  name="password"
                  type="password"
                  value={userForm.password}
                  onChange={handleFormChange}
                  invalid={!!formErrors.password}
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormInput
                  label="Confirmar Contraseña *"
                  name="confirmPassword"
                  type="password"
                  value={userForm.confirmPassword}
                  onChange={handleFormChange}
                  invalid={!!formErrors.confirmPassword}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormInput
                  label="Pregunta de Seguridad"
                  name="securityWord"
                  value={userForm.securityWord}
                  onChange={handleFormChange}
                  placeholder="Ej: ¿Color favorito?"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormInput
                  label="Respuesta"
                  name="securityAnswer"
                  value={userForm.securityAnswer}
                  onChange={handleFormChange}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</CButton>
          <CButton color="primary" onClick={handleCreateUser} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader><CModalTitle>Eliminar Usuario</CModalTitle></CModalHeader>
        <CModalBody>¿Seguro que desea eliminar a {selectedUser?.username}?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={handleDeleteUser} disabled={isSubmitting}>Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UserManagement
