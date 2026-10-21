Edit the existing "Pagos" section of the Colegio San Marcos school management system.

IMPORTANT:
Do not redesign the application. Maintain exactly the same visual language, layout, typography, spacing, colors, components, sidebar, top navigation, breadcrumbs, cards, buttons, tables, modals, and interaction patterns used in the previously created screens.

It will create a new student-oriented payment management view.

--------------------------------------------------
1. PAGOS — LISTA DE ALUMNOS
--------------------------------------------------

Create a new page with a page titled:

"Lista de alumnos"

Use the breadcrumb style:

Inicio › Pagos › Lista de alumnos

Under the title, add a short description:

"Gestiona los pagos y compromisos de matrícula de los estudiantes."

Display a list/table of students.

Each student row must contain:

- Nombre completo del alumno
- DNI or student identification number
- Three action buttons:

1. "Emitir compromiso de matrícula"
2. "Ver pagos realizados"
3. "Ver pagos pendientes"

Example:

María López García
DNI: 74852136

[Emitir compromiso de matrícula]
[Ver pagos realizados]
[Ver pagos pendientes]

Repeat the same structure for multiple students.

Use the existing table/list design system from the application, including white surfaces, subtle borders, appropriate row spacing, and the existing button styles.

The page should remain clean and easy to scan.

--------------------------------------------------
2. EMITIR COMPROMISO DE MATRÍCULA
--------------------------------------------------

When the user clicks:

"Emitir compromiso de matrícula"

open a modal using the same modal style already used in the system.

Modal title:

"Emitir compromiso de matrícula"

The modal must contain a field to enter/select the month for which the enrollment payment commitment will be issued.

Field label:

"Mes"

Use a dropdown/select control.

Example options:

- Enero
- Febrero
- Marzo
- Abril
- Mayo
- Junio
- Julio
- Agosto
- Septiembre
- Octubre
- Noviembre
- Diciembre

The selected student should be clearly identified at the top of the modal.

Example:

Alumno
María López García
DNI: 74852136

Then:

Mes
[ Septiembre ▼ ]

At the bottom:

[Cancelar] [Aceptar]

"Cancelar" closes the modal without making changes.

"Aceptar" confirms the operation.

The "Aceptar" button must remain disabled until a month has been selected.

After successful confirmation, close the modal and display a success notification:

"El compromiso de matrícula ha sido emitido correctamente."

--------------------------------------------------
3. VER PAGOS REALIZADOS
--------------------------------------------------

When the user clicks:

"Ver pagos realizados"

navigate to a NEW PAGE.

Do not open a modal.

Page title:

"Pagos realizados"

Use the existing breadcrumb pattern:

Inicio › Pagos › Lista de alumnos › Pagos realizados

Clearly display the selected student's information near the top:

María López García
DNI: 74852136

Below the student information, display a list/table containing all payments that have already been made by that student.

Include relevant payment information such as:

- Fecha
- Concepto
- Monto
- Método de pago
- Estado

Example:

Fecha | Concepto | Monto | Método de pago | Estado

15/08/2025 | Matrícula | S/ 350.00 | Transferencia | Pagado
10/08/2025 | Pensión - Agosto | S/ 300.00 | Tarjeta | Pagado
10/07/2025 | Pensión - Julio | S/ 300.00 | Transferencia | Pagado

Use the existing table and status badge styles.

All completed payments should clearly communicate their "Pagado" state using the application's existing success styling.

Add a "Volver" action to return to the student list.

--------------------------------------------------
4. VER PAGOS PENDIENTES
--------------------------------------------------

When the user clicks:

"Ver pagos pendientes"

navigate to a NEW PAGE.

Do not open a modal.

Page title:

"Pagos pendientes"

Use the breadcrumb:

Inicio › Pagos › Lista de alumnos › Pagos pendientes

Display the selected student's information:

María López García
DNI: 74852136

Below it, display a table containing all pending payments for that student.

Include:

- Fecha límite
- Concepto
- Monto
- Estado
- Acción

Example:

Fecha límite | Concepto | Monto | Estado | Acción

10/09/2025 | Pensión - Septiembre | S/ 300.00 | Pendiente | [Revisar pago]
10/10/2025 | Pensión - Octubre | S/ 300.00 | Pendiente | [Revisar pago]
10/11/2025 | Pensión - Noviembre | S/ 300.00 | Pendiente | [Revisar pago]

Each pending payment must have a button:

"Revisar pago"

Use the existing warning/pending visual treatment for pending payments.

Add a "Volver" action to return to the student list.

--------------------------------------------------
5. REVISAR PAGO
--------------------------------------------------

When the user clicks:

"Revisar pago"

open a modal.

Modal title:

"Revisar pago"

The modal must display the details of the selected payment.

Include:

Concepto
Monto
Fecha límite
Estado actual

Example:

Concepto:
Pensión - Septiembre

Monto:
S/ 300.00

Fecha límite:
10/09/2025

Estado:
Pendiente

--------------------------------------------------
6. COMPROBANTE DE PAGO
--------------------------------------------------

Inside the same "Revisar pago" modal, include a section:

"Comprobante"

Display the uploaded payment receipt/document.

Show a file/document representation with:

- File icon
- File name
- File size
- Button to view the receipt

Example:

Comprobante_pago.pdf
400 KB

[Ver]

The receipt should be visually separated from the payment information using the existing card/container styling.

--------------------------------------------------
7. VALIDAR O RECHAZAR EL PAGO
--------------------------------------------------

At the bottom of the "Revisar pago" modal, display two actions:

[Validar pago]    [Rechazar pago]

"Validar pago" should use the application's primary/success action styling.

"Rechazar pago" should use the application's danger/error styling.

--------------------------------------------------
8. RECHAZAR PAGO — MOTIVO
--------------------------------------------------

When the user clicks:

"Rechazar pago"

DO NOT immediately reject the payment.

Instead, dynamically display a form section BELOW the payment receipt.

The new section should be titled:

"Motivo del rechazo"

Include a multiline textarea.

Placeholder:

"Ingrese el motivo del rechazo..."

Example:

Motivo del rechazo
┌──────────────────────────────────────┐
│ El comprobante no permite verificar  │
│ correctamente el monto depositado.  │
└──────────────────────────────────────┘

After the rejection form appears, provide actions:

[Cancelar] [Rechazar pago]

The final "Rechazar pago" button must remain disabled until a rejection reason has been entered.

The rejection reason must be clearly associated with the selected payment.

--------------------------------------------------
9. PAYMENT REVIEW STATES
--------------------------------------------------

The "Revisar pago" modal must support the following interaction states:

Initial state:

- Payment information visible
- Receipt visible
- "Validar pago" button visible
- "Rechazar pago" button visible
- Rejection reason form hidden

After clicking "Rechazar pago":

- Display "Motivo del rechazo"
- Display textarea
- Keep the payment information and receipt visible
- Display confirmation actions below the rejection reason

Do not remove the receipt when the rejection form appears.

--------------------------------------------------
10. SUCCESS AND REJECTION FEEDBACK
--------------------------------------------------

After validating a payment:

Close the modal and display:

"El pago ha sido validado correctamente."

After rejecting a payment:

Close the modal and display:

"El pago ha sido rechazado correctamente."

The pending payment list should reflect the updated state after the operation.

--------------------------------------------------
11. VISUAL DESIGN
--------------------------------------------------

Maintain the existing Colegio San Marcos design system.

Use:

Primary Deep Blue:
#00236f

Secondary Blue:
#0058be

Application background:
#f8f9ff

Cards / surfaces:
#ffffff

Main text:
#121c2a

Success:
#16a34a

Warning:
#d97706

Danger:
#ba1a1a

Maintain the existing typography hierarchy:

Headline LG:
24px / 32px / Bold

Headline MD:
18px / 24px / Semi Bold

Headline SM:
16px / 24px / Regular

Body MD:
14px / 20px / Regular

Label SM:
12px / 16px / Medium

Label XS:
11px / 16px / Medium / Uppercase

Maintain the existing 4px spacing system.

--------------------------------------------------
12. NAVIGATION
--------------------------------------------------

Keep the existing sidebar exactly as previously designed.

The "Pagos" item should remain under:

GESTIÓN

Navigation:

PRINCIPAL
- Inicio

GESTIÓN
- Usuarios
- Matrícula
- Cursos
- Pagos
- Horarios

ADMINISTRACIÓN
- Auditorías
- Log de errores

Highlight "Pagos" as the active section when the user is in:

- Lista de alumnos
- Pagos realizados
- Pagos pendientes

--------------------------------------------------
13. RESPONSIVE DESIGN
--------------------------------------------------

Maintain the existing responsive behavior.

On smaller screens:

- Stack action buttons when necessary.
- Make student actions accessible without horizontal overflow.
- Make payment tables responsive.
- Allow tables to transform into cards or vertically stacked records when appropriate.
- Ensure modals fit within the viewport.
- Keep all buttons accessible and readable.

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------

- Do not show a generic payment history as the initial page.
- The initial payment page must be organized by students.
- Each student must have exactly these three main actions:
  "Emitir compromiso de matrícula"
  "Ver pagos realizados"
  "Ver pagos pendientes"
- "Ver pagos realizados" must navigate to a separate page.
- "Ver pagos pendientes" must navigate to a separate page.
- "Revisar pago" must open a modal.
- The rejection reason must only appear after clicking "Rechazar pago".
- The rejection reason must appear below the receipt.
- Do not immediately reject a payment without requesting a reason.
- Do not add unrelated payment fields or functionality.
- Do not modify the visual identity of the existing application.
- Reuse the existing components and patterns from the previous screens.
- The final result must look as if this payment workflow has always been part of the Colegio San Marcos system.