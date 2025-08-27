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

import loginBackground from '/src/assets/brand/fondologin.jpg'

const api = helpFetch()

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'admin',
  })

  const [visiblePassError, setVisiblePassError] = useState(false)
  const [visibleEmailError, setVisibleEmailError] = useState(false)
  const [visibleGenericError, setVisibleGenericError] = useState(false)

  const passwordMismatch = isRegistering && newUser.password !== newUser.confirm
  const isPasswordInvalid = (isRegistering ? newUser.password : password).length < 6

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/api/users/login', {
        body: { email, password },
      })

      if (response.accessToken && response.refreshToken) {
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.user))
        navigate('/dashboard')
      } else {
        const msg = response.msg?.toLowerCase() || ''

        if (msg.includes('contraseña') || msg.includes('password')) {
          setVisiblePassError(true)
        } else if (msg.includes('correo') || msg.includes('email')) {
          setVisibleEmailError(true)
        } else {
          setVisibleGenericError(true)
        }
      }
    } catch (err) {
      console.error('Error de conexión', err)
      setVisibleGenericError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (passwordMismatch || isPasswordInvalid) {
      setVisibleGenericError(true)
      setLoading(false)
      return
    }

    try {
      const response = await api.post('/api/users/register', {
        body: newUser,
      })

      if (response.ok) {
        setIsRegistering(false)
        setNewUser({ name: '', email: '', password: '', confirm: '', role: 'admin' })
      } else {
        setVisibleGenericError(true)
      }
    } catch (err) {
      console.error('Error en el registro', err)
      setVisibleGenericError(true)
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
            ? 'Rellena los campos para registrar un administrador'
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
              placeholder="Correo electrónico"
              autoComplete="username"
              style={{ padding: '10px 15px' }}
              value={isRegistering ? newUser.email : email}
              onChange={(e) =>
                isRegistering
                  ? setNewUser({ ...newUser, email: e.target.value })
                  : setEmail(e.target.value)
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
          )}

          {!isRegistering && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <a href="#" style={{ color: '#333', fontSize: '14px', textDecoration: 'underline' }}>
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

      {/* Modal Contraseña Incorrecta */}
      <CModal visible={visiblePassError} onClose={() => setVisiblePassError(false)}>
        <CModalHeader className="bg-warning text-white">
          <CModalTitle>Error de contraseña</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>La contraseña ingresada es incorrecta.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={() => setVisiblePassError(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Correo Incorrecto */}
      <CModal visible={visibleEmailError} onClose={() => setVisibleEmailError(false)}>
        <CModalHeader className="bg-danger text-white">
          <CModalTitle>Error de correo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>El correo electrónico no está registrado.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={() => setVisibleEmailError(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Error Genérico */}
      <CModal visible={visibleGenericError} onClose={() => setVisibleGenericError(false)}>
        <CModalHeader className="bg-secondary text-white">
          <CModalTitle>Error</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Ocurrió un error al procesar la solicitud. Inténtalo nuevamente.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="dark" onClick={() => setVisibleGenericError(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Login
