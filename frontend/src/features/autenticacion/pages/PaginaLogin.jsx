import { useEffect } from 'react';

import PanelInstitucional from '../components/PanelInstitucional.jsx';
import FormularioLogin from '../components/FormularioLogin.jsx';
import useLogin from '../hooks/useLogin.js';
import estilos from './PaginaLogin.module.css';

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
    avisoExito,
    enviando,
    refCorreo,
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
            Ingresa tus credenciales institucionales
          </p>

          <FormularioLogin
            valores={valores}
            errores={errores}
            errorGeneral={errorGeneral}
            avisoExito={avisoExito}
            enviando={enviando}
            refCorreo={refCorreo}
            refContrasena={refContrasena}
            alCambiarCampo={manejarCambioCampo}
            alSalirDeCampo={manejarSalidaCampo}
            alEnviar={manejarEnvio}
          />
        </div>

      </main>
    </div>
  );
}
