Edit ONLY the "Pagos" section for the "Apoderado" user role in the existing Colegio San Marcos school management system.

IMPORTANT:
Do NOT modify any other user's screens or functionality.

Do NOT modify:
- Administrator screens
- Docente screens
- Estudiante screens
- The Administrator's payment management interface
- Existing sidebars for other roles
- Existing layouts, colors, typography, components or navigation outside the Apoderado "Pagos" section

The goal is to create a payment view specifically for the authenticated Apoderado, allowing them to review payments made by their children and register evidence for pending payments.

Maintain exactly the same visual language and design system used in all previously created Colegio San Marcos screens.

--------------------------------------------------
1. APODERADO — PAGOS
--------------------------------------------------

For the "Apoderado" role, edit the existing "Pagos" section.

The page title must be:

"Pagos"

Use the existing breadcrumb style:

Inicio › Pagos

The page should allow the Apoderado to view the payment information of their children.

If the Apoderado has multiple children, organize the payment information clearly by child.

Use the existing cards, tables, typography, spacing and status badges from the application.

--------------------------------------------------
2. CHILDREN / STUDENT IDENTIFICATION
--------------------------------------------------

For each child's payment information, clearly display:

- Nombre
- Apellido
- DNI

Example:

María López García
DNI: 74852136

The payment information shown must belong only to the authenticated Apoderado's children.

Do not allow the Apoderado to search for or access students who are not their children.

--------------------------------------------------
3. PAYMENTS LIST
--------------------------------------------------

For each child, display two clearly distinguishable payment categories:

"Pagos realizados"

"Pagos pendientes"

Use the existing table/list components from the application.

The information displayed for payments should include relevant data such as:

- Concepto
- Fecha
- Monto
- Estado

For completed payments, use the existing successful/completed status styling.

Example:

PAGOS REALIZADOS

Concepto          Fecha          Monto        Estado
Matrícula         15/03/2026     S/ 350.00    Pagado
Pensión Marzo     10/03/2026     S/ 300.00    Pagado

--------------------------------------------------
4. PAGOS PENDIENTES
--------------------------------------------------

Below or alongside the completed payments, display the pending payments for the selected child.

Include:

- Concepto
- Fecha límite
- Monto
- Estado
- Acción

Example:

PAGOS PENDIENTES

Concepto          Fecha límite    Monto        Estado       Acción
Pensión Abril     10/04/2026      S/ 300.00    Pendiente    [Registrar pago]
Pensión Mayo      10/05/2026      S/ 300.00    Pendiente    [Registrar pago]

For every pending payment, display the button:

"Registrar pago"

Use the existing primary action/button style from the application.

--------------------------------------------------
5. REGISTRAR PAGO
--------------------------------------------------

When the Apoderado clicks:

"Registrar pago"

open a modal or dedicated form using the same form/modal design language used throughout the existing system.

Modal title:

"Registrar pago"

The form must correspond to the selected pending payment and the selected child.

--------------------------------------------------
6. PRE-FILLED STUDENT INFORMATION
--------------------------------------------------

At the top of the "Registrar pago" form, display the child's information.

The following fields must already be completed automatically:

"Nombre"

"Apellido"

"DNI"

These fields should be read-only because the Apoderado should not modify the child's identity information.

Example:

Nombre
[ María ]

Apellido
[ López ]

DNI
[ 74852136 ]

Use the same read-only input styling already used in the application.

--------------------------------------------------
7. PRE-FILLED PAYMENT DATE
--------------------------------------------------

The payment date must also be automatically completed.

Field:

"Fecha de pago"

The date should be populated automatically with the current payment date.

The field should be read-only.

Example:

Fecha de pago
[ 19/09/2026 ]

Do not require the Apoderado to manually enter the date.

--------------------------------------------------
8. SELECTED PAYMENT INFORMATION
--------------------------------------------------

Clearly identify which pending payment is being registered.

Display information such as:

Concepto:
Pensión - Abril

Monto:
S/ 300.00

Estado:
Pendiente

This information should be displayed as contextual information and should not be editable by the Apoderado.

--------------------------------------------------
9. PAYMENT EVIDENCE
--------------------------------------------------

Add a required file-upload field:

"Comprobante de pago"

Description:

"Adjunte un archivo PDF como evidencia del pago."

The Apoderado must be able to select and upload a PDF file containing the payment evidence.

Use the existing file-upload component style from the application.

The upload area should clearly communicate:

- PDF files only
- Evidence of payment is required

Example:

Comprobante de pago

[ Adjuntar PDF ]

After selecting the file, display:

- File name
- File size
- PDF/file icon
- Option to remove or replace the selected file

Example:

📄 comprobante_pago_abril.pdf
350 KB

[Eliminar]

Only PDF files should be accepted.

--------------------------------------------------
10. FORM ACTIONS
--------------------------------------------------

At the bottom of the "Registrar pago" form, display:

[Cancelar] [Registrar pago]

"Cancelar":

- Closes the form.
- Does not register the payment.
- Does not change the pending payment.

"Registrar pago":

- Remains disabled until a valid PDF evidence file has been attached.
- Submits the payment evidence.
- Associates the evidence with the selected pending payment.

--------------------------------------------------
11. AFTER REGISTERING PAYMENT
--------------------------------------------------

After successful submission:

Close the form/modal.

Display a success notification:

"El comprobante de pago ha sido registrado correctamente."

The payment should no longer appear as simply "Pendiente" without evidence.

Instead, update its state to something appropriate such as:

"En revisión"

Use the existing neutral/information status style for this intermediate state.

IMPORTANT:

The Apoderado does NOT validate the payment.

The Apoderado only registers the payment and submits the evidence.

Validation of the payment must remain an administrative process and must not be added to the Apoderado interface.

--------------------------------------------------
12. PAYMENT STATUS
--------------------------------------------------

Use the following conceptual states:

Pagado
→ Payment has been validated.

Pendiente
→ Payment has not yet been registered.

En revisión
→ The Apoderado has submitted payment evidence and it is awaiting validation.

Do not give the Apoderado controls to manually change these states.

--------------------------------------------------
13. MULTIPLE CHILDREN
--------------------------------------------------

If the authenticated Apoderado has multiple children, make it easy to distinguish each child's payments.

Use the existing design patterns for cards or sections.

Example:

María López García
DNI: 74852136

Pagos realizados
...

Pagos pendientes
...


Carlos López García
DNI: 70482135

Pagos realizados
...

Pagos pendientes
...

The Apoderado must only see payment information belonging to their own children.

--------------------------------------------------
14. SIDEBAR
--------------------------------------------------

Keep the previously established Apoderado sidebar.

The navigation must remain:

- Mi horario
- Pagos
- Cursos
- Rendimiento académico
- Libreta de notas

"Pagos" must be highlighted as the active section.

Do not modify the sidebar for:

- Administrador
- Docente
- Estudiante

--------------------------------------------------
15. VISUAL DESIGN
--------------------------------------------------

Maintain exactly the same Colegio San Marcos visual identity used in the previous screens.

Preserve:

- Institutional blue palette
- Light application background
- White cards
- Existing typography
- Existing button styles
- Existing input styles
- Existing modal styles
- Existing table styles
- Existing status badges
- Existing iconography
- Existing border radius
- Existing shadows
- Existing 4px spacing system

Do not introduce a new design language.

The new payment-registration functionality must look as if it has always been part of the existing application.

--------------------------------------------------
16. RESPONSIVE BEHAVIOR
--------------------------------------------------

Maintain the existing responsive behavior.

On smaller screens:

- Stack payment information vertically.
- Make payment tables responsive.
- Stack action buttons when necessary.
- Ensure the "Registrar pago" button remains accessible.
- Make the upload component fit the available width.
- Keep the registration modal/form within the viewport.
- Do not introduce unnecessary horizontal scrolling.

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------

- Edit ONLY the Apoderado's "Pagos" section.
- Do NOT modify payment screens for other roles.
- Do NOT modify Administrator functionality.
- Do NOT modify Docente functionality.
- Do NOT modify Estudiante functionality.
- Show payments only for the authenticated Apoderado's children.
- Display both completed and pending payments.
- Every pending payment must have "Registrar pago".
- The registration form must automatically display the child's Nombre, Apellido and DNI.
- The payment date must be automatically populated.
- Student information and payment information must be read-only.
- A PDF payment evidence file is required.
- Only PDF files should be accepted.
- The Apoderado cannot validate or reject payments.
- After submission, the payment should have an "En revisión" state until validated.
- Maintain the exact visual style of the existing Colegio San Marcos system.