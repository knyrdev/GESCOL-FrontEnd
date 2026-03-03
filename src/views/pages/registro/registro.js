"use client"

import { useState, useRef } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CContainer,
  CSpinner,
  CProgress,
  CBadge,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilUser, cilPeople, cilCheckCircle, cilWarning, cilArrowRight, cilArrowLeft, cilSave } from "@coreui/icons"
import { helpFetch } from "../../../api/helpFetch.js"
import { useError } from "../../../context/ErrorContext"

const RegistroEstudiantil = () => {
  const { showError } = useError()
  const api = helpFetch(showError)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const toasterRef = useRef()

  const [formData, setFormData] = useState({
    // Información del Estudiante
    student: {
      ci: "",
      name: "",
      lastName: "",
      sex: "",
      birthday: "",
      placeBirth: "",
      parishID: null,
      quantityBrothers: 0,
      motherName: "",
      motherCi: "",
      motherTelephone: "",
      fatherName: "",
      fatherCi: "",
      fatherTelephone: "",
      livesMother: false,
      livesFather: false,
      livesBoth: false,
      livesRepresentative: false,
      rolRopresentative: "",
    },
    // Información del Representante
    representative: {
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
    },
  })

  const [errors, setErrors] = useState({})



  const showToast = (message, color = "success") => {
    if (color === "danger") {
      showError({ message })
      return
    }
    const toast = (
      <CToast autohide delay={5000}>
        <CToastHeader closeButton>
          <CIcon icon={color === "success" ? cilCheckCircle : cilWarning} className="me-2" />
          <strong className="me-auto">{color === "success" ? "Éxito" : "Alerta"}</strong>
        </CToastHeader>
        <CToastBody>{message}</CToastBody>
      </CToast>
    )

    if (toasterRef.current) {
      toasterRef.current.addToast(toast)
    }
  }

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))

    // Limpiar error del campo si existe
    const errorKey = `${section}.${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: null,
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      // Validar información del estudiante
      if (!formData.student.ci) newErrors["student.ci"] = "La cédula es requerida"
      if (!formData.student.name) newErrors["student.name"] = "El nombre es requerido"
      if (!formData.student.lastName) newErrors["student.lastName"] = "El apellido es requerido"
      if (!formData.student.sex) newErrors["student.sex"] = "El sexo es requerido"
      if (!formData.student.birthday) newErrors["student.birthday"] = "La fecha de nacimiento es requerida"
      if (!formData.student.placeBirth) newErrors["student.placeBirth"] = "El lugar de nacimiento es requerido"
    }

    if (step === 2) {
      // Validar información del representante
      if (!formData.representative.ci) newErrors["representative.ci"] = "La cédula del representante es requerida"
      if (!formData.representative.name) newErrors["representative.name"] = "El nombre del representante es requerido"
      if (!formData.representative.lastName)
        newErrors["representative.lastName"] = "El apellido del representante es requerido"
      if (!formData.representative.telephoneNumber)
        newErrors["representative.telephoneNumber"] = "El teléfono es requerido"
      if (!formData.representative.roomAdress) newErrors["representative.roomAdress"] = "La dirección es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2))
    } else {
      showError({
        type: "validation",
        message: "Por favor complete los campos obligatorios marcados con error."
      })
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return

    try {
      setSubmitting(true)
      console.log("📝 Enviando registro estudiantil:", formData)

      const response = await api.post("/api/students/registry", {
        body: formData,
      })

      console.log("📥 Respuesta registro:", response)

      // Si la respuesta es exitosa
      if (response.ok !== false) {
        showToast("Estudiante registrado exitosamente")

        // Resetear formulario después de un delay
        setTimeout(() => {
          setFormData({
            student: {
              ci: "",
              name: "",
              lastName: "",
              sex: "",
              birthday: "",
              placeBirth: "",
              parishID: null,
              quantityBrothers: 0,
              motherName: "",
              motherCi: "",
              motherTelephone: "",
              fatherName: "",
              fatherCi: "",
              fatherTelephone: "",
              livesMother: false,
              livesFather: false,
              livesBoth: false,
              livesRepresentative: false,
              rolRopresentative: "",
            },
            representative: {
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
            },
          })
          setCurrentStep(1)
          setErrors({})
        }, 2000)
      } else {
        // Si hay error en la respuesta
        showToast(response.msg || "Error al registrar el estudiante", "danger")
      }
    } catch (error) {
      console.error("❌ Error en registro:", error)

      // Manejar diferentes tipos de errores
      let errorMessage = "Error al registrar el estudiante"

      if (error.msg) {
        errorMessage = error.msg
      } else if (error.message) {
        errorMessage = error.message
      }

      showToast(errorMessage, "danger")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CCard>
            <CCardHeader className="bg-primary text-white">
              <h5 className="mb-0">
                <CIcon icon={cilUser} className="me-2" />
                Información del Estudiante
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6} className="mb-3">
                  <CFormLabel>Cédula de Identidad *</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.ci}
                    onChange={(e) => handleInputChange("student", "ci", e.target.value)}
                    placeholder="Ej: V-12345678"
                    invalid={!!errors["student.ci"]}
                  />
                  {errors["student.ci"] && <div className="invalid-feedback">{errors["student.ci"]}</div>}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Nombres *</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.name}
                    onChange={(e) => handleInputChange("student", "name", e.target.value)}
                    placeholder="Nombres del estudiante"
                    invalid={!!errors["student.name"]}
                  />
                  {errors["student.name"] && <div className="invalid-feedback">{errors["student.name"]}</div>}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Apellidos *</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.lastName}
                    onChange={(e) => handleInputChange("student", "lastName", e.target.value)}
                    placeholder="Apellidos del estudiante"
                    invalid={!!errors["student.lastName"]}
                  />
                  {errors["student.lastName"] && <div className="invalid-feedback">{errors["student.lastName"]}</div>}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Sexo *</CFormLabel>
                  <CFormSelect
                    value={formData.student.sex}
                    onChange={(e) => handleInputChange("student", "sex", e.target.value)}
                    invalid={!!errors["student.sex"]}
                  >
                    <option value="">Seleccione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </CFormSelect>
                  {errors["student.sex"] && <div className="invalid-feedback">{errors["student.sex"]}</div>}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Fecha de Nacimiento *</CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.student.birthday}
                    onChange={(e) => handleInputChange("student", "birthday", e.target.value)}
                    invalid={!!errors["student.birthday"]}
                  />
                  {errors["student.birthday"] && <div className="invalid-feedback">{errors["student.birthday"]}</div>}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Lugar de Nacimiento *</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.placeBirth}
                    onChange={(e) => handleInputChange("student", "placeBirth", e.target.value)}
                    placeholder="Ciudad, Estado"
                    invalid={!!errors["student.placeBirth"]}
                  />
                  {errors["student.placeBirth"] && (
                    <div className="invalid-feedback">{errors["student.placeBirth"]}</div>
                  )}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Cantidad de Hermanos</CFormLabel>
                  <CFormInput
                    type="number"
                    value={formData.student.quantityBrothers}
                    onChange={(e) =>
                      handleInputChange("student", "quantityBrothers", Number.parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </CCol>

                <CCol md={12} className="mb-3">
                  <CFormLabel>Vive con *</CFormLabel>
                  <div className="d-flex flex-wrap gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="livesMother"
                        checked={formData.student.livesMother}
                        onChange={(e) => handleInputChange("student", "livesMother", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="livesMother">
                        Solo Madre
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="livesFather"
                        checked={formData.student.livesFather}
                        onChange={(e) => handleInputChange("student", "livesFather", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="livesFather">
                        Solo Padre
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="livesBoth"
                        checked={formData.student.livesBoth}
                        onChange={(e) => handleInputChange("student", "livesBoth", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="livesBoth">
                        Ambos Padres
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="livesRepresentative"
                        checked={formData.student.livesRepresentative}
                        onChange={(e) => handleInputChange("student", "livesRepresentative", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="livesRepresentative">
                        Representante
                      </label>
                    </div>
                  </div>
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Rol del Representante</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.rolRopresentative}
                    onChange={(e) => handleInputChange("student", "rolRopresentative", e.target.value)}
                    placeholder="Ej: Tío, Abuelo, etc."
                  />
                </CCol>

                {/* Información de los Padres */}
                <CCol md={12} className="mb-3">
                  <h6 className="text-muted">Información de los Padres</h6>
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Nombre de la Madre</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.motherName}
                    onChange={(e) => handleInputChange("student", "motherName", e.target.value)}
                    placeholder="Nombre completo de la madre"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Cédula de la Madre</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.motherCi}
                    onChange={(e) => handleInputChange("student", "motherCi", e.target.value)}
                    placeholder="Ej: V-12345678"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Teléfono de la Madre</CFormLabel>
                  <CFormInput
                    type="tel"
                    value={formData.student.motherTelephone}
                    onChange={(e) => handleInputChange("student", "motherTelephone", e.target.value)}
                    placeholder="Ej: 0414-1234567"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Nombre del Padre</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.fatherName}
                    onChange={(e) => handleInputChange("student", "fatherName", e.target.value)}
                    placeholder="Nombre completo del padre"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Cédula del Padre</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.student.fatherCi}
                    onChange={(e) => handleInputChange("student", "fatherCi", e.target.value)}
                    placeholder="Ej: V-12345678"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Teléfono del Padre</CFormLabel>
                  <CFormInput
                    type="tel"
                    value={formData.student.fatherTelephone}
                    onChange={(e) => handleInputChange("student", "fatherTelephone", e.target.value)}
                    placeholder="Ej: 0414-1234567"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        )

      case 2:
        return (
          <CCard>
            <CCardHeader className="bg-success text-white">
              <h5 className="mb-0">
                <CIcon icon={cilPeople} className="me-2" />
                Información del Representante
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6} className="mb-3">
                  <CFormLabel>Cédula de Identidad *</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.representative.ci}
                    onChange={(e) => handleInputChange("representative", "ci", e.target.value)}
                    placeholder="Ej: V-12345678"
                    invalid={!!errors["representative.ci"]}
                  />
                  {errors["representative.ci"] && <div className="invalid-feedback">{errors["representative.ci"]}</div>}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Nombres *</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.representative.name}
                    onChange={(e) => handleInputChange("representative", "name", e.target.value)}
                    placeholder="Nombres del representante"
                    invalid={!!errors["representative.name"]}
                  />
                  {errors["representative.name"] && (
                    <div className="invalid-feedback">{errors["representative.name"]}</div>
                  )}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Apellidos *</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.representative.lastName}
                    onChange={(e) => handleInputChange("representative", "lastName", e.target.value)}
                    placeholder="Apellidos del representante"
                    invalid={!!errors["representative.lastName"]}
                  />
                  {errors["representative.lastName"] && (
                    <div className="invalid-feedback">{errors["representative.lastName"]}</div>
                  )}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Teléfono *</CFormLabel>
                  <CFormInput
                    type="tel"
                    value={formData.representative.telephoneNumber}
                    onChange={(e) => handleInputChange("representative", "telephoneNumber", e.target.value)}
                    placeholder="Ej: 0414-1234567"
                    invalid={!!errors["representative.telephoneNumber"]}
                  />
                  {errors["representative.telephoneNumber"] && (
                    <div className="invalid-feedback">{errors["representative.telephoneNumber"]}</div>
                  )}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData.representative.email}
                    onChange={(e) => handleInputChange("representative", "email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Estado Civil</CFormLabel>
                  <CFormSelect
                    value={formData.representative.maritalStat}
                    onChange={(e) => handleInputChange("representative", "maritalStat", e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    <option value="Soltero">Soltero/a</option>
                    <option value="Casado">Casado/a</option>
                    <option value="Divorciado">Divorciado/a</option>
                    <option value="Viudo">Viudo/a</option>
                    <option value="Unión Libre">Unión Libre</option>
                  </CFormSelect>
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Fecha de Nacimiento</CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.representative.birthday}
                    onChange={(e) => handleInputChange("representative", "birthday", e.target.value)}
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Teléfono de Casa</CFormLabel>
                  <CFormInput
                    type="tel"
                    value={formData.representative.telephoneHouse}
                    onChange={(e) => handleInputChange("representative", "telephoneHouse", e.target.value)}
                    placeholder="Ej: 0212-1234567"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Teléfono del Trabajo</CFormLabel>
                  <CFormInput
                    type="tel"
                    value={formData.representative.jobNumber}
                    onChange={(e) => handleInputChange("representative", "jobNumber", e.target.value)}
                    placeholder="Teléfono del trabajo"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Ocupación</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.representative.profesion}
                    onChange={(e) => handleInputChange("representative", "profesion", e.target.value)}
                    placeholder="Ocupación del representante"
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Lugar de Trabajo</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.representative.workPlace}
                    onChange={(e) => handleInputChange("representative", "workPlace", e.target.value)}
                    placeholder="Lugar de trabajo"
                  />
                </CCol>

                <CCol md={12} className="mb-3">
                  <CFormLabel>Dirección de Habitación *</CFormLabel>
                  <CFormTextarea
                    rows={3}
                    value={formData.representative.roomAdress}
                    onChange={(e) => handleInputChange("representative", "roomAdress", e.target.value)}
                    placeholder="Dirección completa del representante"
                    invalid={!!errors["representative.roomAdress"]}
                  />
                  {errors["representative.roomAdress"] && (
                    <div className="invalid-feedback">{errors["representative.roomAdress"]}</div>
                  )}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        )

      default:
        return null
    }
  }

  return (
    <CContainer fluid>
      <CRow className="mb-4">
        <CCol>
          <h2 className="mb-3">Registro Estudiantil</h2>
          <p className="text-muted">Registre la información básica del estudiante y su representante</p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span>Progreso del Registro</span>
              <span>{Math.round((currentStep / 2) * 100)}%</span>
            </div>
            <CProgress value={(currentStep / 2) * 100} color="primary" />
          </div>

          {/* Step Indicators */}
          <div className="d-flex justify-content-center mb-4">
            {[1, 2].map((step) => (
              <div key={step} className="text-center mx-4">
                <CBadge
                  color={currentStep >= step ? "primary" : "secondary"}
                  className="rounded-circle p-2 mb-1"
                  style={{ width: "40px", height: "40px" }}
                >
                  {step}
                </CBadge>
                <div className="small">
                  {step === 1 && "Estudiante"}
                  {step === 2 && "Representante"}
                </div>
              </div>
            ))}
          </div>
        </CCol>
      </CRow>

      <CRow>
        <CCol>
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <CButton color="secondary" onClick={prevStep} disabled={currentStep === 1}>
              <CIcon icon={cilArrowLeft} className="me-1" />
              Anterior
            </CButton>

            {currentStep < 2 ? (
              <CButton color="primary" onClick={nextStep}>
                Siguiente
                <CIcon icon={cilArrowRight} className="ms-1" />
              </CButton>
            ) : (
              <CButton color="success" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilSave} className="me-1" />
                    Registrar Estudiante
                  </>
                )}
              </CButton>
            )}
          </div>
        </CCol>
      </CRow>

      {/* Toast Container */}
      <CToaster ref={toasterRef} placement="top-end" />
    </CContainer>
  )
}

export default RegistroEstudiantil
