"use client"

import { useState } from "react"
import { CCard, CCardBody, CCardHeader, CRow, CCol, CButton, CContainer } from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilUserPlus, cilUserFollow, cilUser } from "@coreui/icons"

export default function TipoInscripcion({ onSelectTipo }) {
  const [selectedTipo, setSelectedTipo] = useState(null)

  const tiposInscripcion = [
    {
      id: "nuevo",
      title: "Nuevo Ingreso",
      description: "Estudiante que ingresa por primera vez al sistema educativo o a la institución",
      icon: cilUserPlus,
      color: "success",
    },
    {
      id: "reintegro",
      title: "Reintegro",
      description: "Estudiante que regresa después de haber estado fuera del sistema por un período",
      icon: cilUserFollow,
      color: "warning",
    },
    {
      id: "regular",
      title: "Estudiante Regular",
      description: "Estudiante que continúa sus estudios de manera consecutiva en la institución",
      icon: cilUser,
      color: "info",
    },
  ]

  const handleSelect = (tipo) => {
    setSelectedTipo(tipo)
    onSelectTipo(tipo)
  }

  return (
    <CContainer>
      <div className="mb-4 text-center">
        <h2 className="mb-3">Registro Estudiantil</h2>
        <p className="text-muted">Seleccione el tipo de inscripción que corresponde al estudiante</p>
      </div>

      <CRow className="justify-content-center">
        {tiposInscripcion.map((tipo) => (
          <CCol key={tipo.id} md={4} className="mb-4">
            <CCard
              className={`h-100 cursor-pointer border-2 ${
                selectedTipo === tipo.id ? `border-${tipo.color}` : "border-light"
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => handleSelect(tipo.id)}
            >
              <CCardHeader className={`text-center bg-${tipo.color} text-white`}>
                <CIcon icon={tipo.icon} size="xl" className="mb-2" />
                <h4 className="mb-0">{tipo.title}</h4>
              </CCardHeader>
              <CCardBody className="text-center">
                <p className="text-muted">{tipo.description}</p>
                <CButton color={tipo.color} variant={selectedTipo === tipo.id ? "solid" : "outline"} className="mt-2">
                  {selectedTipo === tipo.id ? "Seleccionado" : "Seleccionar"}
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {selectedTipo && (
        <div className="text-center mt-4">
          <CButton color="primary" size="lg" onClick={() => onSelectTipo(selectedTipo)}>
            Continuar con {tiposInscripcion.find((t) => t.id === selectedTipo)?.title}
          </CButton>
        </div>
      )}
    </CContainer>
  )
}
