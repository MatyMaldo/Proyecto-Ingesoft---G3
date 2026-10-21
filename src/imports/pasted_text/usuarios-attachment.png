Edit the "Usuarios" section to the existing Colegio San Marcos school management system.

Maintain exactly the same visual language and design system used in all previously created screens. Do not redesign the application or introduce a different visual style.

Preserve:
- Existing fixed left sidebar.
- Existing top navigation bar.
- Existing breadcrumbs.
- Existing typography hierarchy.
- Existing spacing system.
- Existing cards, tables, inputs, dropdowns, buttons, modals, badges and icons.
- Existing border radius, shadows and interaction states.
- Existing responsive behavior.
- Existing Colegio San Marcos institutional colors.

--------------------------------------------------
1. USERS PAGE
--------------------------------------------------

When entering the page, use:

Breadcrumb:
Inicio › Usuarios

Page title:

"Usuarios"

Subtitle:

"Gestiona los usuarios registrados en el sistema."

--------------------------------------------------
2. SEARCH AND ACTION BAR
--------------------------------------------------

At the top of the page, above the user list, create a horizontal action area.

On the left, display a search field labeled:

"Buscar usuario"

Placeholder:

"Buscar por nombre o DNI..."

The search must allow searching users by:

- Name
- DNI

Next to the search field, display three action buttons:

[Registrar apoderado]
[Registrar estudiante]
[Registrar docente]

Use the existing primary/secondary button styles from the application.

On smaller screens, stack the search field and action buttons vertically.

--------------------------------------------------
3. USERS LIST
--------------------------------------------------

Below the search/action area, display a table or structured list of all registered users.

The list should include relevant information such as:

- Nombre
- Apellido
- DNI
- Rol
- Correo
- Estado
- Acciones

Example:

Nombre | Apellido | DNI | Rol | Correo | Estado | Acciones

María | López | 74852136 | Apoderado | maria@email.com | Activo | [Editar] [Desactivar]

Carlos | Ramírez | 70482135 | Estudiante | carlos@email.com | Activo | [Editar] [Desactivar]

Use status badges consistent with the existing design:

"Activo"
"Desactivado"

Use the existing success/disabled visual styles.

The list should support the search field dynamically.

When the administrator enters a name or DNI, update the displayed list to show matching users.

If there are no matching users, display an appropriate empty-state message:

"No se encontraron usuarios."

--------------------------------------------------
4. REGISTER APODERADO
--------------------------------------------------

When the administrator clicks:

"Registrar apoderado"

open a modal or dedicated form using the existing form/modal design.

Modal title:

"Registrar apoderado"

Include the following fields:

Nombre
Apellido
Edad
DNI
Teléfono
Correo
Contraseña
Confirmar contraseña

Use appropriate input types.

Fields:

"Nombre"
Placeholder:
"Ingrese el nombre"

"Apellido"
Placeholder:
"Ingrese el apellido"

"Edad"
Placeholder:
"Ingrese la edad"

"DNI"
Placeholder:
"Ingrese el DNI"

"Teléfono"
Placeholder:
"Ingrese el teléfono"

"Correo"
Placeholder:
"Ingrese el correo electrónico"

"Contraseña"
Placeholder:
"Ingrese la contraseña"

"Confirmar contraseña"
Placeholder:
"Confirme la contraseña"

At the bottom:

[Cancelar] [Registrar]

Validation requirements:

- Required fields must be completed.
- DNI must have the appropriate format.
- Email must have a valid email format.
- Password must be entered.
- Confirm password must match password.
- Age must be a valid numeric value.

Display validation messages using the existing error style.

"Cancelar" closes the form without saving.

"Registrar" creates the new apoderado.

After successful registration, close the modal and display:

"El apoderado ha sido registrado correctamente."

--------------------------------------------------
5. REGISTER ESTUDIANTE
--------------------------------------------------

When the administrator clicks:

"Registrar estudiante"

open a modal or dedicated form.

Modal title:

"Registrar estudiante"

Include:

Nombre
Apellido
Edad
DNI
Correo
Contraseña
Confirmar contraseña

Additionally include a field for finding and associating the student's apoderado.

Field:

"DNI del apoderado"

Placeholder:

"Buscar por DNI del apoderado..."

The administrator should be able to enter the apoderado's DNI and search for the corresponding registered apoderado.

After a successful search, display the selected apoderado:

Apoderado seleccionado

María López García
DNI: 74852136

Allow the administrator to change the selected apoderado by performing another search.

The complete form structure should be:

Nombre
Apellido
Edad
DNI
Correo
Contraseña
Confirmar contraseña
DNI del apoderado
Apoderado seleccionado

At the bottom:

[Cancelar] [Registrar]

The "Registrar" button must not be enabled until the required student information and a valid apoderado have been selected.

If the DNI search does not find an apoderado, display:

"No se encontró un apoderado registrado con este DNI."

After successful registration:

"El estudiante ha sido registrado correctamente."

--------------------------------------------------
6. REGISTER DOCENTE
--------------------------------------------------

When the administrator clicks:

"Registrar docente"

open a modal or dedicated form.

Modal title:

"Registrar docente"

Use the same fields as the apoderado:

Nombre
Apellido
Edad
DNI
Teléfono
Correo
Contraseña
Confirmar contraseña

Use the same validation rules and visual styles.

At the bottom:

[Cancelar] [Registrar]

After successful registration:

"El docente ha sido registrado correctamente."

--------------------------------------------------
7. EDIT USER
--------------------------------------------------

Each user row must contain an action:

"Editar"

When the administrator clicks "Editar", open a modal containing the user's current information.

Modal title:

"Editar usuario"

The form must contain ONLY these editable fields:

Nombre
Apellido
DNI
Correo

Pre-populate each field with the user's current information.

Example:

Nombre
[María]

Apellido
[López]

DNI
[74852136]

Correo
[maria@email.com]

At the bottom:

[Cancelar] [Guardar cambios]

"Cancelar" closes the modal without changing the user.

"Guardar cambios" saves the modified information.

After successful modification:

"Los datos del usuario han sido actualizados correctamente."

Do not display password fields in this edit form.

--------------------------------------------------
8. ACTIVATE / DEACTIVATE USER
--------------------------------------------------

Each user row must also contain a second action for activating or deactivating the account.

If the user is currently active, display:

"Desactivar"

If the user is currently inactive, display:

"Activar"

When the administrator clicks the action, open a confirmation modal.

For an active user:

Title:

"Desactivar usuario"

Message:

"¿Está seguro de que desea desactivar este usuario?"

Explain that the user will no longer be able to access the system while inactive.

Buttons:

[Cancelar] [Desactivar]

For an inactive user:

Title:

"Activar usuario"

Message:

"¿Está seguro de que desea activar este usuario?"

Buttons:

[Cancelar] [Activar]

The confirmation action should use the appropriate danger or primary/success style.

After successful deactivation:

"El usuario ha sido desactivado correctamente."

After successful activation:

"El usuario ha sido activado correctamente."

Update the status badge in the users list immediately.

--------------------------------------------------
9. USER STATUS
--------------------------------------------------

Use two states:

Activo
Desactivado

Active users should use the existing success visual treatment.

Inactive users should use the existing neutral/disabled visual treatment.

Do not delete users from the system when they are deactivated.

The action must change the user's status rather than remove their record.

--------------------------------------------------
10. VISUAL DESIGN
--------------------------------------------------

Maintain the existing Colegio San Marcos design system.

Use the established colors:

Primary Deep Blue:
#00236f

Secondary Blue:
#0058be

Application Background:
#f8f9ff

Surface:
#ffffff

Main Text:
#121c2a

Success:
#16a34a

Warning:
#d97706

Danger:
#ba1a1a

Maintain the existing typography:

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

Use the existing 4px spacing scale.

--------------------------------------------------
11. TABLE ACTIONS
--------------------------------------------------

The actions column should contain two clearly distinguishable actions:

[Editar] [Desactivar]

or, for inactive users:

[Editar] [Activar]

"Editar" should use the existing neutral/secondary action style.

"Desactivar" should use the existing danger style.

"Activar" should use the existing primary/success style.

Do not overcrowd the table.

--------------------------------------------------
12. RESPONSIVE BEHAVIOR
--------------------------------------------------

Maintain the existing responsive behavior of the application.

On smaller screens:

- Stack the search field and registration buttons.
- Make the user list responsive.
- If the table becomes too wide, transform each user into a responsive card/list item rather than creating unnecessary horizontal scrolling.
- Stack action buttons when necessary.
- Make registration and edit modals fit the available viewport.
- Keep all form controls accessible.

--------------------------------------------------
13. IMPORTANT ACCESS CONTROL
--------------------------------------------------

Do not expose the user-management functionality to:

- Docente
- Estudiante
- Apoderado

The administrator is the only role that can:

- View the complete user list.
- Search users.
- Register apoderados.
- Register estudiantes.
- Register docentes.
- Edit user information.
- Activate users.
- Deactivate users.

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------

- Keep the existing Colegio San Marcos visual identity.
- Do not modify unrelated sections.
- Do not modify the existing Matrículas, Cursos, Pagos, Horarios, Auditorías or Log de errores pages.
- Reuse existing components and interaction patterns.
- Do not add unnecessary fields to the forms.
- The student registration form must include the DNI search for the apoderado.
- The edit form must contain only Nombre, Apellido, DNI and Correo.
- Passwords must NOT be editable from the "Editar usuario" form.
- Activating/deactivating a user must require confirmation.
- Deactivating a user must not delete the user.