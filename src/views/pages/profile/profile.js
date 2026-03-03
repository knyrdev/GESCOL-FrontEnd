"use client"
import { useState, useEffect } from "react"
import {
  CTab,
  CTabContent,
  CTabList,
  CTabPanel,
  CTabs,
  CContainer,
  CRow,
  CCol,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CSpinner,
  CAlert,
  CBadge,
  CAvatar,
  CProgress,
  CListGroup,
  CListGroupItem,
  CInputGroup,
  CInputGroupText,
  CFormFeedback,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilUser, cilSettings, cilLockLocked, cilCheck, cilX, cilPencil } from "@coreui/icons"
import { helpFetch } from "../../../api/helpFetch"
import { useError } from "../../../context/ErrorContext"

const Profile = () => {
  // Estados principales
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)

  // Estados para modales
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)

  // Estados para formularios
  const [profileForm, setProfileForm] = useState({
    securityWord: "",
    securityAnswer: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [securityForm, setSecurityForm] = useState({
    securityWord: "",
    securityAnswer: "",
  })

  // Estados para validación
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Instancia de API
  const { showError } = useError()
  const api = helpFetch(showError)

  // Cargar datos del usuario al montar
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)

      console.log("🔄 Cargando perfil de usuario...")

      const response = await api.get("/api/user/profile")

      if (response.ok) {
        setUserData(response.user)
        setProfileForm({
          securityWord: response.user.securityWord || "",
          securityAnswer: "", // No mostrar la respuesta actual por seguridad
        })
        console.log("✅ Perfil cargado exitosamente")
      } else {
        throw new Error(response.msg || "Error al cargar el perfil")
      }
    } catch (error) {
      console.error("❌ Error cargando perfil:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateProfileForm = () => {
    const errors = {}

    if (profileForm.securityWord && profileForm.securityWord.length < 3) {
      errors.securityWord = "La palabra de seguridad debe tener al menos 3 caracteres"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = () => {
    const errors = {}

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "La contraseña actual es requerida"
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "La nueva contraseña es requerida"
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "La contraseña debe tener al menos 8 caracteres"
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleUpdateProfile = async () => {
    try {
      if (!validateProfileForm()) return

      setIsSubmitting(true)
      setSuccess(null)

      console.log("💾 Actualizando perfil...")

      const response = await api.put("/api/user/profile", {
        body: profileForm,
      })

      if (response.ok) {
        setSuccess("Perfil actualizado exitosamente")
        await loadUserProfile() // Recargar datos
        console.log("✅ Perfil actualizado")
      } else {
        throw new Error(response.msg || "Error al actualizar el perfil")
      }
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      if (!validatePasswordForm()) return

      setIsSubmitting(true)
      setSuccess(null)

      console.log("🔑 Cambiando contraseña...")

      const response = await api.put("/api/users/change-password", {
        body: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      })

      if (response.ok) {
        setSuccess("Contraseña cambiada exitosamente")
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setShowPasswordModal(false)
        console.log("✅ Contraseña cambiada")
      } else {
        throw new Error(response.msg || "Error al cambiar la contraseña")
      }
    } catch (error) {
      console.error("❌ Error cambiando contraseña:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSecurity = async () => {
    try {
      setIsSubmitting(true)
      setSuccess(null)

      console.log("🛡️ Actualizando configuración de seguridad...")

      const response = await api.put("/api/user/profile", {
        body: {
          securityWord: securityForm.securityWord,
          securityAnswer: securityForm.securityAnswer,
        },
      })

      if (response.ok) {
        setSuccess("Configuración de seguridad actualizada exitosamente")
        setSecurityForm({
          securityWord: "",
          securityAnswer: "",
        })
        setShowSecurityModal(false)
        await loadUserProfile()
        console.log("✅ Seguridad actualizada")
      } else {
        throw new Error(response.msg || "Error al actualizar la configuración de seguridad")
      }
    } catch (error) {
      console.error("❌ Error actualizando seguridad:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 10) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    return strength
  }

  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return "danger"
    if (strength < 75) return "warning"
    return "success"
  }

  const getPasswordStrengthText = (strength) => {
    if (strength < 50) return "Débil"
    if (strength < 75) return "Media"
    return "Fuerte"
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-2">Cargando perfil...</span>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center py-5">
        <h4>Información del Perfil</h4>
        <p>No se pudo cargar la información del perfil.</p>
        <CButton color="primary" onClick={loadUserProfile}>
          Reintentar
        </CButton>
      </div>
    )
  }

  return (
    <CContainer fluid>
      {/* Error alert removed - using global ErrorModal */}

      {/* Success alerts removed as per instruction */}

      <CRow>
        <CCol lg={4}>
          {/* Tarjeta de perfil */}
          <CCard className="mb-4">
            <CCardBody className="text-center">
              <CAvatar
                size="xl"
                color="primary"
                textColor="white"
                className="mb-3"
                style={{ width: "100px", height: "100px", fontSize: "2rem" }}
              >
                {userData.username?.charAt(0).toUpperCase() || "U"}
              </CAvatar>
              <h4 className="mb-1">{userData.username}</h4>

              {userData.personal_nombre && (
                <p className="mb-2">
                  <strong>
                    {userData.personal_nombre} {userData.personal_apellido}
                  </strong>
                </p>
              )}

              <div className="mb-3">
                <CBadge color={userData.isActive ? "success" : "danger"} className="me-2">
                  {userData.isActive ? "Activo" : "Inactivo"}
                </CBadge>
              </div>

              <div className="d-grid gap-2">
                <CButton color="primary" onClick={() => setShowPasswordModal(true)}>
                  <CIcon icon={cilLockLocked} className="me-1" />
                  Cambiar Contraseña
                </CButton>
                <CButton color="info" onClick={() => setShowSecurityModal(true)}>
                  <CIcon icon={cilSettings} className="me-1" />
                  Configurar Seguridad
                </CButton>
              </div>
            </CCardBody>
          </CCard>

          {/* Información del sistema */}
          <CCard>
            <CCardHeader>Información del Sistema</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <span>Rol:</span>
                  <CBadge color="secondary">{userData.rol_nombre || "Sin rol"}</CBadge>
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <span>Permisos:</span>
                  <CBadge color="info">{userData.permiso_nombre || "Básico"}</CBadge>
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <span>Último acceso:</span>
                  <small className="text-muted">
                    {userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : "Nunca"}
                  </small>
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <span>Miembro desde:</span>
                  <small className="text-muted">{new Date(userData.created_at).toLocaleDateString()}</small>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={8}>
          <CTabs activeItemKey="profile">
            <CTabList variant="underline">
              <CTab itemKey="profile">
                <CIcon icon={cilUser} className="me-1" />
                Perfil
              </CTab>
              <CTab itemKey="settings">
                <CIcon icon={cilSettings} className="me-1" />
                Configuración
              </CTab>
            </CTabList>

            <CTabContent>
              <CTabPanel className="p-3" itemKey="profile">
                <CCard>
                  <CCardHeader>
                    <h5 className="mb-0">Información Personal</h5>
                  </CCardHeader>
                  <CCardBody>
                    <CForm>
                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel>Nombre de Usuario</CFormLabel>
                            <CFormInput value={userData.username} disabled />
                          </div>
                        </CCol>
                        <CCol md={6}>
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel>Palabra de Seguridad</CFormLabel>
                            <CFormInput
                              value={profileForm.securityWord}
                              onChange={(e) =>
                                setProfileForm((prev) => ({
                                  ...prev,
                                  securityWord: e.target.value,
                                }))
                              }
                              invalid={!!formErrors.securityWord}
                              placeholder="Ingrese una palabra de seguridad"
                            />
                            {formErrors.securityWord && (
                              <CFormFeedback invalid>{formErrors.securityWord}</CFormFeedback>
                            )}
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel>Respuesta de Seguridad</CFormLabel>
                            <CFormInput
                              value={profileForm.securityAnswer}
                              onChange={(e) =>
                                setProfileForm((prev) => ({
                                  ...prev,
                                  securityAnswer: e.target.value,
                                }))
                              }
                              placeholder="Respuesta a su palabra de seguridad"
                            />
                          </div>
                        </CCol>
                      </CRow>

                      <div className="d-flex justify-content-end gap-2">
                        <CButton color="secondary" onClick={loadUserProfile}>
                          Cancelar
                        </CButton>
                        <CButton color="primary" onClick={handleUpdateProfile} disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <CSpinner size="sm" className="me-1" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar Cambios"
                          )}
                        </CButton>
                      </div>
                    </CForm>
                  </CCardBody>
                </CCard>
              </CTabPanel>

              <CTabPanel className="p-3" itemKey="settings">
                <CCard>
                  <CCardHeader>
                    <h5 className="mb-0">Configuración de Cuenta</h5>
                  </CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">Cambiar Contraseña</h6>
                          <small className="text-muted">Actualiza tu contraseña de acceso</small>
                        </div>
                        <CButton color="outline-primary" onClick={() => setShowPasswordModal(true)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CListGroupItem>

                      <CListGroupItem className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">Configuración de Seguridad</h6>
                          <small className="text-muted">Gestiona tu palabra y respuesta de seguridad</small>
                        </div>
                        <CButton color="outline-info" onClick={() => setShowSecurityModal(true)}>
                          <CIcon icon={cilSettings} />
                        </CButton>
                      </CListGroupItem>

                      <CListGroupItem className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">Estado de Cuenta</h6>
                          <small className="text-muted">
                            {userData.isActive ? "Cuenta Activa" : "Cuenta Inactiva"}
                          </small>
                        </div>
                        <CBadge color={userData.isActive ? "success" : "danger"}>
                          {userData.isActive ? "Activo" : "Inactivo"}
                        </CBadge>
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CTabPanel>
            </CTabContent>
          </CTabs>
        </CCol>
      </CRow>

      {/* Modal para cambiar contraseña */}
      <CModal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Cambiar Contraseña</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel>Contraseña Actual</CFormLabel>
              <CFormInput
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                invalid={!!formErrors.currentPassword}
              />
              {formErrors.currentPassword && <CFormFeedback invalid>{formErrors.currentPassword}</CFormFeedback>}
            </div>

            <div className="mb-3">
              <CFormLabel>Nueva Contraseña</CFormLabel>
              <CFormInput
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                invalid={!!formErrors.newPassword}
              />
              {formErrors.newPassword && <CFormFeedback invalid>{formErrors.newPassword}</CFormFeedback>}

              {passwordForm.newPassword && (
                <div className="mt-2">
                  <small className="text-muted">Fortaleza de la contraseña:</small>
                  <CProgress
                    value={getPasswordStrength(passwordForm.newPassword)}
                    color={getPasswordStrengthColor(getPasswordStrength(passwordForm.newPassword))}
                    className="mt-1"
                    height={8}
                  />
                  <small className={`text-${getPasswordStrengthColor(getPasswordStrength(passwordForm.newPassword))}`}>
                    {getPasswordStrengthText(getPasswordStrength(passwordForm.newPassword))}
                  </small>
                </div>
              )}
            </div>

            <div className="mb-3">
              <CFormLabel>Confirmar Nueva Contraseña</CFormLabel>
              <CFormInput
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                invalid={!!formErrors.confirmPassword}
              />
              {formErrors.confirmPassword && <CFormFeedback invalid>{formErrors.confirmPassword}</CFormFeedback>}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleChangePassword} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-1" />
                Cambiando...
              </>
            ) : (
              "Cambiar Contraseña"
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para configuración de seguridad */}
      <CModal visible={showSecurityModal} onClose={() => setShowSecurityModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Configuración de Seguridad</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CAlert color="info">
            <strong>Información:</strong> Para cambiar tu configuración de seguridad, necesitas proporcionar tu
            respuesta de seguridad actual.
          </CAlert>

          <CForm>
            <div className="mb-3">
              <CFormLabel>Palabra de Seguridad</CFormLabel>
              <CFormInput
                value={securityForm.securityWord}
                onChange={(e) =>
                  setSecurityForm((prev) => ({
                    ...prev,
                    securityWord: e.target.value,
                  }))
                }
                placeholder="Ej: ¿Cuál es tu color favorito?"
              />
            </div>

            <div className="mb-3">
              <CFormLabel>Respuesta de Seguridad</CFormLabel>
              <CFormInput
                value={securityForm.securityAnswer}
                onChange={(e) =>
                  setSecurityForm((prev) => ({
                    ...prev,
                    securityAnswer: e.target.value,
                  }))
                }
                placeholder="Respuesta a la palabra de seguridad"
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowSecurityModal(false)}>
            Cancelar
          </CButton>
          <CButton color="info" onClick={handleUpdateSecurity} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-1" />
                Actualizando...
              </>
            ) : (
              "Actualizar Seguridad"
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Profile
