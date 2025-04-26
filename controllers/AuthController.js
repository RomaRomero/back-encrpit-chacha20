const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { username, password, publicKey } = req.body;

    // Validar que todos los campos estén presentes
    if (!username || !password || !publicKey) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      username,
      password: hashedPassword,
      publicKey,
    });

    // Guardar en la base de datos
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar campos
    if (!username || !password) {
      return res.status(400).json({ error: 'Faltan datos de acceso' });
    }

    // Buscar al usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Comparar contraseñas
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { username: user.username },
      'your_jwt_secret_key', // 👈 Ideal mover a variable de entorno .env
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
