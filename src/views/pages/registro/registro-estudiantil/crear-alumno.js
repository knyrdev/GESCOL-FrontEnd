"use client"

import { useState } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CButton,
  CRow,
  CCol,
  CContainer,
  CAlert,
  CSpinner,
  CInputGroup,
  CInputGroupText,
  CFormTextarea,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilUser, cilSearch, cilUserPlus, cilPhone, cilHome, cilCalendar, cilCheckCircle } from "@coreui/icons"
import { helpFetch } from "../../../../api/helpFetch"
import ErrorModal from "../../../../components/error-modal"
import { useErrorHandler } from "../../../hooks/use-error-handler"
import CedulaInput from "../../../../components/cedula-input"

export default function CrearAlumnoEnhanced({ tipoInscripcion, onStudentCreated, onBack }) {
  const [step, setStep] = useState(1) // 1: Buscar/Crear Representante, 2: Crear Estudiante
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const { error, showErrorModal, handleError, clearError } = useErrorHandler()

  // Estados para representante
  const [representanteCi, setRepresentanteCi] = useState("")
  const [representanteFound, setRepresentanteFound] = useState(null)
  const [representanteData, setRepresentanteData] = useState({
    ci: "",
    name: "",
    lastName: "",
    telephoneNumber: "",
    email: "",
    maritalStat: "",
    profesion: "",
    birthday: "",
    telephoneHouse: "",
    roomAdress: "",
    workPlace: "",
    jobNumber: "",
  })

  // Estados para estudiante - TODOS los campos del modelo
  const [studentData, setStudentData] = useState({
    ci: "",
    name: "",
    lastName: "",
    sex: "M",
    birthday: "",
    placeBirth: "",
    parishID: null,
    quantityBrothers: 0,
    representativeID: "",
    motherName: "",
    motherCi: "",
    motherTelephone: "",
    fatherName: "",
    fatherCi: "",
    fatherTelephone: "",
    livesMother: false,
    livesFather: false,
    livesBoth: true,
    livesRepresentative: false,
    rolRopresentative: "",
  })

  const api = helpFetch()

  // Buscar representante por CI
  const buscarRepresentante = async () => {
    if (!representanteCi.trim()) {
      handleError(
        {
          type: "validation",
          message: "Ingrese la cédula del representante",
        },
        "Validación de cédula",
      )
      return
    }

    setLoading(true)

    try {
      const data = await api.get(`/api/representatives/${representanteCi}`)

      if (data && data.ok) {
        setRepresentanteFound(data.representative)
        setStudentData((prev) => ({ ...prev, representativeID: data.representative.ci }))
        setSuccess("Representante encontrado exitosamente")
      } else {
        setRepresentanteFound(null)
        setRepresentanteData((prev) => ({ ...prev, ci: representanteCi }))
        setSuccess("Representante no encontrado. Complete los datos para crear uno nuevo.")
      }
    } catch (err) {
      console.error("Error buscando representante:", err)
      setRepresentanteFound(null)
      setRepresentanteData((prev) => ({ ...prev, ci: representanteCi }))
      setSuccess("Representante no encontrado. Complete los datos para crear uno nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Crear representante
  const crearRepresentante = async () => {
    // Validaciones
    if (!representanteData.name || !representanteData.lastName || !representanteData.telephoneNumber) {
      handleError(
        {
          type: "validation",
          message: "Complete todos los campos obligatorios del representante (Nombres, Apellidos, Teléfono)",
        },
        "Validación de campos obligatorios",
      )
      return
    }

    setLoading(true)

    try {
      const data = await api.post("/api/representatives", { body: representanteData })

      if (data && data.ok) {
        setRepresentanteFound(data.data)
        setStudentData((prev) => ({ ...prev, representativeID: data.data.ci }))
        setSuccess("Representante creado exitosamente")
        setStep(2)
      } else {
        throw new Error(data.msg || "Error al crear el representante")
      }
    } catch (err) {
      console.error("Error creando representante:", err)
      handleError(err, "Crear representante")
    } finally {
      setLoading(false)
    }
  }

  // Crear estudiante
  const crearEstudiante = async () => {
    // Validaciones
    if (!studentData.ci || !studentData.name || !studentData.lastName || !studentData.birthday) {
      handleError(
        {
          type: "validation",
          message:
            "Complete todos los campos obligatorios del estudiante (Cédula, Nombres, Apellidos, Fecha de Nacimiento)",
        },
        "Validación de campos obligatorios",
      )
      return
    }

    setLoading(true)

    try {
      const data = await api.post("/api/students/registry", { body: { student: studentData } })

      if (data && data.ok) {
        setSuccess("Estudiante creado exitosamente")
        setTimeout(() => {
          onStudentCreated(data.student)
        }, 1500)
      } else {
        throw new Error(data.msg || "Error al crear el estudiante")
      }
    } catch (err) {
      console.error("Error creando estudiante:", err)
      handleError(err, "Crear estudiante")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-dark py-4">
      <CContainer>
        <div className="mb-4">
          <h2 className="text-center text-white">Crear Alumno - Nuevo Ingreso</h2>
        </div>

        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
            <CIcon icon={cilCheckCircle} className="me-2" />
            {success}
          </CAlert>
        )}

        {/* Modal de Error */}
        <ErrorModal visible={showErrorModal} onClose={clearError} error={error} />

        {step === 1 && (
          <CCard>
            <CCardHeader>
              <h4>
                <CIcon icon={cilUser} className="me-2" />
                Paso 1: Buscar o Crear Representante
              </h4>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-4">
                <CCol md={8}>
                  <CFormLabel>Cédula del Representante</CFormLabel>
                  <CedulaInput value={representanteCi} onChange={setRepresentanteCi} placeholder="12345678" />
                </CCol>
                <CCol md={4} className="d-flex align-items-end">
                  <CButton color="info" onClick={buscarRepresentante} disabled={loading} className="w-100">
                    {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSearch} />}
                    {loading ? " Buscando..." : " Buscar"}
                  </CButton>
                </CCol>
              </CRow>

              {representanteFound && (
                <CAlert color="success">
                  <h5>Representante Encontrado:</h5>
                  <p>
                    <strong>Nombre:</strong> {representanteFound.name} {representanteFound.lastName}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {representanteFound.telephoneNumber}
                  </p>
                  <p>
                    <strong>Email:</strong> {representanteFound.email || "No registrado"}
                  </p>
                  <div className="mt-3">
                    <CButton color="success" onClick={() => setStep(2)}>
                      Continuar con este Representante
                    </CButton>
                  </div>
                </CAlert>
              )}

              {!representanteFound && representanteData.ci && (
                <CCard className="mt-4">
                  <CCardHeader>
                    <h5>Crear Nuevo Representante</h5>
                  </CCardHeader>
                  <CCardBody>
                    <CForm>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Nombres *</CFormLabel>
                          <CFormInput
                            type="text"
                            value={representanteData.name}
                            onChange={(e) => setRepresentanteData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Apellidos *</CFormLabel>
                          <CFormInput
                            type="text"
                            value={representanteData.lastName}
                            onChange={(e) => setRepresentanteData((prev) => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Teléfono Celular *</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText>
                              <CIcon icon={cilPhone} />
                            </CInputGroupText>
                            <CFormInput
                              type="tel"
                              value={representanteData.telephoneNumber}
                              onChange={(e) =>
                                setRepresentanteData((prev) => ({ ...prev, telephoneNumber: e.target.value }))
                              }
                              placeholder="0414-1234567"
                              required
                            />
                          </CInputGroup>
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Teléfono de Casa</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText>
                              <CIcon icon={cilPhone} />
                            </CInputGroupText>
                            <CFormInput
                              type="tel"
                              value={representanteData.telephoneHouse}
                              onChange={(e) =>
                                setRepresentanteData((prev) => ({ ...prev, telephoneHouse: e.target.value }))
                              }
                              placeholder="0212-1234567"
                            />
                          </CInputGroup>
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Email</CFormLabel>
                          <CFormInput
                            type="email"
                            value={representanteData.email}
                            onChange={(e) => setRepresentanteData((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Fecha de Nacimiento</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText>
                              <CIcon icon={cilCalendar} />
                            </CInputGroupText>
                            <CFormInput
                              type="date"
                              value={representanteData.birthday}
                              onChange={(e) => setRepresentanteData((prev) => ({ ...prev, birthday: e.target.value }))}
                            />
                          </CInputGroup>
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Estado Civil</CFormLabel>
                          <CFormSelect
                            value={representanteData.maritalStat}
                            onChange={(e) => setRepresentanteData((prev) => ({ ...prev, maritalStat: e.target.value }))}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="soltero">Soltero(a)</option>
                            <option value="casado">Casado(a)</option>
                            <option value="divorciado">Divorciado(a)</option>
                            <option value="viudo">Viudo(a)</option>
                            <option value="concubinato">Concubinato</option>
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Profesión</CFormLabel>
                          <CFormInput
                            type="text"
                            value={representanteData.profesion}
                            onChange={(e) => setRepresentanteData((prev) => ({ ...prev, profesion: e.target.value }))}
                          />
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel>Lugar de Trabajo</CFormLabel>
                          <CFormInput
                            type="text"
                            value={representanteData.workPlace}
                            onChange={(e) => setRepresentanteData((prev) => ({ ...prev, workPlace: e.target.value }))}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormLabel>Teléfono del Trabajo</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText>
                              <CIcon icon={cilPhone} />
                            </CInputGroupText>
                            <CFormInput
                              type="tel"
                              value={representanteData.jobNumber}
                              onChange={(e) => setRepresentanteData((prev) => ({ ...prev, jobNumber: e.target.value }))}
                              placeholder="0212-1234567"
                            />
                          </CInputGroup>
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CCol md={12}>
                          <CFormLabel>Dirección de Habitación</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText>
                              <CIcon icon={cilHome} />
                            </CInputGroupText>
                            <CFormTextarea
                              value={representanteData.roomAdress}
                              onChange={(e) =>
                                setRepresentanteData((prev) => ({ ...prev, roomAdress: e.target.value }))
                              }
                              rows={2}
                              placeholder="Dirección completa de residencia"
                            />
                          </CInputGroup>
                        </CCol>
                      </CRow>

                      <div className="d-flex justify-content-between">
                        <CButton color="secondary" onClick={onBack}>
                          Volver
                        </CButton>
                        <CButton color="success" onClick={crearRepresentante} disabled={loading}>
                          {loading ? <CSpinner size="sm" /> : <CIcon icon={cilUserPlus} />}
                          {loading ? " Creando..." : " Crear Representante"}
                        </CButton>
                      </div>
                    </CForm>
                  </CCardBody>
                </CCard>
              )}
            </CCardBody>
          </CCard>
        )}

        {step === 2 && (
          <CCard>
            <CCardHeader>
              <h4>
                <CIcon icon={cilUserPlus} className="me-2" />
                Paso 2: Datos del Estudiante
              </h4>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <CRow className="mb-3">
                  <CCol md={4}>
                    <CFormLabel>Cédula del Estudiante *</CFormLabel>
                    <CedulaInput
                      value={studentData.ci}
                      onChange={(value) => setStudentData((prev) => ({ ...prev, ci: value }))}
                      placeholder="12345678"
                      required
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Nombres *</CFormLabel>
                    <CFormInput
                      type="text"
                      value={studentData.name}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Apellidos *</CFormLabel>
                    <CFormInput
                      type="text"
                      value={studentData.lastName}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={3}>
                    <CFormLabel>Sexo *</CFormLabel>
                    <CFormSelect
                      value={studentData.sex}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, sex: e.target.value }))}
                      required
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel>Fecha de Nacimiento *</CFormLabel>
                    <CFormInput
                      type="date"
                      value={studentData.birthday}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, birthday: e.target.value }))}
                      required
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel>Lugar de Nacimiento</CFormLabel>
                    <CFormInput
                      type="text"
                      value={studentData.placeBirth}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, placeBirth: e.target.value }))}
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel>Cantidad de Hermanos</CFormLabel>
                    <CFormInput
                      type="number"
                      min="0"
                      value={studentData.quantityBrothers}
                      onChange={(e) =>
                        setStudentData((prev) => ({ ...prev, quantityBrothers: Number.parseInt(e.target.value) || 0 }))
                      }
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={4}>
                    <CFormLabel>Nombre de la Madre</CFormLabel>
                    <CFormInput
                      type="text"
                      value={studentData.motherName}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, motherName: e.target.value }))}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Cédula de la Madre</CFormLabel>
                    <CedulaInput
                      value={studentData.motherCi}
                      onChange={(value) => setStudentData((prev) => ({ ...prev, motherCi: value }))}
                      placeholder="12345678"
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Teléfono de la Madre</CFormLabel>
                    <CFormInput
                      type="tel"
                      value={studentData.motherTelephone}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, motherTelephone: e.target.value }))}
                      placeholder="0414-1234567"
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={4}>
                    <CFormLabel>Nombre del Padre</CFormLabel>
                    <CFormInput
                      type="text"
                      value={studentData.fatherName}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, fatherName: e.target.value }))}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Cédula del Padre</CFormLabel>
                    <CedulaInput
                      value={studentData.fatherCi}
                      onChange={(value) => setStudentData((prev) => ({ ...prev, fatherCi: value }))}
                      placeholder="12345678"
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Teléfono del Padre</CFormLabel>
                    <CFormInput
                      type="tel"
                      value={studentData.fatherTelephone}
                      onChange={(e) => setStudentData((prev) => ({ ...prev, fatherTelephone: e.target.value }))}
                      placeholder="0414-1234567"
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Situación de Convivencia</CFormLabel>
                    <div className="d-flex gap-4 mt-2">
                      <CFormCheck
                        type="radio"
                        name="convivencia"
                        id="livesBoth"
                        checked={studentData.livesBoth}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            livesBoth: e.target.checked,
                            livesMother: false,
                            livesFather: false,
                            livesRepresentative: false,
                          }))
                        }
                        label="Vive con ambos padres"
                      />
                      <CFormCheck
                        type="radio"
                        name="convivencia"
                        id="livesMother"
                        checked={studentData.livesMother}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            livesMother: e.target.checked,
                            livesBoth: false,
                            livesFather: false,
                            livesRepresentative: false,
                          }))
                        }
                        label="Vive solo con la madre"
                      />
                      <CFormCheck
                        type="radio"
                        name="convivencia"
                        id="livesFather"
                        checked={studentData.livesFather}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            livesFather: e.target.checked,
                            livesBoth: false,
                            livesMother: false,
                            livesRepresentative: false,
                          }))
                        }
                        label="Vive solo con el padre"
                      />
                      <CFormCheck
                        type="radio"
                        name="convivencia"
                        id="livesRepresentative"
                        checked={studentData.livesRepresentative}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            livesRepresentative: e.target.checked,
                            livesBoth: false,
                            livesMother: false,
                            livesFather: false,
                          }))
                        }
                        label="Vive con el representante"
                      />
                    </div>
                  </CCol>
                </CRow>

                {studentData.livesRepresentative && (
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Rol del Representante</CFormLabel>
                      <CFormSelect
                        value={studentData.rolRopresentative}
                        onChange={(e) => setStudentData((prev) => ({ ...prev, rolRopresentative: e.target.value }))}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="abuelo">Abuelo(a)</option>
                        <option value="tio">Tío(a)</option>
                        <option value="hermano">Hermano(a)</option>
                        <option value="tutor">Tutor Legal</option>
                        <option value="otro">Otro</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>
                )}

                <div className="d-flex justify-content-between">
                  <CButton color="secondary" onClick={() => setStep(1)}>
                    Volver
                  </CButton>
                  <CButton color="success" onClick={crearEstudiante} disabled={loading}>
                    {loading ? <CSpinner size="sm" /> : <CIcon icon={cilUserPlus} />}
                    {loading ? " Creando..." : " Crear Estudiante"}
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        )}
      </CContainer>
    </div>
  )
}
