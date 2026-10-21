Edit the existing "Horarios" / "Mi horario" functionality of the Colegio San Marcos school management system for the user roles "Docente", "Estudiante" and "Apoderado".

IMPORTANT:
ONLY modify the schedule screens and behavior for:
- Docente
- Estudiante
- Apoderado

DO NOT modify the Administrator schedule screen in any way.

The Administrator's current schedule-management interface must remain exactly as it is, including:
- Schedule assignment
- "+ Asignar" buttons
- Schedule deletion
- Conflict visualization
- Grade and section selectors
- Teacher search
- "Ver por sección"
- "Ver por docente"
- "Ver horario"
- CSV/XLSX attachment
- Bulk schedule upload
- All existing administrator functionality

The following changes apply ONLY to the other three roles.

Maintain exactly the same visual language, layout, typography, colors, spacing, icons, tables, schedule matrix, cards, buttons and responsive behavior used in the previously created Colegio San Marcos screens.

--------------------------------------------------
1. DOCENTE — MI HORARIO
--------------------------------------------------

For the "Docente" role, create/edit the "Mi horario" page.

The page must display the weekly schedule of the authenticated teacher.

Use the same schedule matrix visual structure as the Administrator's schedule matrix.

The matrix must contain:

- Individual hourly rows
- Days of the week as columns
- Existing recess periods
- Schedule blocks containing the relevant class information

Example structure:

              Lunes       Martes      Miércoles    Jueves      Viernes

08:00         Matemáticas  —           Física       —           Inglés
09:00         Matemáticas  Química      Física       Historia   Inglés
10:00         —            Química      —            Historia   —
11:00         RECREO       RECREO       RECREO       RECREO      RECREO

Maintain the same individual-hour structure already established for the Administrator schedule.

The teacher should see ONLY their own schedule.

Do NOT display schedules belonging to:
- Other teachers
- Other sections
- Other students

--------------------------------------------------
2. DOCENTE — READ-ONLY SCHEDULE
--------------------------------------------------

The teacher's schedule must be completely read-only.

Remove/disable all schedule-management functionality available to the Administrator.

The Docente must NOT be able to:

- Assign new schedule blocks
- See "+ Asignar"
- Delete schedule blocks
- Edit schedule blocks
- Select another teacher
- Search other teachers
- View schedules of other teachers
- View schedules by section
- Upload CSV files
- Upload XLSX files
- Perform bulk schedule assignments

The schedule matrix should therefore contain only the teacher's existing schedule.

Empty schedule periods may remain visually empty if the teacher has no class during that hour.

Do NOT display "+ Asignar" inside empty blocks.

The schedule should look like a read-only personal timetable.

--------------------------------------------------
3. ESTUDIANTE — MI HORARIO
--------------------------------------------------

For the "Estudiante" role, create/edit the "Mi horario" page.

Display the weekly schedule corresponding to the authenticated student.

Use the same matrix design as the Administrator's schedule.

The matrix must contain:

- Individual hourly rows
- Days of the week as columns
- Existing recess periods
- The student's assigned courses
- The corresponding teacher
- Classroom information when applicable

Example:

              Lunes             Martes          Miércoles       Jueves

08:00         Matemáticas       Comunicación    Física          Inglés
              Aula 201          Aula 203        Aula 205        Aula 202

09:00         Matemáticas       Comunicación    Física          Inglés
              Aula 201          Aula 203        Aula 205        Aula 202

10:00         Ciencias          Historia        Matemáticas     Arte
              Aula 204          Aula 201        Aula 201         Aula 203

11:00         RECREO            RECREO          RECREO           RECREO

--------------------------------------------------
4. ESTUDIANTE — FULLY POPULATED SCHEDULE
--------------------------------------------------

The student's schedule must appear completely populated with assigned classes.

Do NOT show empty schedule blocks for the student.

Every regular class period in the displayed weekly schedule should contain an assigned course.

Recess periods must remain visible.

The student must NOT see:

- "+ Asignar"
- Empty editable blocks
- Assignment controls
- Delete controls
- Edit controls

The schedule is strictly read-only.

--------------------------------------------------
5. ESTUDIANTE — NO ACCESS TO OTHER SCHEDULES
--------------------------------------------------

The student must only see their own weekly schedule.

Do NOT provide:

- Teacher selectors
- Section selectors
- Teacher search
- Grade selectors
- "Ver por docente"
- "Ver por sección"
- "Ver por aula"
- Any control that allows viewing another person's schedule

The student should simply enter "Mi horario" and see their own schedule.

--------------------------------------------------
6. APODERADO — MI HORARIO
--------------------------------------------------

For the "Apoderado" role, create/edit the "Mi horario" page.

Unlike the student and teacher views, the Apoderado must first select one of their registered children.

At the top of the page, display:

"Seleccionar hijo"

Use a dropdown/select component consistent with the existing application.

Example:

Seleccionar hijo

[ María López García ▼ ]

The dropdown must contain ONLY children associated with the authenticated Apoderado.

Do not display students who are not associated with this Apoderado.

--------------------------------------------------
7. APODERADO — DISPLAY CHILD'S SCHEDULE
--------------------------------------------------

Once a child is selected, display the selected student's information.

Example:

Horario de:

María López García

Then display the child's weekly schedule using the same schedule matrix used for the Student role.

The matrix must contain:

- Individual hourly rows
- Days of the week as columns
- Courses
- Teachers
- Classrooms when applicable
- Recess periods

The schedule must be completely populated for regular class periods.

The Apoderado is viewing the selected child's schedule in read-only mode.

--------------------------------------------------
8. APODERADO — CHANGE CHILD
--------------------------------------------------

If the Apoderado has more than one child, they can select another child using the same selector.

When the selected child changes:

- Update the displayed student information.
- Replace the schedule matrix with the selected child's schedule.
- Keep the same page.
- Do not open another page or modal.

Example:

Seleccionar hijo
[ Carlos Ramírez Soto ▼ ]

Horario de:
Carlos Ramírez Soto

[weekly schedule]

--------------------------------------------------
9. APODERADO — NO ACCESS TO OTHER SCHEDULES
--------------------------------------------------

The Apoderado may ONLY view schedules belonging to their own children.

Do NOT provide controls for:

- Searching teachers
- Selecting teachers
- Selecting arbitrary students
- Selecting arbitrary sections
- Selecting arbitrary grades
- Viewing classroom schedules
- Viewing other students
- Viewing other teachers

The child selector is the ONLY schedule-selection mechanism available to the Apoderado.

--------------------------------------------------
10. READ-ONLY BEHAVIOR
--------------------------------------------------

The schedule views for Docente, Estudiante and Apoderado must all be read-only.

None of these roles may:

- Add schedule blocks
- Edit schedule blocks
- Delete schedule blocks
- Assign teachers
- Assign classrooms
- Assign courses
- Upload schedule files

Do not display "+ Asignar" in any of these views.

Do not display "Guardar cambios".

Do not display schedule-editing modals.

--------------------------------------------------
11. FILE ATTACHMENT
--------------------------------------------------

IMPORTANT:

ONLY the Administrator can use the schedule file attachment functionality.

Do NOT display:

"Adjuntar archivo"

or any CSV/XLSX upload control in the schedule screens for:

- Docente
- Estudiante
- Apoderado

The CSV/XLSX bulk-upload functionality must remain available ONLY in the Administrator schedule screen.

DO NOT modify the Administrator implementation.

--------------------------------------------------
12. RECESS
--------------------------------------------------

Maintain the existing recess periods exactly as established in the Administrator schedule.

Recess must be visually differentiated from regular class periods.

Example:

11:00
────────────────────
       RECREO
────────────────────

The recess row must appear in the schedule of:

- Docente
- Estudiante
- Apoderado

--------------------------------------------------
13. SCHEDULE BLOCK DESIGN
--------------------------------------------------

Maintain the same visual appearance used for schedule blocks in the Administrator screen.

Each block may display:

Course name
Teacher
Classroom

Example:

MATEMÁTICAS

Prof. García
Aula 201

However, adapt the displayed information naturally to each role.

For the teacher, prioritize:
- Course
- Section
- Classroom

For the student:
- Course
- Teacher
- Classroom

For the parent:
- Course
- Teacher
- Classroom

Do not introduce a different visual component for each role.

--------------------------------------------------
14. NO CONFLICT MANAGEMENT FOR THESE ROLES
--------------------------------------------------

Conflict management is an Administrator-only function.

Do not provide conflict-management controls to:

- Docente
- Estudiante
- Apoderado

These users simply see the schedule assigned to them or their children.

Do not allow them to resolve, modify or delete conflicts.

--------------------------------------------------
15. ROLE-BASED PAGE TITLES
--------------------------------------------------

Use the following titles:

DOCENTE:

"Mi horario"

ESTUDIANTE:

"Mi horario"

APODERADO:

"Mi horario"

For the Apoderado, after selecting a child, optionally display:

"Horario de [Nombre del hijo]"

while keeping the main page title as:

"Mi horario"

--------------------------------------------------
16. VISUAL DESIGN
--------------------------------------------------

Maintain the existing Colegio San Marcos design system exactly.

Use the same:

- Institutional blue
- Application background
- White cards
- Typography
- 4px spacing system
- Schedule grid
- Schedule block styling
- Recess styling
- Border radius
- Shadows
- Icons
- Button styles
- Select controls
- Responsive behavior

Do not introduce a new visual style.

The three new/edited views must look like they belong to the same application as the Administrator's schedule.

--------------------------------------------------
17. SIDEBAR
--------------------------------------------------

Use the previously established role-specific sidebars.

For ESTUDIANTE:

- Mi horario
- Cursos
- Rendimiento académico
- Libreta de notas

For APODERADO:

- Mi horario
- Pagos
- Cursos
- Rendimiento académico
- Libreta de notas

For DOCENTE:

Use the existing Docente sidebar already established by the application.

Highlight:

"Mi horario"

as the active navigation item when the user is viewing the weekly schedule.

DO NOT modify the Administrator sidebar.

--------------------------------------------------
18. RESPONSIVE DESIGN
--------------------------------------------------

Maintain the existing responsive behavior.

On smaller screens:

- Keep the schedule matrix usable.
- Allow horizontal scrolling only when necessary for the schedule matrix.
- Keep the time column visible and clearly aligned.
- Make the Apoderado child selector responsive.
- Keep schedule blocks readable.
- Do not introduce horizontal scrolling outside the schedule matrix unnecessarily.

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------

- Modify ONLY the schedule views for Docente, Estudiante and Apoderado.
- DO NOT modify anything in the Administrator schedule.
- DO NOT modify the Administrator sidebar.
- Do not remove any Administrator functionality.
- Do not change the Administrator's "+ Asignar" functionality.
- Do not change Administrator CSV/XLSX upload.
- Do not change Administrator conflict management.

DOCENTE:
- Shows only the authenticated teacher's schedule.
- Uses the same schedule matrix as Administrator.
- Read-only.
- No "+ Asignar".
- No editing.
- No deleting.
- No other teacher schedules.
- No file upload.

ESTUDIANTE:
- Shows only the authenticated student's schedule.
- Uses the same schedule matrix.
- Regular class periods must be fully populated.
- No empty editable blocks.
- No "+ Asignar".
- Read-only.
- No other schedules.
- No file upload.

APODERADO:
- Shows a selector containing only the authenticated user's children.
- Displays the selected child's schedule.
- Uses the same schedule matrix.
- Regular class periods must be fully populated.
- Read-only.
- Cannot view unrelated students' schedules.
- No "+ Asignar".
- No file upload.

The final result must preserve the existing Colegio San Marcos design and make the schedule experience clearly dependent on the user's role.