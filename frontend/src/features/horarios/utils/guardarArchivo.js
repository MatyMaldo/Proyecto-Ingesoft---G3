/**
 * Dispara en el navegador la descarga de un archivo ya recibido (por ejemplo, la plantilla CSV del backend).
 *
 * @param {Blob} contenido
 * @param {string} nombre Nombre con el que se guarda el archivo.
 */
export function guardarArchivo(contenido, nombre) {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
