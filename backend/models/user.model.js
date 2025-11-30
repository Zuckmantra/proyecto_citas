const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const USERS_FILE = path.join(__dirname, '../users.json');

// Inicializar el archivo de usuarios si no existe
async function initializeUsersFile() {
  try {
    await fs.access(USERS_FILE);
  } catch (error) {
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
  }
}

// Obtener todos los usuarios
async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Error al leer los usuarios');
  }
}

// Guardar usuarios
async function saveUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    throw new Error('Error al guardar los usuarios');
  }
}

// Buscar usuario por email
async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find(user => user.email === email);
}

// Crear un nuevo usuario
async function createUser(email, password) {
  // Verificar si el usuario ya existe
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado');
  }

  // Hashear la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Crear el nuevo usuario
  const newUser = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  // Guardar el usuario
  const users = await getUsers();
  users.push(newUser);
  await saveUsers(users);

  // No devolver la contraseña
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

// Verificar credenciales de usuario
async function verifyUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  // No devolver la contraseña
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Inicializar el archivo de usuarios al cargar el módulo
initializeUsersFile().catch(console.error);

module.exports = {
  createUser,
  verifyUser,
  findUserByEmail,
  getUsers
};
