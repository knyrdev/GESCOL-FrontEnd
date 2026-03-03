"use client"

import { useState } from "react"
import TipoInscripcion from "./registro-estudiantil/tipo-inscripcion"
import BuscarEstudiante from "./registro-estudiantil/buscar-estudiante"
import CrearAlumno from "./registro-estudiantil/crear-alumno"
import ValidacionGrados from "./registro-estudiantil/validacion-grados"
import InscripcionPeriodo from "./registro-estudiantil/inscripcion-periodo"
import { CAlert, CContainer, CSpinner } from "@coreui/react"

export default function RegistroEstudiantilMain() {
  const [currentStep, setCurrentStep] = useState("tipo")
  const [tipoInscripcion, setTipoInscripcion] = useState(null)
  const [student, setStudent] = useState(null)
  const [hasAcademicHistory, setHasAcademicHistory] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleTipoSelected = (tipo) => {
    setTipoInscripcion(tipo)

    // Flujo según el tipo de inscripción
    switch (tipo) {
      case "nuevo":
        // Nuevo ingreso: Representante → Estudiante → Historial → Inscripción
        setCurrentStep("crear-alumno")
        break

      case "reintegro":
        // Reintegro: Buscar estudiante → Historial → Inscripción
        setCurrentStep("buscar-estudiante")
        break

      case "regular":
        // Regular: Buscar estudiante → Inscripción directa
        setCurrentStep("buscar-estudiante")
        break

      default:
        setCurrentStep("crear-alumno")
    }
  }

  const handleStudentFound = (foundStudent) => {
    setStudent(foundStudent)

    if (tipoInscripcion === "reintegro") {
      // Para reintegro, ir al historial académico
      setCurrentStep("validacion-grados")
    } else if (tipoInscripcion === "regular") {
      // Para regular, ir directo a inscripción
      setCurrentStep("inscripcion")
    }
  }

  const handleStudentCreated = (createdStudent) => {
    setStudent(createdStudent)
    setCurrentStep("validacion-grados")
  }

  const handleHistoryCompleted = (hasHistory) => {
    setHasAcademicHistory(hasHistory)
    setCurrentStep("inscripcion")
  }

  const handleInscriptionCompleted = () => {
    setCurrentStep("completado")
  }

  const handleBackToTipo = () => {
    setCurrentStep("tipo")
    setTipoInscripcion(null)
    setStudent(null)
    setHasAcademicHistory(false)
  }

  const handleBackToBuscarEstudiante = () => {
    setCurrentStep("buscar-estudiante")
  }

  const handleBackToCrearAlumno = () => {
    setCurrentStep("crear-alumno")
  }

  const handleBackToValidacionGrados = () => {
    setCurrentStep("validacion-grados")
  }

  const handleStartNew = () => {
    setCurrentStep("tipo")
    setTipoInscripcion(null)
    setStudent(null)
    setHasAcademicHistory(false)
  }

  return (
    <div className="min-vh-100 bg-dark">
      {loading && (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <CSpinner color="primary" />
        </div>
      )}

      {!loading && (
        <>
          {currentStep === "tipo" && <TipoInscripcion onSelectTipo={handleTipoSelected} />}

          {currentStep === "buscar-estudiante" &&
            (tipoInscripcion === "reintegro" || tipoInscripcion === "regular") && (
              <BuscarEstudiante
                tipoInscripcion={tipoInscripcion}
                onStudentFound={handleStudentFound}
                onBack={handleBackToTipo}
              />
            )}

          {currentStep === "crear-alumno" && tipoInscripcion === "nuevo" && (
            <CrearAlumno
              tipoInscripcion={tipoInscripcion}
              onStudentCreated={handleStudentCreated}
              onBack={handleBackToTipo}
            />
          )}

          {currentStep === "validacion-grados" &&
            student &&
            (tipoInscripcion === "nuevo" || tipoInscripcion === "reintegro") && (
              <ValidacionGrados
                student={student}
                tipoInscripcion={tipoInscripcion}
                onHistoryCompleted={handleHistoryCompleted}
                onBack={tipoInscripcion === "nuevo" ? handleBackToCrearAlumno : handleBackToBuscarEstudiante}
              />
            )}

          {currentStep === "inscripcion" && student && (
            <InscripcionPeriodo
              student={student}
              tipoInscripcion={tipoInscripcion}
              hasAcademicHistory={hasAcademicHistory}
              onInscriptionCompleted={handleInscriptionCompleted}
              onBack={tipoInscripcion === "regular" ? handleBackToBuscarEstudiante : handleBackToValidacionGrados}
            />
          )}

          {currentStep === "completado" && (
            <div className="min-vh-100 bg-dark py-4">
              <CContainer>
                <div className="text-center py-5">
                  <CAlert color="success" className="mb-4">
                    <h2 className="alert-heading text-white">¡Inscripción Completada Exitosamente!</h2>
                    <hr />
                    <p className="mb-0 text-white">
                      El estudiante{" "}
                      <strong>
                        {student?.name} {student?.lastName}
                      </strong>{" "}
                      ha sido inscrito correctamente en el período académico actual.
                    </p>
                  </CAlert>

                  <div className="mt-4">
                    <button className="btn btn-primary btn-lg me-3" onClick={handleStartNew}>
                      Inscribir Otro Estudiante
                    </button>
                    <button
                      className="btn btn-outline-light btn-lg"
                      onClick={() => (window.location.href = "/matricula")}
                    >
                      Ver Matrícula
                    </button>
                  </div>
                </div>
              </CContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
