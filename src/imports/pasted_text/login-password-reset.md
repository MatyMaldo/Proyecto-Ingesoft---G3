Edit ONLY the password recovery interaction on the existing login screen of the Colegio San Marcos school management system.

IMPORTANT:
Do NOT modify any screens associated with the user roles.

Do NOT modify:
- Administrator screens
- Docente screens
- Estudiante screens
- Apoderado screens
- Any role-specific sidebar
- Any role-specific functionality
- The existing dashboard screens
- The existing navigation
- The existing login form fields or layout, except for the requested "¿Olvidaste tu contraseña?" interaction

The only requested change is to make the existing "¿Olvidaste tu contraseña?" text interactive and open a password-reset form.

Maintain exactly the same visual language and design system used in all previously created Colegio San Marcos screens.

--------------------------------------------------
1. LOGIN SCREEN
--------------------------------------------------

Keep the existing login screen exactly as it currently appears.

Do not change:

- Logo
- Colegio San Marcos branding
- Username/email/DNI field
- Password field
- "Iniciar sesión" button
- Background
- Typography
- Colors
- Spacing
- Icons
- Layout
- Form structure

The only element that should receive new functionality is the existing text:

"¿Olvidaste tu contraseña?"

Make this text clearly clickable while maintaining its existing visual style.

Use the existing link/secondary text style from the application.

--------------------------------------------------
2. PASSWORD RECOVERY FORM
--------------------------------------------------

When the user clicks:

"¿Olvidaste tu contraseña?"

Open a modal or password-reset form using the same modal/form design language used throughout the existing Colegio San Marcos system.

Title:

"Restablecer contraseña"

Add a short explanatory text:

"Ingresa tu nueva contraseña y confírmala para restablecer el acceso a tu cuenta."

The form must contain ONLY these two fields:

1. "Nueva contraseña"

Placeholder:

"Ingresa tu nueva contraseña"

2. "Confirmar contraseña"

Placeholder:

"Confirma tu nueva contraseña"

Both fields must use password input styling.

--------------------------------------------------
3. PASSWORD VALIDATION
--------------------------------------------------

The form should provide basic validation.

The "Restablecer contraseña" action should require:

- Nueva contraseña is not empty.
- Confirmar contraseña is not empty.
- Both passwords match.

If the passwords do not match, display an inline validation message:

"Las contraseñas no coinciden."

If the password fields are empty when attempting to submit, display the appropriate required-field validation using the existing error style.

Do not introduce additional password requirements unless they already exist in the current login system.

--------------------------------------------------
4. FORM BUTTONS
--------------------------------------------------

At the bottom of the form, display exactly two buttons:

[Cancelar] [Restablecer contraseña]

"Cancelar":

- Closes the password recovery form.
- Returns the user to the login screen.
- Does not modify any information.

"Restablecer contraseña":

- Validates the two password fields.
- If validation succeeds, displays a successful password-reset state.

Use the existing button styles from the application.

--------------------------------------------------
5. SUCCESS STATE
--------------------------------------------------

After successfully resetting the password, display a confirmation message using the existing success/notification design.

Message:

"Tu contraseña ha sido restablecida correctamente."

Then provide an action to return to the login screen.

Button:

"Volver al inicio de sesión"

When clicked, close the recovery form and return the user to the normal login screen.

Do not redirect the user to any role-specific page.

--------------------------------------------------
6. CANCEL BEHAVIOR
--------------------------------------------------

If the user clicks:

"Cancelar"

at any point before successfully resetting the password:

- Close the recovery form.
- Return to the existing login screen.
- Preserve the original login screen exactly as it was.

Do not change any role-specific screens.

--------------------------------------------------
7. VISUAL DESIGN
--------------------------------------------------

Maintain exactly the same Colegio San Marcos design system used in the previously created screens.

Preserve:

- Institutional blue palette
- Existing application background
- Existing white cards
- Existing typography
- Existing input styles
- Existing button styles
- Existing modal styles
- Existing border radius
- Existing shadows
- Existing spacing system
- Existing icons
- Existing responsive behavior

The password-reset form must look like a natural extension of the existing login interface.

Do not introduce a new visual style.

--------------------------------------------------
8. RESPONSIVE BEHAVIOR
--------------------------------------------------

Maintain the existing responsive behavior of the login screen.

The password-reset form/modal must:

- Fit within the available viewport.
- Remain centered.
- Maintain appropriate spacing on smaller screens.
- Keep both buttons accessible.
- Prevent the form from becoming unnecessarily wide.

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------

- Modify ONLY the "¿Olvidaste tu contraseña?" interaction on the login screen.
- Do NOT modify the existing login layout.
- Do NOT modify any role-specific screen.
- Do NOT modify the Administrator interface.
- Do NOT modify the Docente interface.
- Do NOT modify the Estudiante interface.
- Do NOT modify the Apoderado interface.
- Do NOT modify any sidebar.
- Do NOT add password-recovery options to any dashboard.
- The recovery form must contain exactly:
  - Nueva contraseña
  - Confirmar contraseña
- The form must contain exactly these main actions:
  - Restablecer contraseña
  - Cancelar
- Keep the existing Colegio San Marcos visual identity.
- Make the final result look as if password recovery was originally part of the existing login system.