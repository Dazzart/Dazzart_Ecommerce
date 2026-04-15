const { Usuario } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configurar transportador de correo aquí
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jopsezabaleta5@gmail.com',
    pass: 'czvm nhop xzev uova',
  },
});

exports.solicitarReset = async (req, res) => {
  const { correo_electronico } = req.body;
  if (!correo_electronico) {
    return res.status(400).json({ message: 'Correo requerido' });
  }
  try {
    console.log('PETICIÓN de recuperación recibida para:', correo_electronico);
    const usuario = await Usuario.findOne({ where: { correo_electronico } });

    console.log('Resultado de búsqueda en BD:', usuario ? 'Encontrado' : 'No encontrado');
    if (!usuario) {
      console.log('Usuario no encontrado:', correo_electronico);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // Generar token de 4 dígitos numéricos aleatorios
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Token generado:', token);
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

    
    await usuario.update({
      reset_token: token,
      reset_token_expires: expires
    });

    console.log('Enviando código a:', correo_electronico, 'Código:', token);
    await transporter.sendMail({
      from: 'TU_CORREO@gmail.com',
      to: correo_electronico,
      subject: 'Código de verificación - Recupera tu contraseña',
      html: `
        <p>Tu código de verificación para restablecer tu contraseña es:</p>
        <h2 style="color: #43a047; font-size: 32px; letter-spacing: 5px;">${token}</h2>
        <p>Este código expira en <strong>30 minutos</strong>.</p>
        <p>Si no solicitaste restablecer tu contraseña, ignora este correo.</p>
      `
    });
    console.log('Correo enviado correctamente a:', correo_electronico);
    res.json({ message: 'Correo de recuperación enviado' });
  } catch (err) {
    console.error('ERROR al enviar correo:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, nuevaContrasena } = req.body;
  if (!token || !nuevaContrasena) {
    return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });
  }

  // Validar que el token sea exactamente 4 dígitos numéricos
  if (!/^\d{4}$/.test(token)) {
    return res.status(400).json({ message: 'Token inválido: debe ser 4 dígitos numéricos' });
  }

  try {
    const usuario = await Usuario.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() }
      }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    const hash = await bcrypt.hash(nuevaContrasena, 10);

    await usuario.update({
      contrasena: hash,
      reset_token: null,
      reset_token_expires: null
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};
