Edit ONLY the "Rendimiento académico" section for the user roles "Estudiante" and "Apoderado" in the existing Colegio San Marcos school management system.

IMPORTANT:
Do NOT modify any other user's screens or functionality.

Do NOT modify:
- Administrator screens
- Docente screens
- The Administrator's "Rendimiento académico" functionality, if it exists
- The Estudiante or Apoderado sidebars
- Other sections such as Mi horario, Cursos, Pagos or Libreta de notas
- Existing colors, typography, spacing, components, navigation or overall visual identity

The goal is to create a read-only view of student absence reports for Estudiante and Apoderado users.

Maintain exactly the same visual language and design system used in all previously created Colegio San Marcos screens.

--------------------------------------------------
1. ESTUDIANTE — RENDIMIENTO ACADÉMICO
--------------------------------------------------

For the "Estudiante" role, edit the existing:

"Rendimiento académico"

section.

Use the existing breadcrumb style:

Inicio › Rendimiento académico

Page title:

"Rendimiento académico"

Add a short description:

"Consulta los reportes de inasistencia registrados durante el año académico."

The page must display a list of the student's absence reports.

The authenticated student must ONLY see reports belonging to themselves.

Do not provide any selector for students, children, teachers, grades or sections.

--------------------------------------------------
2. LIST OF ABSENCE REPORTS
--------------------------------------------------

Display the student's reports in a clean table or list using the same component style already established in the application.

Each report should display relevant summary information such as:

- Fecha de emisión
- Profesor
- Alumno
- Grado
- Sección
- Número de faltas
- Acción

Example:

Fecha de emisión | Profesor | Alumno | Grado | Sección | Faltas | Acción

15/09/2026 | Prof. García | María López | 4to Secundaria | B | 3 | [Revisar reporte]

Each report must contain the button:

"Revisar reporte"

Use the existing secondary/primary action button style.

The list must be read-only.

--------------------------------------------------
3. APODERADO — RENDIMIENTO ACADÉMICO
--------------------------------------------------

For the "Apoderado" role, use the same "Rendimiento académico" section, but add a child selector.

At the top of the page, display:

"Seleccionar hijo"

Use the same select/dropdown component style already used in the Apoderado's "Mi horario" and "Pagos" sections.

The selector must contain ONLY the children associated with the authenticated Apoderado.

Example:

Seleccionar hijo

[ María López García ▼ ]

After selecting a child, display the absence reports belonging to that child.

The reports must update according to the selected child.

Do not allow the Apoderado to search for or select students who are not their children.

--------------------------------------------------
4. APODERADO — SELECTED CHILD
--------------------------------------------------

After selecting a child, clearly display the selected student's information.

Example:

Alumno seleccionado:

María López García
DNI: 74852136

Below this information, display the list of absence reports for that student.

If the Apoderado has multiple children, changing the selected child must replace the displayed reports with the reports corresponding to the newly selected child.

--------------------------------------------------
5. REVISAR REPORTE
--------------------------------------------------

When the user clicks:

"Revisar reporte"

open a modal or document-viewing panel using the same modal/document style already established in the application.

Title:

"Reporte de inasistencia"

The purpose of this view is to display the complete absence report.

Do not allow the Estudiante or Apoderado to edit the report.

--------------------------------------------------
6. REPORT INFORMATION
--------------------------------------------------

The report must display the following information clearly:

"Alumno"

Display:
- Student name
- Student surname
- DNI when appropriate

"Grado"

Display the student's academic grade.

"Sección"

Display the student's section.

"Fecha de emisión"

Display the date on which the report was issued.

"Profesor"

Display the teacher who issued the report.

"Faltas cometidas"

Display a list of the absences recorded in the report.

Each absence should contain at least the corresponding date and relevant information available for the report.

Example:

Faltas cometidas

- 05/09/2026 — Falta
- 08/09/2026 — Falta
- 12/09/2026 — Falta

"Comentarios del docente"

Display the comments written by the teacher who issued the report.

Example:

Comentarios del docente:

"El estudiante presentó inasistencias durante las últimas semanas del periodo académico."

--------------------------------------------------
7. REPORT DOCUMENT LAYOUT
--------------------------------------------------

The "Revisar reporte" view should visually resemble an official school report/document while still using the existing Colegio San Marcos design system.

Organize the information clearly:

REPORTE DE INASISTENCIA

Alumno:
María López García

Grado:
4to Secundaria

Sección:
B

Fecha de emisión:
15/09/2026

Profesor:
Prof. García

--------------------------------

FALTAS COMETIDAS

05/09/2026
08/09/2026
12/09/2026

--------------------------------

COMENTARIOS DEL DOCENTE

[Teacher comments]

Keep sufficient spacing between sections and use the existing typography hierarchy.

--------------------------------------------------
8. FALTAS COMETIDAS
--------------------------------------------------

The report must explicitly display the list of absences committed by the student.

Do not summarize the absences only as a number.

Show the individual absence records in a readable list or small table.

Example:

Fecha | Tipo

05/09/2026 | Falta
08/09/2026 | Falta
12/09/2026 | Falta

Use the existing table/list styling from the application.

--------------------------------------------------
9. COMMENTS
--------------------------------------------------

The teacher's comments must be displayed exactly as part of the report.

Use a visually distinct section:

"Comentarios del docente"

Display the comment inside the same card/document container.

The Estudiante and Apoderado must only be able to read these comments.

Do not provide an edit field.

--------------------------------------------------
10. READ-ONLY FUNCTIONALITY
--------------------------------------------------

Both Estudiante and Apoderado views are completely read-only.

They cannot:

- Create reports
- Edit reports
- Delete reports
- Modify absences
- Modify teacher comments
- Change report information
- Upload reports
- Approve reports
- Reject reports

The only available action in the report list should be:

"Revisar reporte"

--------------------------------------------------
11. EMPTY STATES
--------------------------------------------------

If an Estudiante has no absence reports, display:

"No hay reportes de inasistencia registrados."

If an Apoderado selects a child with no reports, display:

"No hay reportes de inasistencia registrados para este estudiante."

Use the existing empty-state design from the application.

--------------------------------------------------
12. APODERADO SIDEBAR
--------------------------------------------------

Keep the previously established Apoderado sidebar exactly as it is:

- Mi horario
- Pagos
- Cursos
- Rendimiento académico
- Libreta de notas

Highlight:

"Rendimiento académico"

as the active section.

DO NOT modify the Apoderado sidebar structure.

--------------------------------------------------
13. ESTUDIANTE SIDEBAR
--------------------------------------------------

Keep the previously established Estudiante sidebar exactly as it is:

- Mi horario
- Cursos
- Rendimiento académico
- Libreta de notas

Highlight:

"Rendimiento académico"

as the active section.

DO NOT modify the Estudiante sidebar structure.

--------------------------------------------------
14. VISUAL DESIGN
--------------------------------------------------

Maintain exactly the same Colegio San Marcos visual identity used in all previous screens.

Preserve:

- Institutional blue palette
- Light application background
- White cards
- Existing typography hierarchy
- Existing table styles
- Existing buttons
- Existing modal styles
- Existing dropdown/select styles
- Existing status badges
- Existing icons
- Existing border radius
- Existing shadows
- Existing 4px spacing system

Do not introduce a new visual language.

The new functionality must look as if "Rendimiento académico" has always been part of the existing application.

--------------------------------------------------
15. RESPONSIVE BEHAVIOR
--------------------------------------------------

Maintain the existing responsive behavior.

On smaller screens:

- Stack the child selector appropriately.
- Make the report list responsive.
- Convert wide tables into vertically stacked records when necessary.
- Ensure the "Revisar reporte" button remains accessible.
- Make the report modal/document fit within the viewport.
- Preserve readability of the absence list and teacher comments.
- Avoid unnecessary horizontal scrolling.

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------

- Edit ONLY "Rendimiento académico" for Estudiante and Apoderado.
- Do NOT modify Administrator screens.
- Do NOT modify Docente screens.
- Do NOT modify other sections of the application.
- Estudiante sees only their own absence reports.
- Apoderado sees only reports belonging to their selected child.
- Apoderado must have a child selector.
- The child selector must contain only the authenticated Apoderado's children.
- Each report must have "Revisar reporte".
- "Revisar reporte" must display the complete report.
- The report must include:
  - List of absences committed by the student
  - Date of issuance
  - Teacher who issued the report
  - Student
  - Grade
  - Section
  - Teacher comments
- Reports are strictly read-only.
- Do not add editing, deletion, validation or upload functionality.
- Maintain exactly the same visual style as the previously created Colegio San Marcos screens.