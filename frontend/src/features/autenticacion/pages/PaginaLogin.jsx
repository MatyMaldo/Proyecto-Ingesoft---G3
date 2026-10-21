import { useEffect } from 'react';

import PanelInstitucional from '../components/PanelInstitucional.jsx';
import FormularioLogin from '../components/FormularioLogin.jsx';
import useLogin from '../hooks/useLogin.js';
import estilos from './PaginaLogin.module.css';

const TEXTOS_PIE = ['Soporte Técnico', 'Manual de Usuario', 'Política de Privacidad'];

/**
 * Página de inicio de sesión (HU-SAT-07, `/iniciar-sesion`). Compone la
 * pantalla y conecta `useLogin()` con `FormularioLogin`; no llama servicios ni
 * valida por sí misma. No navega tras el login: lo hace `RutaPublica` al
 * detectar la sesión.
 */
export default function PaginaLogin() {
  const {
    valores,
    errores,
    errorGeneral,
    enviando,
    perfiles,
    refIdentificador,
    refContrasena,
    manejarCambioCampo,
    manejarSalidaCampo,
    manejarEnvio
  } = useLogin();

  useEffect(() => {
    document.title = 'Iniciar sesión · Colegio San Marcos';
  }, []);

  return (
    <div className={estilos.pagina}>
      <PanelInstitucional />

      <main className={estilos.main}>
        <div className={estilos.tarjeta}>
          <h1 id="login-titulo" className={estilos.titulo}>
            Iniciar sesión
          </h1>
          <p className={estilos.subtitulo}>
            Selecciona tu perfil e ingresa tus credenciales institucionales
          </p>

          <FormularioLogin
            valores={valores}
            errores={errores}
            errorGeneral={errorGeneral}
            enviando={enviando}
            perfiles={perfiles}
            refIdentificador={refIdentificador}
            refContrasena={refContrasena}
            alCambiarCampo={manejarCambioCampo}
            alSalirDeCampo={manejarSalidaCampo}
            alEnviar={manejarEnvio}
          />
        </div>

        {/* TODO(pregunta): destinos de los enlaces del pie. */}
        <p className={estilos.pie}>
          {TEXTOS_PIE.map((texto, indice) => (
            <span key={texto}>
              {texto}
              {indice < TEXTOS_PIE.length - 1 && (
                <span className={estilos.separadorPie} aria-hidden="true">
                  {' '}
                  ·{' '}
                </span>
              )}
            </span>
          ))}
        </p>
      </main>
    </div>
  );
}
