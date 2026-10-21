Edit the existing "Matrículas" section of the Colegio San Marcos school management system.

IMPORTANT:
Maintain exactly the same visual identity and design language used in the existing screens and previously provided GUI specification.

Do not redesign the application. The new functionality must look like a native part of the existing system.

Preserve:
- The existing fixed left sidebar.
- The existing top navigation bar.
- The existing breadcrumb style.
- The existing typography hierarchy.
- The existing spacing system.
- The existing cards, inputs, dropdowns, buttons, icons, borders, shadows, and modal styles.
- The institutional color palette.
- The overall clean, modern and professional appearance.

--------------------------------------------------
MATRÍCULAS PAGE
--------------------------------------------------

--------------------------------------------------
MATRÍCULAS - LISTA DE ALUMNOS
--------------------------------------------------

Create a new page with a page titled:

"Lista de alumnos"

Use the breadcrumb style:

Inicio › Matrículas › Lista de alumnos

Under the title, add a short description:

"Muestra una lista con los últimos alumnos matriculados."

Display a list/table of 5 students.

Each student row must contain:

- Nombre completo del alumno
- Grado
- Sección
- Fecha

Example:

María López García
Grado: 1° Secundaria
Seccion: A
Fecha: 19-09-2026

Repeat the same structure for the rest of students.

Use the existing table/list design system from the application, including white surfaces, subtle borders, appropriate row spacing, and the existing button styles.

The page should remain clean and easy to scan.

--------------------------------------------------
MATRÍCULAS - BOTONES
--------------------------------------------------

In the existing "Matrículas" section, add two prominent action buttons near the top of the main content area.

The buttons must be:

1. "Asignar alumno a sección"
2. "Emitir compromiso de pago de matrícula"

Use the existing primary/secondary button styles from the application.

Suggested layout:

Matrícula

[ Asignar alumno a sección ]    [ Emitir compromiso de pago de matrícula ]

The buttons should be clearly visible but should not dominate the page.

--------------------------------------------------
BUTTON 1: ASIGNAR ALUMNO A SECCIÓN
--------------------------------------------------

When the user clicks:

"Asignar alumno a sección"

open a modal dialog or dedicated form panel using the same modal/form design language already present in the application.

Modal title:

"Asignar alumno a sección"

Include the following fields:

1. Search for student/user

Label:
"Buscar alumno"

Provide a search input where the administrator can search for a registered student/user.

Placeholder:
"Buscar por nombre, DNI o código..."

The search should display matching users in a clean dropdown/list so the administrator can select one.

Once a student is selected, clearly display the selected student.

Example:

Alumno seleccionado
María López García
DNI: 74852136

2. Academic grade selector

Label:
"Grado académico"

Provide a dropdown/select control.

Example options:

- 1ro Secundaria
- 2do Secundaria
- 3ro Secundaria
- 4to Secundaria
- 5to Secundaria

After selecting the academic grade, allow the administrator to select the corresponding section.

Label:

"Sección"

Example:

[ A ▼ ]

Available sections should depend on the selected grade.

The form should therefore follow this hierarchy:

Buscar alumno
      ↓
Seleccionar alumno
      ↓
Grado académico
      ↓
Sección

At the bottom of the modal, include two buttons:

[ Cancelar ]    [ Aceptar ]

"Cancelar" closes the modal without making changes.

"Aceptar" confirms the assignment.

Do not allow the operation to be confirmed if the required student, academic grade, or section has not been selected.

Display clear validation messages using the existing error/validation style.

Example:

"Seleccione un alumno."

"Seleccione un grado académico."

"Seleccione una sección."

--------------------------------------------------
BUTTON 2: EMITIR COMPROMISO DE PAGO DE MATRÍCULA
--------------------------------------------------

When the user clicks:

"Emitir compromiso de pago de matrícula"

open a modal dialog or dedicated form panel using the same visual style as the previous modal.

Modal title:

"Emitir compromiso de pago de matrícula"

The main purpose of this form is to search and select a registered student/user.

Include:

Label:
"Buscar alumno"

Search input placeholder:

"Buscar por nombre, DNI o código..."

Display matching users in a selectable list.

After selecting a student, clearly display the selected user.

Example:

Alumno seleccionado
Carlos Ramírez Soto
DNI: 70482135

At the bottom of the form, include:

[ Cancelar ]    [ Aceptar ]

"Cancelar" closes the form without generating anything.

"Aceptar" confirms the selected student and emits the enrollment payment commitment.

Do not add unnecessary fields to this form.

The second form should be intentionally simpler than "Asignar alumno a sección".

--------------------------------------------------
VISUAL STYLE
--------------------------------------------------

Use the existing Colegio San Marcos design system.

Colors:

- Primary Deep Blue: #00236f
- Secondary Blue: #0058be
- Application background: #f8f9ff
- Surface/cards: #ffffff
- Main text: #121c2a
- Success: #16a34a
- Warning: #d97706
- Danger: #ba1a1a

Typography:

- Headline LG: 24px / 32px / Bold
- Headline MD: 18px / 24px / Semi Bold
- Headline SM: 16px / 24px / Regular
- Body MD: 14px / 20px / Regular
- Label SM: 12px / 16px / Medium
- Label XS: 11px / 16px / Medium / Uppercase

Maintain the existing 4px spacing scale.

Use the same input fields, dropdowns, buttons, modal borders, corner radius, shadows and iconography already used elsewhere in the application.

--------------------------------------------------
INTERACTION STATES
--------------------------------------------------

The forms should include appropriate states:

- Default
- Focus
- Hover
- Disabled
- Validation error
- Selected student

The "Aceptar" button should be disabled until the minimum required information has been selected.

For "Asignar alumno a sección":

Required:
- Alumno
- Grado académico
- Sección

For "Emitir compromiso de pago de matrícula":

Required:
- Alumno

--------------------------------------------------
SUCCESS FEEDBACK
--------------------------------------------------

After a successful operation, close the modal and show a success notification using the existing system alert/toast style.

For section assignment:

"El alumno ha sido asignado correctamente a la sección."

For payment commitment:

"El compromiso de pago de matrícula ha sido emitido correctamente."

Do not expose technical information to the user.

--------------------------------------------------
RESPONSIVE DESIGN
--------------------------------------------------

Maintain the existing responsive behavior of the application.

On smaller screens:
- Stack the two action buttons vertically when necessary.
- Make the modal fit within the available screen width.
- Keep inputs and buttons easily accessible.
- Avoid horizontal scrolling.

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------

- Do not modify the existing sidebar structure.
- Do not modify the existing Horarios, Auditorías, Log de errores, or Cursos sections.
- Do not introduce unrelated functionality.
- Do not add IP, Nivel, or Estado fields.
- Reuse existing components and visual patterns wherever possible.
- Keep "Asignar alumno a sección" and "Emitir compromiso de pago de matrícula" as two clearly separate actions.
- The final result should look as if these two functions were part of the original Colegio San Marcos application from the beginning.