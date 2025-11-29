const fechaInput = document.getElementById('fecha');
const citasList = document.getElementById('citasList');
const nuevaCitaBtn = document.getElementById('nuevaCitaBtn');
const citaModal = document.getElementById('citaModal');
const closeBtn = document.querySelector('.close');
const cancelarBtn = document.getElementById('cancelarBtn');
const citaForm = document.getElementById('citaForm');
const modalTitulo = document.getElementById('modalTitulo');
const citaIdInput = document.getElementById('citaId');
const pacienteInput = document.getElementById('paciente');
const profesionalInput = document.getElementById('profesional');
const fechaCitaInput = document.getElementById('fechaCita');
const horaInput = document.getElementById('hora');

// URL de la API
const API_URL = 'http://localhost:3000';

// Estado
let citas = [];
let modoEdicion = false;


document.addEventListener('DOMContentLoaded', () => {
 
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.value = hoy;
    fechaCitaInput.value = hoy;

    cargarCitas(hoy);
});

fechaInput.addEventListener('change', (e) => {
    cargarCitas(e.target.value);
});

nuevaCitaBtn.addEventListener('click', () => {
    modoEdicion = false;
    citaForm.reset();
    citaIdInput.value = '';
    modalTitulo.textContent = 'Nueva Cita';
    fechaCitaInput.value = fechaInput.value;
    citaModal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    citaModal.style.display = 'none';
});

cancelarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    citaModal.style.display = 'none';
});

citaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const citaData = {
        paciente: pacienteInput.value.trim(),
        profesional: profesionalInput.value.trim(),
        fecha: fechaCitaInput.value,
        hora: horaInput.value
    };
    
    if (modoEdicion) {
        actualizarCita(citaIdInput.value, citaData);
    } else {
        crearCita(citaData);
    }
});


window.addEventListener('click', (e) => {
    if (e.target === citaModal) {
        citaModal.style.display = 'none';
    }
});


async function cargarCitas(fecha) {
    try {
        const response = await fetch(`${API_URL}/citas/${fecha}`);
        if (!response.ok) throw new Error('Error al cargar las citas');
        
        citas = await response.json();
        mostrarCitas(citas);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar las citas');
    }
}

async function crearCita(citaData) {
    try {
        const response = await fetch(`${API_URL}/citas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(citaData)
        });
        
        if (!response.ok) throw new Error('Error al crear la cita');
        
        const nuevaCita = await response.json();
        citas.push(nuevaCita);
        mostrarCitas(citas);
        citaModal.style.display = 'none';
        alert('Cita creada correctamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear la cita');
    }
}

async function actualizarCita(id, citaData) {
    try {
        const response = await fetch(`${API_URL}/citas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(citaData)
        });
        
        if (!response.ok) throw new Error('Error al actualizar la cita');
        
        const citaActualizada = await response.json();
        const index = citas.findIndex(c => c.id === id);
        if (index !== -1) {
            citas[index] = citaActualizada;
        }
        
        mostrarCitas(citas);
        citaModal.style.display = 'none';
        alert('Cita actualizada correctamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la cita');
    }
}

async function eliminarCita(id) {
    if (!confirm('¿Está seguro de eliminar esta cita?')) return;
    
    try {
        const response = await fetch(`${API_URL}/citas/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar la cita');
        
        citas = citas.filter(cita => cita.id !== id);
        mostrarCitas(citas);
        alert('Cita eliminada correctamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la cita');
    }
}

function editarCita(id) {
    const cita = citas.find(c => c.id === id);
    if (!cita) return;
    
    modoEdicion = true;
    citaIdInput.value = cita.id;
    pacienteInput.value = cita.paciente;
    profesionalInput.value = cita.profesional;
    fechaCitaInput.value = cita.fecha;
    horaInput.value = cita.hora;
    modalTitulo.textContent = 'Editar Cita';
    citaModal.style.display = 'flex';
}


function mostrarCitas(citas) {
    if (citas.length === 0) {
        citasList.innerHTML = '<p>No hay citas programadas para esta fecha.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Profesional</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${citas.map(cita => `
                <tr>
                    <td>${formatearHora(cita.hora)}</td>
                    <td>${cita.paciente}</td>
                    <td>${cita.profesional}</td>
                    <td class="actions">
                        <button class="btn primary" onclick="editarCita('${cita.id}')">Editar</button>
                        <button class="btn danger" onclick="eliminarCita('${cita.id}')">Eliminar</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    citasList.innerHTML = '';
    citasList.appendChild(table);
}

// Funciones de utilidad
function formatearHora(hora) {
    if (!hora) return '';
    
    // Asegurarse de que la hora tenga el formato HH:MM
    const [horas, minutos] = hora.split(':');
    return `${horas.padStart(2, '0')}:${minutos || '00'}`;
}
