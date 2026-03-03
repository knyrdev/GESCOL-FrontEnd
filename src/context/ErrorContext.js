import React, { createContext, useContext, useState, useCallback } from 'react'
import ErrorModal from '../components/error-modal'

const ErrorContext = createContext()

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null)
    const [visible, setVisible] = useState(false)

    const showError = useCallback((errorData) => {
        // Expect errorData to match the structure expected by ErrorModal
        // or be a raw backend response object
        const formattedError = {
            type: errorData.type || 'server',
            title: errorData.title || null,
            message: errorData.msg || errorData.message || 'Ha ocurrido un error inesperado',
            details: errorData.details || (errorData.error ? JSON.stringify(errorData.error) : null),
        }

        // Try to auto-detect type based on msg content if type is not provided
        if (!errorData.type && formattedError.message) {
            const msg = formattedError.message.toLowerCase()
            if (msg.includes('token') || msg.includes('auth') || msg.includes('permisos') || msg.includes('privilegios')) {
                formattedError.type = 'auth'
            } else if (msg.includes('validación') || msg.includes('requerido') || msg.includes('formato')) {
                formattedError.type = 'validation'
            } else if (msg.includes('conexión') || msg.includes('fetch') || msg.includes('network')) {
                formattedError.type = 'network'
            }
        }

        setError(formattedError)
        setVisible(true)
    }, [])

    const hideError = useCallback(() => {
        setVisible(false)
    }, [])

    return (
        <ErrorContext.Provider value={{ showError, hideError }}>
            {children}
            <ErrorModal visible={visible} onClose={hideError} error={error} />
        </ErrorContext.Provider>
    )
}

export const useError = () => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider')
    }
    return context
}
