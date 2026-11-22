// Mensaje para errores o avisos. Si no hay texto, no pinta nada.
export default function Aviso({ tipo = 'error', children }) {
  if (!children) return null
  return (
    <p className={`aviso aviso--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
