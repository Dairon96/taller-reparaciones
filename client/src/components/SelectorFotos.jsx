import { useEffect, useRef } from 'react'

const MAX_FOTOS = 3

// Elige hasta 3 imagenes y muestra una vista previa.
// La lista vive en el padre (props): cada foto es { archivo, url }.
//
// Un <input type="file"> no se puede controlar con value, asi que se vacia
// despues de cada eleccion y lo elegido pasa a la lista del padre.
//
// Las vistas previas usan URL.createObjectURL, que reserva memoria fuera de React:
// se crea al elegir, se libera al quitar y, si la pagina se cierra, la limpieza del
// useEffect libera las que queden. useRef guarda la lista actual para esa limpieza
// (el efecto se registra una sola vez y, sin la referencia, veria la lista inicial vacia).
export default function SelectorFotos({ fotos, onCambio }) {
  const actuales = useRef(fotos)

  useEffect(() => {
    actuales.current = fotos
  }, [fotos])

  useEffect(() => {
    return () => actuales.current.forEach((f) => URL.revokeObjectURL(f.url))
  }, [])

  function elegir(evento) {
    const libres = MAX_FOTOS - fotos.length
    const elegidas = Array.from(evento.target.files)
      .filter((archivo) => archivo.type.startsWith('image/'))
      .slice(0, libres)
      .map((archivo) => ({ archivo, url: URL.createObjectURL(archivo) }))
    onCambio([...fotos, ...elegidas])
    evento.target.value = ''
  }

  function quitar(foto) {
    URL.revokeObjectURL(foto.url)
    onCambio(fotos.filter((f) => f !== foto))
  }

  return (
    <div className="campo">
      <span>Fotos del equipo (hasta {MAX_FOTOS})</span>
      <input type="file" accept="image/*" multiple onChange={elegir} disabled={fotos.length >= MAX_FOTOS} />
      {fotos.length > 0 && (
        <ul className="fotos">
          {fotos.map((foto, i) => (
            <li key={foto.url} className="fotos__item">
              <img src={foto.url} alt={`Foto ${i + 1}`} />
              <button type="button" className="boton boton--mini boton--peligro" onClick={() => quitar(foto)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
