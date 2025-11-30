const { body, validationResult } = require('express-validator');

// Reglas de validación para el registro de usuarios
const registerValidation = [
  body('email')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
];

// Reglas de validación para el inicio de sesión
const loginValidation = [
  body('email')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

// Middleware para manejar los errores de validación
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  registerValidation,
  loginValidation,
  validate
};
