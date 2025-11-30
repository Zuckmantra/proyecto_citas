# Sistema de Gestión de Citas

Aplicación web para la gestión de citas médicas, desarrollada con Node.js/Express en el backend y HTML/CSS/JavaScript puro en el frontend.

Para iniciar el proyecto abrir la terminal y ejecutar los siguientes comandos:

```bash
# Iniciar el servidor
npm start
node server.js
```

Y luego entrar en el index de la carpeta frontend 

## Historia 1 — Registro y autenticación de usuarios
- ID: HU-01
- Título: Como usuario, quiero registrarme e iniciar sesión para gestionar mis citas.
- Descripción: Un usuario debe poder crear una cuenta con email y contraseña, iniciar sesión y cerrar sesión. Las credenciales deben guardarse de forma segura (hash de contraseña).
- Criterios de aceptación:
  - Existe una ruta de registro (API o formulario) que valida email y contraseña.
  - Las contraseñas se almacenan con hash (bcrypt u otro).
  - Existe una ruta de login que devuelve sesión o token (según arquitectura del proyecto).
  - Existe la opción de cerrar sesión (eliminar token/sesión).
  - Los endpoints protegidos solo permiten acceso a usuarios autenticados.
- Tareas técnicas:
  - Crear modelo/tabla de usuarios si no existe.
  - Implementar validaciones de entrada (email válido, contraseña mínima).
  - Implementar hashing de contraseña y verificación en login.
  - Crear endpoints/acciones para register/login/logout.
  - Pruebas manuales: registrar usuario, login, acceder a endpoint protegido, logout.
- Estimación: 5-8 horas
- Prioridad: Alta
