const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dazzart';

exports.login = async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  console.log(" Body recibido:", req.body);

  if (!correo_electronico || !contrasena) {
    console.warn(" Faltan credenciales:", { correo_electronico, contrasena });
    return res.status(400).json({ message: 'Correo y contraseña requeridos' });
  }

  try {
    const user = await Usuario.findOne({
      where: { correo_electronico }
    });

    console.log(" Resultado búsqueda usuario:", user ? "Encontrado" : "No encontrado");

    if (!user) {
      console.warn(" Usuario no encontrado:", correo_electronico);
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    //  Validar estado
    if (!user.estado || user.estado.toLowerCase() !== 'activo') {
      console.warn("Usuario inactivo:", user.estado);
      return res.status(403).json({ message: 'Tu cuenta está inactiva. Contacta al administrador.' });
    }

    //  Debug extra: ver qué valores está comparando bcrypt
    console.log("Contraseña recibida:", contrasena);
    console.log(" Hash almacenado:", user.contrasena);

    // Validar contraseña
    const match = await bcrypt.compare(contrasena.trim(), user.contrasena); //  trim evita espacios
    console.log(" Comparación contraseña:", match);

    if (!match) {
      console.warn(" Contraseña incorrecta para:", correo_electronico);
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token (sin expiración)
    const token = jwt.sign(
      { id_usuario: user.id_usuario, id_rol: user.id_rol },
      SECRET
    );
    console.log("Token JWT generado:", token);

    console.log("Login exitoso para usuario ID:", user.id_usuario);

    // Retornamos el objeto plano del usuario
    const userData = user.get({ plain: true });

    res.json({
      message: 'Login exitoso',
      user: {
        id_usuario: userData.id_usuario,
        nombre: userData.nombre,
        id_rol: userData.id_rol,
        correo_electronico: userData.correo_electronico,
        direccion: userData.direccion,
        estado: userData.estado
      },
      token
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};
