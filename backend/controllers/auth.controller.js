const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createUser, verifyUser } = require('../models/user.model');
const { JWT_SECRET } = require('../middlewares/auth.middleware');

// Controlador para el registro de usuarios
const register = async (req, res) => {
  // Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Crear el usuario
    const user = await createUser(email, password);
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(400).json({ error: error.message });
  }
};

// Controlador para el inicio de sesión
const login = async (req, res) => {
  // Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Verificar credenciales
    const user = await verifyUser(email, password);
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      user,
      token
    });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(401).json({ error: error.message });
  }
};

// Controlador para obtener el perfil del usuario autenticado
const getProfile = (req, res) => {
  // El usuario ya está disponible en req.user gracias al middleware de autenticación
  res.json({
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getProfile
};
