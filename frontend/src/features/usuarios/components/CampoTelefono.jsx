import BanderaPeru from './BanderaPeru.jsx';
import CampoUsuario from './CampoUsuario.jsx';

/** Agrupa los dígitos de 3 en 3 para leerlos mejor ("987654321" → "987 654 321"). */
function agruparDigitos(digitos) {
  return digitos.replace(/(\d{3})(?=\d)/g, '$1 ');
}

/**
 * Teléfono celular peruano: prefijo fijo con bandera y +51, y exactamente 9 dígitos. Solo deja escribir dígitos y
 * los muestra agrupados de 3 en 3; el valor que sale hacia el formulario son siempre los 9 dígitos juntos.
 *
 * @param {Object} props
 * @param {string} props.valor Solo los 9 dígitos nacionales.
 * @param {(valor: string) => void} props.alCambiar
 * @param {() => void} [props.alDesenfocar] Se llama al salir del campo (validación inmediata).
 * @param {boolean} [props.requerido]
 * @param {string} [props.error]
 * @param {string} [props.ayuda]
 */
export default function CampoTelefono({
  valor,
  alCambiar,
  alDesenfocar,
  requerido = false,
  error = '',
  ayuda = 'Celular peruano de 9 dígitos.'
}) {
  return (
    <CampoUsuario
      etiqueta="Teléfono"
      valor={agruparDigitos(valor)}
      alCambiar={(texto) => alCambiar(texto.replace(/\D/g, '').slice(0, 9))}
      requerido={requerido}
      error={error}
      ayuda={ayuda}
      prefijo={
        <>
          <BanderaPeru />
          <span>+51</span>
        </>
      }
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      placeholder="987 654 321"
      maxLength={11}
      onBlur={alDesenfocar}
    />
  );
}
