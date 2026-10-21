Edit the existing "Horarios" section of the Colegio San Marcos school management system.

IMPORTANT:
This section must be available ONLY to the "Administrador" user.

Do not redesign the application. Maintain exactly the same visual language, layout, typography, colors, spacing, components, icons, buttons, tables, modals, sidebar and top navigation used in the previously created screens.

The result must look like a natural extension of the existing Colegio San Marcos system.

--------------------------------------------------
1. HORARIOS — ADMINISTRADOR
--------------------------------------------------

The "Horarios" section is an administrative schedule-management interface.

Keep the existing page structure, including:

- Breadcrumbs
- Page title
- Academic year
- Grade and section selectors when applicable
- Schedule matrix
- Recess blocks
- Existing conflict visualization
- Existing sidebar and top navigation

Only the Administrator should have access to the schedule editing functionality.

--------------------------------------------------
2. SCHEDULE MATRIX BY INDIVIDUAL HOUR
--------------------------------------------------

Modify the existing schedule matrix so that each row represents an individual time rather than a large time range.

Instead of displaying blocks such as:

08:00 → 09:30

09:30 → 11:00

display individual hourly rows.

For example:

08:00
09:00
10:00
11:00
12:00
13:00

Adapt the schedule blocks to fit the hourly grid while preserving the existing Monday-to-Friday column structure.

The exact time labels should remain visually clear and aligned with each row.

Do not remove the existing recess periods.

--------------------------------------------------
3. RECESS / BREAK PERIODS
--------------------------------------------------

Keep the existing recess/break functionality and visual treatment.

The recess row should remain clearly differentiated from regular class periods.

For example:

11:00
──────────────
RECREO / DESCANSO
──────────────
11:30

Maintain the existing visual style used for the "RECREO / DESCANSO" row.

--------------------------------------------------
4. EMPTY SCHEDULE BLOCKS
--------------------------------------------------

In every empty schedule block, keep the "+ asignar" action.

However, make the "+ asignar" text significantly more visible than in the current design.

Use a stronger color/contrast while maintaining the existing design system.

The action should clearly communicate that the empty block is clickable.

For example:

+ Asignar

Use:
- stronger text contrast
- slightly more prominent typography
- clear hover state
- pointer/click affordance

Do not make it visually overwhelming.

--------------------------------------------------
5. VIEW MODE BUTTONS
--------------------------------------------------

Replace the existing button:

"Ver por aula"

with:

"Ver por sección"

Also replace:

"Solo conflictos"

with:

"Ver horario"

The controls should now be:

[Ver por sección] [Ver por docente] [Ver horario]

"Ver por sección" and "Ver por docente" are BOOLEAN / TOGGLE controls.

Only one of these two modes can be selected at a time.

--------------------------------------------------
6. VIEW BY SECTION MODE
--------------------------------------------------

When:

"Ver por sección"

is selected:

Keep the existing selectors:

"Grado"

"Sección"

Example:

Grado:
[4to Secundaria ▼]

Sección:
[B ▼]

The Administrator can select the desired grade and section.

The schedule should NOT change immediately when the selectors are modified.

The Administrator must click:

"Ver horario"

to load the schedule.

After clicking "Ver horario":

Display the schedule matrix corresponding to the selected:

Grade + Section

Example:

Matriz de Horarios — 4to Grado B

The matrix must display the courses, teachers and classrooms assigned to that section.

--------------------------------------------------
7. VIEW BY TEACHER MODE
--------------------------------------------------

When:

"Ver por docente"

is selected:

Replace the "Grado" and "Sección" selectors with a teacher search field.

Display:

"Buscar docente"

Placeholder:

"Buscar docente por nombre o DNI..."

The Administrator can search teachers by:

- Name
- DNI

Display matching teachers in a selectable search result.

After selecting a teacher, display the selected teacher clearly.

Example:

Docente seleccionado:

Prof. García
DNI: 74852136

The schedule should NOT load immediately after selecting the teacher.

The Administrator must click:

"Ver horario"

After clicking "Ver horario":

Display the schedule matrix corresponding to that teacher.

The page title should dynamically reflect the selected teacher when appropriate.

Example:

"Matriz de Horarios — Prof. García"

--------------------------------------------------
8. VIEW MODE BEHAVIOR
--------------------------------------------------

The two controls:

"Ver por sección"
"Ver por docente"

must behave as mutually exclusive boolean toggles.

State example:

[✓ Ver por sección] [Ver por docente]

or:

[Ver por sección] [✓ Ver por docente]

Only one mode can be active at a time.

When switching from one mode to another:

- Reset the previous mode's search/selection controls as appropriate.
- Replace the selectors/search field accordingly.
- Keep the existing schedule matrix structure.
- Require clicking "Ver horario" to load the selected schedule.

--------------------------------------------------
9. ASSIGN A NEW SCHEDULE BLOCK
--------------------------------------------------

When the Administrator clicks an empty:

"+ Asignar"

block:

Open a modal/form using the existing form and modal design language.

Modal title:

"Asignar horario"

The form must contain:

1. Docente

Label:

"Docente"

Provide a search field:

"Buscar docente por nombre o DNI..."

Allow the Administrator to search and select a teacher.

2. Aula

Label:

"Aula"

Provide a dropdown/select containing available classrooms.

Example:

- Aula 201
- Aula 202
- Aula 203
- Aula 204
- Lab. Cien
- Lab. Idiom
- Gimnasio
- Taller A

3. Curso

Label:

"Curso"

Provide a dropdown/select containing the courses available for the selected section.

Example:

- Matemáticas
- Comunicación
- Inglés
- Arte
- Educación Física
- Historia
- Química
- Física Clásica

The selected day and hour should be inherited automatically from the schedule block that was clicked.

Do not require the Administrator to manually select the day/time again.

At the bottom of the modal:

[Cancelar] [Guardar cambios]

--------------------------------------------------
10. SAVE SCHEDULE BLOCK
--------------------------------------------------

When the Administrator clicks:

"Guardar cambios"

validate the selected:

- Docente
- Aula
- Curso

If valid, create the schedule block.

The newly created block must immediately appear in the schedule matrix.

The block must be displayed according to the current viewing mode.

If the current mode is:

"Ver por sección"

show the block in the selected section's schedule.

If the current mode is:

"Ver por docente"

show the block in the selected teacher's schedule.

Maintain the existing block design:

Course name
Classroom
Teacher

Example:

Matemáticas

Aula 201
Prof. García

--------------------------------------------------
11. DELETE A SCHEDULE BLOCK
--------------------------------------------------

When the Administrator clicks an existing schedule block:

Do NOT delete it immediately.

Open a confirmation modal.

Title:

"Eliminar horario"

Message:

"¿Está seguro de que desea eliminar este bloque de horario?"

Display enough information to identify the selected block.

Example:

Curso:
Matemáticas

Aula:
Aula 201

Docente:
Prof. García

Buttons:

[Cancelar] [Eliminar]

"Cancelar" closes the modal without changes.

"Eliminar" removes the schedule block.

Use the existing danger/error button style for "Eliminar".

--------------------------------------------------
12. SCHEDULE CONFLICTS
--------------------------------------------------

Maintain the existing conflict visualization.

A conflict occurs when the selected teacher and/or classroom are already assigned to another schedule block at the same time.

If there is a conflict between the teacher and classroom, the schedule block must use a visual format similar to the existing "Física Clásica" conflict block.

The conflict block should clearly communicate:

- There is a scheduling conflict.
- Which resource is involved in the conflict.

Maintain the existing red/error visual treatment already present in the application.

Example:

Física Clásica

⚠ Conflicto de aula
Aula 201

Prof. Delgado

Do not remove the regular course, classroom or teacher information.

The conflict must be visually distinguishable from normal schedule blocks.

--------------------------------------------------
13. INITIAL SCHEDULE STATE
--------------------------------------------------

When the Horarios page is initially opened:

Display only some schedule blocks.

The initial schedule must contain:

- Several assigned classes.
- Multiple empty schedule blocks with "+ Asignar".
- Existing recess periods.
- NO scheduling conflicts initially.

The initial state should look realistic and partially populated, allowing the Administrator to test the assignment functionality.

Do not display a conflict until an actual conflicting assignment is created or represented through the intended interaction.

--------------------------------------------------
14. ATTACH FILE
--------------------------------------------------

Below the schedule matrix, add a button:

"Adjuntar archivo"

Use the existing button style.

This functionality is intended to allow the Administrator to upload multiple schedule blocks simultaneously for a section.

Accepted file formats:

- CSV
- XLSX

When the Administrator clicks:

"Adjuntar archivo"

open the existing file-upload component/modal style.

The modal should include:

Title:

"Adjuntar horarios"

Description:

"Adjunte un archivo CSV o XLSX para registrar varios bloques de horario para una sección."

File selector:

[Seleccionar archivo]

Accepted formats:

CSV, XLSX

The Administrator should be able to select one file.

After selecting the file, display:

- File name
- File type
- File size

Buttons:

[Cancelar] [Cargar horarios]

The "Cargar horarios" button should only become active after a valid CSV or XLSX file has been selected.

The uploaded file represents multiple schedule blocks for the selected section.

The design should communicate that this operation is intended for bulk schedule assignment.

Do not add unnecessary file-upload fields.

--------------------------------------------------
15. FILE UPLOAD CONTEXT
--------------------------------------------------

The bulk schedule upload must be associated with a section.

When "Ver por sección" is active, the currently selected:

Grado
+
Sección

should be used as the target for the uploaded schedule file.

The interface should clearly communicate the selected destination.

Example:

Se cargarán horarios para:

4to Secundaria — Sección B

Do not show the file-upload functionality as a teacher-specific bulk upload.

--------------------------------------------------
16. VISUAL DESIGN
--------------------------------------------------

Maintain the existing Colegio San Marcos design system.

Use the same visual language already present in the Horarios screen.

Maintain:

- Deep institutional blue
- Light application background
- White cards
- Existing blue schedule blocks
- Existing red conflict blocks
- Existing typography
- Existing border radius
- Existing shadows
- Existing iconography
- Existing button styles
- Existing form controls
- Existing modal design

Do not introduce a new color palette.

Maintain the existing spacing system based on 4px.

--------------------------------------------------
17. RESPONSIVE BEHAVIOR
--------------------------------------------------

Maintain the existing responsive behavior.

On smaller screens:

- Keep the schedule matrix usable.
- Preserve the relationship between time rows and weekday columns.
- Allow the matrix to scroll horizontally only when necessary.
- Stack the section/teacher controls appropriately.
- Keep modals within the viewport.
- Keep the file-upload interface accessible.

Do not redesign the schedule matrix into an unrelated mobile layout.

--------------------------------------------------
18. SIDEBAR AND ACCESS
--------------------------------------------------

Keep the existing sidebar unchanged.

The navigation remains:

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

Highlight "Horarios" as the active section.

This schedule-management functionality must be available only to the Administrator.

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------

- Only the Administrator can access this schedule-management interface.
- Keep the existing visual style of the Colegio San Marcos system.
- Divide the schedule matrix by individual hours instead of large time ranges.
- Keep recess periods.
- Make "+ Asignar" more visible in empty blocks.
- Replace "Ver por aula" with "Ver por sección".
- Replace "Solo conflictos" with "Ver horario".
- "Ver por sección" and "Ver por docente" must function as mutually exclusive boolean toggles.
- In section mode, keep the Grade and Section selectors.
- In teacher mode, replace those selectors with a teacher search by name or DNI.
- The schedule is loaded only after clicking "Ver horario".
- Clicking "+ Asignar" opens the schedule assignment form.
- The assignment form must contain a teacher search, classroom selector and course selector.
- The day and hour must be inherited from the clicked empty schedule block.
- "Guardar cambios" creates the schedule block.
- Clicking an existing schedule block opens a deletion confirmation.
- Maintain conflict visualization similar to the existing "Física Clásica" block.
- Initially display some schedule blocks without conflicts.
- Keep recess blocks.
- Add "Adjuntar archivo" below the matrix.
- The attachment functionality must accept CSV and XLSX files.
- Bulk uploads must be associated with the currently selected section.
- Do not modify unrelated sections of the application.
- Do not introduce additional functionality that was not requested.
- Make the final interface look as if all these features were part of the original Colegio San Marcos system.