# HU-GEMAP-11 — Grados y secciones

Prototipo funcional de creación y consulta en Administración → Año escolar.
Solo está autorizado el rol ADMIN. No incluye edición, eliminación, tutores,
matrículas ni configuración de años.

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
3. Crea una sección C con capacidad 30: aparece en el listado y se confirma el registro.
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

`gradosSeccionesService.js` es el límite de integración. No se han inventado
endpoints. Con mocks deshabilitados devuelve un aviso de contrato no disponible.
Los nombres camelCase del mock son provisionales y no representan DTO confirmados.

Reglas provisionales: finalizado significa fecha local posterior a `fechaFin`;
se permite crear en años iniciados; capacidad 1–65535 por SMALLINT UNSIGNED.
Confirmar esas reglas con el equipo y aplicar también las validaciones en backend.
Los ejemplos con capacidad 25/30 no constituyen un máximo escolar acordado.
La normalización de duplicados ignora mayúsculas y tildes como aproximación a
la colación SQL; la unicidad definitiva depende del backend y la base de datos.

El backend deberá autorizar ADMIN y generar exactamente una auditoría por
creación; el frontend no crea registros de auditoría adicionales.
