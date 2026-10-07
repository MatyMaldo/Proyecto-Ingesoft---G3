/**
 * Configuración centralizada del acceso a la API del backend.
 * Lee las variables de entorno de Vite (`import.meta.env`) y expone valores
 * por defecto que preservan el comportamiento actual basado en mocks.
 */

/**
 * URL base de la API del backend, sin barra final.
 * Por defecto apunta al backend local de desarrollo.
 *
 * @type {string}
 */
export const URL_BASE_API = (
  import.meta.env.VITE_URL_BASE_API ?? 'http://localhost:8080/api/v1'
).replace(/\/+$/, '');

/**
 * Indica si los servicios deben usar datos simulados (mocks) en lugar de
 * llamar al backend real. Es `true` por defecto: solo pasa a `false` cuando
 * `VITE_USAR_MOCK` es exactamente la cadena `'false'`. Así, mientras no se
 * configure la variable, el comportamiento actual no cambia.
 *
 * @type {boolean}
 */
export const USAR_MOCK = import.meta.env.VITE_USAR_MOCK !== 'false';

/**
 * Tiempo máximo de espera, en milisegundos, para una solicitud HTTP antes de
 * cancelarla automáticamente.
 *
 * @type {number}
 */
export const TIEMPO_ESPERA_MS = 15000;
