# HU-GEMAP-11 — Grados y secciones

Prototipo funcional de creación, modificación y consulta en Administración → Año escolar.
Solo está autorizado el rol ADMIN. No incluye eliminación, matrículas ni configuración
de años. Crear una sección requiere seleccionar un tutor.

## Revisión local

Desde la carpeta `frontend`:

```powershell
npm ci
npm run desarrollo
```

Abre `http://localhost:5173/iniciar-sesion`. Selecciona Administrador e ingresa
con `admin@sanmarcos.edu.pe` y `Admin2026!` (cuenta ficticia del mock existente).
En el menú Administración selecciona Año escolar.

Sin `.env`, los mocks se habilitan por defecto. Si existe `.env`, verifica
`VITE_USAR_MOCK=true`. No hace falta iniciar MySQL ni el backend para esta revisión.
Los registros creados se conservan durante la sesión del módulo y se restablecen
al recargar la página. No se envían solicitudes ni auditorías al backend.

## Recorrido de demostración

1. Consulta primero de secundaria en 2026: se muestran A y B y 60 cupos totales.
2. Selecciona tercero: aparece el listado vacío.
3. Crea una sección C con capacidad 30 y selecciona un tutor: aparece en el listado y se confirma el registro.
4. Intenta crear C de nuevo: aparece el error de duplicado y se conserva el formulario.
5. Prueba nombre vacío, capacidad 0, decimal y texto; deben mostrar errores.
6. Cancela: no se registra nada. Crea un grado nuevo: se actualiza el catálogo.
7. Selecciona 2025: se permite consultar y se bloquea crear sección.
8. Recarga: vuelve el conjunto inicial de demostración.

Compilación: `npm run construir`. Previsualización: `npm run previsualizar`.

## Integración pendiente

`PaginaAnioEscolar` es un contenedor provisional para la pantalla compartida
con Matías. `PanelGradosSecciones` mantiene aislada la funcionalidad de David.
Antes de integrar el selector global de año, acordar su interfaz y elevar la
selección al contenedor compartido; no duplicar la gestión de años.

`gradosSeccionesService.js` integra `GET /anios-academicos`, `GET/POST /grados`,
`GET/POST /secciones`, `PATCH /secciones/{id}` y
`GET /usuarios?tipoUsuario=DOCENTE&activo=true&page=0&size=100`.
En el desarrollo local, las llamadas usan el proxy Vite configurado para `/api/v1`.
Las respuestas aceptan el wrapper `{ data, mensaje }` del backend y `{ datos, error }`
usado por otros servicios del proyecto.

Un año con `fechaFin` nula se considera abierto; si `fechaFin` es hoy o una fecha
futura, permite crear secciones. Si es anterior a hoy, solo permite consultar.
La capacidad permitida por el frontend es un entero entre 1 y 65535. La API valida
también los duplicados de nombre sin distinguir mayúsculas y el uso duplicado de
tutor en el mismo año; esos errores se muestran al enviar el formulario.
La modificación solo permite cambiar nombre, capacidad y tutor; grado y año académico
se mantienen. El tutor puede dejarse sin asignar al modificar.

El contrato compartido indica que estos endpoints todavía son públicos (sin
autenticación). La ruta de interfaz sí está limitada al rol ADMIN; esa protección
visual no sustituye la autorización del backend cuando se implemente.
