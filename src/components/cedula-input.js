"use client"

import { CInputGroup, CFormSelect, CFormInput } from "@coreui/react"

export default function CedulaInput({
  value = "",
  onChange,
  placeholder = "12345678",
  disabled = false,
  required = false,
  label = "Cédula",
}) {
  // Separar prefijo y número de la cédula
  const getPrefix = () => {
    if (value.startsWith("V-") || value.startsWith("v-")) return "V"
    if (value.startsWith("E-") || value.startsWith("e-")) return "E"
    return "V" // Por defecto
  }

  const getNumber = () => {
    if (value.includes("-")) {
      return value.split("-")[1] || ""
    }
    return value
  }

  const handlePrefixChange = (newPrefix) => {
    const number = getNumber()
    const newValue = number ? `${newPrefix}-${number}` : newPrefix
    onChange(newValue)
  }

  const handleNumberChange = (newNumber) => {
    const prefix = getPrefix()
    // Solo permitir números
    const cleanNumber = newNumber.replace(/\D/g, "")
    const newValue = cleanNumber ? `${prefix}-${cleanNumber}` : ""
    onChange(newValue)
  }

  return (
    <CInputGroup>
      <CFormSelect
        style={{ maxWidth: "70px" }}
        value={getPrefix()}
        onChange={(e) => handlePrefixChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        <option value="V">V</option>
        <option value="E">E</option>
      </CFormSelect>
      <CFormInput
        type="text"
        placeholder={placeholder}
        value={getNumber()}
        onChange={(e) => handleNumberChange(e.target.value)}
        disabled={disabled}
        required={required}
        maxLength="8"
      />
    </CInputGroup>
  )
}
