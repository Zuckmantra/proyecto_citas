const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  // Obtener el token del encabezado de autorización
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const user = await findUserByEmail(decoded.email);
    
    if (!user) {
      return res.status(403).json({ error: 'Usuario no encontrado' });
    }

    // Agregar el usuario al objeto de solicitud para su uso posterior
    req.user = user;
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles de usuario
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole,
  JWT_SECRET
};
