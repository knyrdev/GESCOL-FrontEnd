'use client'
import { useState, useEffect } from 'react'
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
  CSpinner,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPencil, cilTrash, cilReload } from '@coreui/icons'
import { helpFetch } from '../../../api/helpFetch.js'
import MatriculaInfo from '../../pages/matriculaInformacion/matriculaInfo.js'
import { useError } from '../../../context/ErrorContext'

const MatriculaList = () => {
  const { showError } = useError()
  const api = helpFetch(showError)
  const [matriculas, setMatriculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriodo, setSelectedPeriodo] = useState('')
  const [filteredMatriculas, setFilteredMatriculas] = useState([])

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [matriculasPerPage] = useState(10)

  // Estados para modales
  const [selectedMatricula, setSelectedMatricula] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [grades, setGrades] = useState([])
  const [selectedGradeId, setSelectedGradeId] = useState('')

  // Estados para datos de utilidad
  const [periodos, setPeriodos] = useState([])

  useEffect(() => {
    loadMatriculas()
    loadPeriodos()
    loadGrades()
  }, [])

  const loadGrades = async () => {
    try {
      const response = await api.get('/api/matriculas/grades')
      if (response.ok) {
        setGrades(response.grades || [])
      }
    } catch (error) {
      console.error('❌ Error cargando grados:', error)
    }
  }

  // Función para asignar colores a los grados
  const getGradeColor = (gradeName) => {
    if (!gradeName) return 'secondary'

    const gradeColors = {
      '1er': 'primary',
      '2do': 'success',
      '3er': 'info',
      '4to': 'warning',
      '5to': 'danger',
      '6to': 'dark',
      Preescolar: 'warning',
      Inicial: 'light',
      Primer: 'primary',
      Segundo: 'success',
      Tercer: 'info',
      Cuarto: 'warning',
      Quinto: 'danger',
      Sexto: 'dark',
    }

    // Buscar coincidencia exacta primero
    if (gradeColors[gradeName]) {
      return gradeColors[gradeName]
    }

    // Buscar coincidencia parcial
    for (const [key, color] of Object.entries(gradeColors)) {
      if (gradeName.toLowerCase().includes(key.toLowerCase())) {
        return color
      }
    }

    // Color por defecto
  }



  useEffect(() => {
    filterMatriculas()
  }, [searchTerm, selectedPeriodo, matriculas])

  const loadMatriculas = async () => {
    try {
      setLoading(true)
      console.log('🔄 Cargando matrículas...')
      const response = await api.get('/api/matriculas/all')
      if (response && response.ok) {
        console.log('✅ Matrículas cargadas:', response.inscriptions)
        setMatriculas(response.inscriptions || [])
      }
    } catch (error) {
      console.error('❌ Error en loadMatriculas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPeriodos = async () => {
    try {
      const periodosUnicos = [...new Set(matriculas.map((m) => m.period))].filter(Boolean)
      setPeriodos(periodosUnicos)
    } catch (error) {
      console.error('❌ Error cargando períodos:', error)
    }
  }

  const filterMatriculas = () => {
    let filtered = matriculas

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (matricula) =>
          matricula.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          matricula.student_lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          matricula.student_ci?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por período
    if (selectedPeriodo) {
      filtered = filtered.filter((matricula) => matricula.period === selectedPeriodo)
    }

    setFilteredMatriculas(filtered)
    setCurrentPage(1)
  }

  const handleViewMatricula = (matricula) => {
    setSelectedMatricula(matricula)
    setShowDetailModal(true)
  }

  const handleDeleteMatricula = async (matriculaId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta matrícula?')) {
      return
    }

    try {
      setSuccess(null)
      const response = await api.delet('/api/matriculas', matriculaId)
      if (response.ok) {
        setSuccess('Matrícula eliminada exitosamente')
        await loadMatriculas()
      }
    } catch (error) {
      console.error('❌ Error eliminando matrícula:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  // Calcular matrículas para la página actual
  const indexOfLastMatricula = currentPage * matriculasPerPage
  const indexOfFirstMatricula = indexOfLastMatricula - matriculasPerPage
  const currentMatriculas = filteredMatriculas.slice(indexOfFirstMatricula, indexOfLastMatricula)
  const totalPages = Math.ceil(filteredMatriculas.length / matriculasPerPage)

  if (showDetailModal && selectedMatricula) {
    return (
      <div>
        <CButton
          color="secondary"
          className="mb-3"
          onClick={() => {
            setShowDetailModal(false)
            setSelectedMatricula(null)
          }}
        >
          ← Volver a la lista
        </CButton>
        <MatriculaInfo matriculaId={selectedMatricula.id} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" size="sm" />
        <span className="ms-2">Cargando matrículas...</span>
      </div>
    )
  }

  const handleDownloadPdfByGrade = async () => {
    try {
      if (!selectedGradeId) {
        showError({
          type: 'validation',
          msg: 'Por favor, seleccione un grado'
        })
        return
      }

      const grade = grades.find(g => String(g.id) === String(selectedGradeId))
      const gradeName = grade ? grade.name : selectedGradeId

      const blob = await api.downloadFile(`/api/pdf/students/list/grade/${selectedGradeId}`)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      link.setAttribute('download', `Grado_${gradeName}.pdf`)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando PDF por grado:', error)
    }
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center bg-info text-white">
          <h5 className="mb-0">Gestión de Matrículas</h5>
          <div className="d-flex gap-2 align-items-center">
            <CFormSelect
              size="sm"
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="">Seleccione un grado...</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </CFormSelect>
            <CButton
              color="success"
              size="sm"
              onClick={handleDownloadPdfByGrade}
              disabled={!selectedGradeId}
            >
              Descargar PDF por Grado
            </CButton>
            <CButton color="info" size="sm" onClick={loadMatriculas}>
              <CIcon icon={cilReload} className="me-1" />
              Actualizar
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {/* Filtros y búsqueda */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar por nombre, apellido o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
            </CCol>

            <CCol md={2} className="text-end">
              <small className="text-muted">
                {currentMatriculas.length} de {filteredMatriculas.length} matrículas
              </small>
            </CCol>
          </CRow>

          {/* Tabla de matrículas */}
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Estudiante</CTableHeaderCell>
                <CTableHeaderCell>Cédula Escolar</CTableHeaderCell>
                <CTableHeaderCell>Grado</CTableHeaderCell>
                <CTableHeaderCell>Sección</CTableHeaderCell>
                <CTableHeaderCell>Fecha Inscripción</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentMatriculas.length > 0 ? (
                currentMatriculas.map((matricula) => (
                  <CTableRow key={matricula.id}>
                    <CTableDataCell>
                      <strong>
                        {matricula.student_name} {matricula.student_lastname}
                      </strong>
                    </CTableDataCell>
                    <CTableDataCell>{matricula.student_ci || '-'}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge
                        color={getGradeColor(matricula.grade_name)}
                        style={{
                          border: '2px solid',
                          borderColor: 'rgba(0,0,0,0.2)',
                          fontWeight: 'bold',
                          fontSize: '0.85em',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {matricula.grade_name || '-'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="secondary" style={{ padding: '4px 8px' }}>
                        {matricula.section_name || '-'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{formatDate(matricula.registrationDate)}</CTableDataCell>
                    <CTableDataCell>
                      <CButtonGroup size="sm">
                        <CButton
                          color="info"
                          variant="outline"
                          onClick={() => handleViewMatricula(matricula)}
                          title="Ver detalles"
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          onClick={() => handleDeleteMatricula(matricula.id)}
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
                  <CTableDataCell colSpan={6} className="text-center text-muted">
                    {searchTerm || selectedPeriodo
                      ? 'No se encontraron matrículas que coincidan con los filtros'
                      : 'No hay matrículas registradas'}
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <CPagination>
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
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
                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default MatriculaList
