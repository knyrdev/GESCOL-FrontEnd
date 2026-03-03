import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { helpFetch } from '../../../api/helpFetch'
import { useError } from '../../../context/ErrorContext'

import loginBackground from '/src/assets/brand/fondologin.jpg'

const Login = () => {
  const { showError } = useError()
  const api = helpFetch(showError)
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirm: '',
    securityWord: '',
    securityAnswer: '',
    personalId: null,
  })


  const [showRecoverModal, setShowRecoverModal] = useState(false)
  const [recoverStep, setRecoverStep] = useState(1) // 1: username, 2: answer & new pass
  const [recoverData, setRecoverData] = useState({
    username: '',
    securityWord: '',
    securityAnswer: '',
    newPassword: '',
  })

  const passwordMismatch = isRegistering && newUser.password !== newUser.confirm
  const isPasswordInvalid = (isRegistering ? newUser.password : password).length < 8

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/api/user/login', {
        body: { username, password },
      })

      if (response.accessToken && response.refreshToken) {
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.user))
        navigate('/dashboard')
      } else {
        // helpFetch now calls showError(response) automatically if response is not ok
        // but we still want to stop loading
      }
    } catch (err) {
      console.error('Error de conexión', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (passwordMismatch || isPasswordInvalid) {
      showError({
        type: 'validation',
        msg: passwordMismatch
          ? 'Las contraseñas no coinciden'
          : 'La contraseña debe tener al menos 8 caracteres',
      })
      setLoading(false)
      return
    }

    try {
      const { confirm, ...registerData } = newUser
      const response = await api.post('/api/user/register', {
        body: registerData,
      })

      if (response.ok) {
        setIsRegistering(false)
        setNewUser({
          username: '',
          password: '',
          confirm: '',
          securityWord: '',
          securityAnswer: '',
          personalId: null,
        })
        // helpFetch already calls showError
      }
    } catch (err) {
      console.error('Error en el registro', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetSecurityQuestion = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/api/user/security-question/${recoverData.username}`)
      if (response.ok) {
        setRecoverData({ ...recoverData, securityWord: response.securityWord })
        setRecoverStep(2)
      }
    } catch (err) {
      console.error('Error obteniendo pregunta de seguridad:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecoverPassword = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/user/recover-password', {
        body: {
          username: recoverData.username,
          securityAnswer: recoverData.securityAnswer,
          newPassword: recoverData.newPassword,
        },
      })
      if (response.ok) {
        setShowRecoverModal(false)
        setRecoverStep(1)
        alert('Contraseña restablecida con éxito')
      }
    } catch (err) {
      console.error('Error recuperando contraseña:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f0f0f0',
      }}
    >
      <div style={{ flex: 1 }}></div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        <img
          src="/src/assets/brand/logo1.png"
          alt="Logo Gescol"
          style={{ maxWidth: '300px', marginBottom: '40px' }}
        />

        <h2 style={{ color: 'black', fontWeight: '700', fontSize: '36px', marginBottom: '10px' }}>
          {isRegistering ? 'Crear cuenta' : 'Ingresar'}
        </h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          {isRegistering
            ? 'Rellena los campos para crear tu cuenta'
            : 'Por favor ingresa tus datos para iniciar sesión'}
        </p>

        <CForm
          onSubmit={isRegistering ? handleRegister : handleLogin}
          style={{ width: '100%', maxWidth: '350px' }}
        >
          <CInputGroup className="mb-3">
            <CInputGroupText>
              <CIcon icon={cilUser} />
            </CInputGroupText>
            <CFormInput
              placeholder="Nombre de usuario"
              autoComplete="username"
              style={{ padding: '10px 15px' }}
              value={isRegistering ? newUser.username : username}
              onChange={(e) =>
                isRegistering
                  ? setNewUser({ ...newUser, username: e.target.value })
                  : setUsername(e.target.value)
              }
              required
            />
          </CInputGroup>

          <CInputGroup className="mb-3">
            <CInputGroupText>
              <CIcon icon={cilLockLocked} />
            </CInputGroupText>
            <CFormInput
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              style={{ padding: '10px 15px' }}
              value={isRegistering ? newUser.password : password}
              onChange={(e) =>
                isRegistering
                  ? setNewUser({ ...newUser, password: e.target.value })
                  : setPassword(e.target.value)
              }
              required
            />
          </CInputGroup>

          {isRegistering && (
            <>
              <CInputGroup className="mb-3">
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={newUser.confirm}
                  style={{ padding: '10px 15px' }}
                  onChange={(e) => setNewUser({ ...newUser, confirm: e.target.value })}
                  required
                />
              </CInputGroup>

              <CInputGroup className="mb-3">
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  placeholder="ID de Seguridad (Ej: Color favorito)"
                  value={newUser.securityWord}
                  style={{ padding: '10px 15px' }}
                  onChange={(e) => setNewUser({ ...newUser, securityWord: e.target.value })}
                  required
                />
              </CInputGroup>

              <CInputGroup className="mb-3">
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Respuesta de Seguridad"
                  value={newUser.securityAnswer}
                  style={{ padding: '10px 15px' }}
                  onChange={(e) => setNewUser({ ...newUser, securityAnswer: e.target.value })}
                  required
                />
              </CInputGroup>
            </>
          )}

          {!isRegistering && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setShowRecoverModal(true)
                }}
                style={{ color: '#333', fontSize: '14px', textDecoration: 'underline' }}
              >
                No puedo iniciar sesión
              </a>
            </div>
          )}

          <CButton
            type="submit"
            color="dark"
            style={{
              backgroundColor: '#2663dd',
              width: '100%',
              padding: '15px 0',
              borderColor: 'blue',
              borderRadius: '100px',
              color: 'white',
              fontWeight: '650',
            }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </CButton>

          <p style={{ color: '#666', textAlign: 'center', marginTop: '30px', fontSize: '14px' }}>
            {isRegistering ? (
              <>
                ¿Ya tienes una cuenta?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsRegistering(false)
                  }}
                  style={{ fontWeight: '600' }}
                >
                  Iniciar sesión
                </a>
              </>
            ) : (
              <>
                ¿No tienes una cuenta?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsRegistering(true)
                  }}
                  style={{ fontWeight: '600' }}
                >
                  Registrarse
                </a>
              </>
            )}
          </p>
        </CForm>
      </div>



      {/* Modal Recuperar Contraseña */}
      <CModal visible={showRecoverModal} onClose={() => setShowRecoverModal(false)}>
        <CModalHeader className="bg-info text-white">
          <CModalTitle>Recuperar Contraseña</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {recoverStep === 1 ? (
            <div className="mb-3">
              <label className="form-label">Ingrese su nombre de usuario</label>
              <CFormInput
                value={recoverData.username}
                onChange={(e) => setRecoverData({ ...recoverData, username: e.target.value })}
                placeholder="Usuario"
              />
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Pregunta de Seguridad:</label>
                <p>
                  <strong>{recoverData.securityWord}</strong>
                </p>
              </div>
              <div className="mb-3">
                <CFormInput
                  placeholder="Su respuesta"
                  value={recoverData.securityAnswer}
                  onChange={(e) => setRecoverData({ ...recoverData, securityAnswer: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <CFormInput
                  type="password"
                  placeholder="Nueva contraseña"
                  value={recoverData.newPassword}
                  onChange={(e) => setRecoverData({ ...recoverData, newPassword: e.target.value })}
                />
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowRecoverModal(false)}>
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={recoverStep === 1 ? handleGetSecurityQuestion : handleRecoverPassword}
            disabled={loading}
          >
            {loading ? 'Procesando...' : recoverStep === 1 ? 'Siguiente' : 'Restablecer'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Login
