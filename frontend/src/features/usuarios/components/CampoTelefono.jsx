import CampoUsuario from './CampoUsuario.jsx';

/**
 * Teléfono celular peruano: prefijo fijo +51 y exactamente 9 dígitos. Solo deja escribir dígitos.
 *
 * @param {Object} props
 * @param {string} props.valor Solo los 9 dígitos nacionales.
 * @param {(valor: string) => void} props.alCambiar
 * @param {boolean} [props.requerido]
 * @param {string} [props.error]
 * @param {string} [props.ayuda]
 */
export default function CampoTelefono({
  valor,
  alCambiar,
  requerido = false,
  error = '',
  ayuda = 'Celular peruano: ingrese exactamente 9 dígitos.'
}) {
  return (
    <CampoUsuario
      etiqueta="Teléfono"
      valor={valor}
      alCambiar={(texto) => alCambiar(texto.replace(/\D/g, '').slice(0, 9))}
      requerido={requerido}
      error={error}
      ayuda={ayuda}
      prefijo={
        <>
          <span aria-hidden="true">🇵🇪</span>
          <span>+51</span>
        </>
      }
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      placeholder="Número de teléfono"
      maxLength={9}
      pattern="[0-9]{9}"
    />
  );
}
