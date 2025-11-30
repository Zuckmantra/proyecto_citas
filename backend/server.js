require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importar controladores de autenticación
const { register, login, getProfile } = require('./controllers/auth.controller');
const { authenticateToken } = require('./middlewares/auth.middleware');
const { registerValidation, loginValidation, validate } = require('./middlewares/validation.middleware');

const app = express();
const PORT = process.env.PORT || 3002;
const CITAS_FILE = path.join(__dirname, 'citas.json');

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());


async function initializeCitasFile() {
  try {
    await fs.access(CITAS_FILE);
  } catch (error) {
    await fs.writeFile(CITAS_FILE, JSON.stringify([], null, 2));
  }
}


app.get('/citas', async (req, res) => {
  try {
    const data = await fs.readFile(CITAS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Error al leer las citas' });
  }
});


app.get('/citas/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    const data = await fs.readFile(CITAS_FILE, 'utf8');
    const citas = JSON.parse(data);
    const citasFecha = citas.filter(cita => cita.fecha === fecha);
    res.json(citasFecha);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar citas' });
  }
});

app.post('/citas', async (req, res) => {
  try {
    const { paciente, profesional, fecha, hora } = req.body;
    
    if (!paciente || !profesional || !fecha || !hora) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const data = await fs.readFile(CITAS_FILE, 'utf8');
    const citas = JSON.parse(data);
    
    const nuevaCita = {
      id: uuidv4(),
      paciente,
      profesional,
      fecha,
      hora
    };

    citas.push(nuevaCita);
    await fs.writeFile(CITAS_FILE, JSON.stringify(citas, null, 2));
    
    res.status(201).json(nuevaCita);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la cita' });
  }
});


app.put('/citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { paciente, profesional, fecha, hora } = req.body;
    
    if (!paciente || !profesional || !fecha || !hora) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const data = await fs.readFile(CITAS_FILE, 'utf8');
    let citas = JSON.parse(data);
    
    const index = citas.findIndex(cita => cita.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    citas[index] = { ...citas[index], paciente, profesional, fecha, hora };
    
    await fs.writeFile(CITAS_FILE, JSON.stringify(citas, null, 2));
    
    res.json(citas[index]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la cita' });
  }
});


app.delete('/citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await fs.readFile(CITAS_FILE, 'utf8');
    let citas = JSON.parse(data);
    
    const index = citas.findIndex(cita => cita.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const citaEliminada = citas.splice(index, 1);
    
    await fs.writeFile(CITAS_FILE, JSON.stringify(citas, null, 2));
    
    res.json(citaEliminada[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la cita' });
  }
});


// Rutas de autenticación
app.post('/api/auth/register', registerValidation, validate, register);
app.post('/api/auth/login', loginValidation, validate, login);
app.get('/api/auth/me', authenticateToken, getProfile);

// Ruta protegida de ejemplo
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Esta es una ruta protegida', user: req.user });
});

// Iniciar el servidor
app.listen(PORT, async () => {
  await initializeCitasFile();
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
});
