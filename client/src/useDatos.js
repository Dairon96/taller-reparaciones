import { useEffect, useState } from 'react'
import { pedir } from './api.js'

// Hook propio para LEER datos del servidor.
//
// - Sincroniza el componente con algo externo (el servidor): por eso es un useEffect,
//   que se vuelve a ejecutar cuando cambia la ruta o cuando se pide recargar.
// - Limpieza: si la ruta cambia o el componente desaparece antes de que llegue la
//   respuesta, se aborta la peticion (AbortController) para no pintar datos viejos.
// - Coherencia: cuando la pestaña vuelve a estar visible se recarga, asi lo que se ve
//   coincide con lo guardado aunque otro navegador haya cambiado algo.
//
// Devuelve { datos, error, cargando, recargar }.
export function useDatos(ruta) {
  const [version, setVersion] = useState(0)
  // Se guarda para que peticion (clave) es la ultima respuesta recibida.
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })

  const clave = `${ruta}#${version}`

  useEffect(() => {
    if (!ruta) return

    const control = new AbortController()

    pedir(ruta, { signal: control.signal })
      .then((datos) => setResultado({ clave, datos, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResultado((previo) => ({ ...previo, clave, error }))
      })

    return () => control.abort()
  }, [ruta, clave])

  // Recargar al volver a la pestaña. Se registra una vez y se quita al desmontar.
  useEffect(() => {
    function alVolver() {
      if (document.visibilityState === 'visible') setVersion((v) => v + 1)
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => document.removeEventListener('visibilitychange', alVolver)
  }, [])

  return {
    datos: resultado.datos,
    error: resultado.error,
    // Esta cargando mientras la ultima respuesta no sea la de la peticion actual.
    cargando: resultado.clave !== clave,
    recargar: () => setVersion((v) => v + 1),
  }
}
