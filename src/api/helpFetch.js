export const helpFetch = () => {
  const URL = 'http://localhost:3001'

  const customFetch = (endpoint, options = {}) => {
    options.method = options.method || 'GET'

    options.headers = {
      ...(options.headers || {}),
      'content-type': 'application/json',
      authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    }

    if (options.body) {
      options.body = JSON.stringify(options.body)
    }
    console.log(options)

    return fetch(`${URL}${endpoint}`, options)
      .then(async (response) => {
        const data = await response.json() // Leer JSON siempre
        if (response.ok) {
          return data // OK, devolver data directamente
        } else {
          // Rechazar con data para que contenga el msg del backend
          return Promise.reject(data)
        }
      })
      .catch((error) => error)
  }

  const get = (endpoint) => customFetch(endpoint)

  const post = (endpoint, options) => {
    options.method = 'POST'
    return customFetch(endpoint, options)
  }

  const put = (endpoint, options = {}, id = '') => {
    options.method = 'PUT'
    const url = id ? `${endpoint}/${id}` : endpoint
    return customFetch(url, options)
  }

  const delet = (endpoint, id) => {
    const options = {
      method: 'DELETE',
    }
    return customFetch(`${endpoint}/${id}`, options)
  }

  const downloadFile = async (endpoint) => {
    const token = localStorage.getItem('accessToken')

    try {
      const response = await fetch(`${URL}${endpoint}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Error al descargar el archivo')

      const blob = await response.blob()
      return blob
    } catch (error) {
      console.error('Error al descargar archivo:', error)
      throw error
    }
  }

  return { get, post, put, delet, downloadFile }
}
