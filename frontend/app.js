// Elementos del DOM
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailSpan = document.getElementById('userEmail');
const tabButtons = document.querySelectorAll('.tab-btn');

// URLs de la API
const API_URL = 'http://localhost:3000/api';
const LOGIN_URL = `${API_URL}/auth/login`;
const REGISTER_URL = `${API_URL}/auth/register`;
const PROFILE_URL = `${API_URL}/auth/me`;

// Verificar si hay un token guardado
const token = localStorage.getItem('token');
if (token) {
    checkAuth();
} else {
    showAuth();
}

// Manejadores de eventos
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
        switchTab(tab);
    });
});

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutBtn.addEventListener('click', handleLogout);

// Funciones de autenticación
async function checkAuth() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showAuth();
            return;
        }
        const response = await fetch(PROFILE_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            showMain(data.user.email);
        } else {
            throw new Error('No autenticado');
        }
    } catch (error) {
        localStorage.removeItem('token');
        showAuth();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.email);
            showMain(data.user.email);
        } else {
            showError(loginError, data.error || 'Error al iniciar sesión');
        }
    } catch (error) {
        showError(loginError, 'Error de conexión');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        return showError(registerError, 'Las contraseñas no coinciden');
    }

    try {
        const response = await fetch(REGISTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('¡Registro exitoso! Por favor inicia sesión');
            switchTab('login');
            registerForm.reset();
        } else {
            showError(registerError, data.error || 'Error al registrarse');
        }
    } catch (error) {
        showError(registerError, 'Error de conexión');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    showAuth();
}

// Funciones de interfaz
function switchTab(tab) {
    // Actualizar botones de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    // Mostrar el formulario correspondiente
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${tab}Form`);
    });

    // Limpiar errores
    loginError.textContent = '';
    registerError.textContent = '';
}

function showAuth() {
    authContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    document.title = 'Gestión de Citas - Iniciar Sesión';
}

function showMain(email) {
    authContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    userEmailSpan.textContent = email;
    document.title = 'Gestión de Citas';
    // Aquí puedes cargar las citas del usuario
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => element.classList.remove('show'), 5000);
}

function showSuccess(message) {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message show';
    successMsg.textContent = message;
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
}

// Toggle para mostrar/ocultar contraseña
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

// Inicializar la aplicación
function initApp() {
    // Aquí puedes inicializar otros componentes de la aplicación
    console.log('Aplicación iniciada');
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    checkAuth();
});
