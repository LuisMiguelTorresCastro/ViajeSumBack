require('dotenv').config();
const express = require('express');
const router = express.Router();
const query = require('../db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ruta para registrar al usuario
router.post('/', async (req, res) => {
  const schema = Joi.object({
    nombreUsuario: Joi.string().min(3).max(30).required(),
    apellidoUsuario: Joi.string().min(3).max(30).required(),
    telefonoUsuario: Joi.string().pattern(/^\d{10}$/).required(),
    correoUsuario: Joi.string().email().required(),
    contraseñaUsuario: Joi.string().min(8).required(),
    direccionUsuario: Joi.string().required(),
    ciudad: Joi.string().required(),
    estado: Joi.string().required(),
    codigoPostal: Joi.string().pattern(/^\d{5}$/).required(),
    rolUsuario: Joi.string().valid('cliente', 'admin').default('cliente'),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const {
    nombreUsuario,
    apellidoUsuario,
    telefonoUsuario,
    correoUsuario,
    contraseñaUsuario,
    direccionUsuario,
    ciudad,
    estado,
    codigoPostal,
    rolUsuario,
  } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const emailResults = await query('SELECT * FROM Usuario WHERE correoUsuario = ?', [correoUsuario]);
    if (emailResults.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Generar hash de la contraseña
    const hash = await bcrypt.hash(contraseñaUsuario, 12);

    // Generar un token de validación
    const token = crypto.randomBytes(32).toString('hex');

    // Guardar los datos en la tabla temporal
    await query(
      `INSERT INTO UsuarioTemporal 
        (nombreUsuario, apellidoUsuario, telefonoUsuario, correoUsuario, contraseñaUsuario, direccionUsuario, ciudad, estado, codigoPostal, token) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombreUsuario, apellidoUsuario, telefonoUsuario, correoUsuario, hash, direccionUsuario, ciudad, estado, codigoPostal, token]
    );

    // Enviar correo de validación
    const validationUrl = `http://${req.headers.host}/api/validate/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correoUsuario,
      subject: 'Validación de cuenta - Viajes SUM',
      text: `Hola ${nombreUsuario} ${apellidoUsuario},\n\n` +
            `Gracias por registrarte. Por favor valida tu cuenta haciendo clic en el siguiente enlace:\n\n` +
            `${validationUrl}\n\n` +
            `Este enlace será válido por 24 horas.\n\n` +
            `Saludos,\nEl equipo de Viajes SUM`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).json({ message: 'Error al enviar el correo de validación.' });
      }
      res.status(201).json({ message: 'Registro exitoso. Por favor revisa tu correo para validar tu cuenta.' });
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Ruta para validar el correo
router.get('/validate/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Verificar el token
    const results = await query('SELECT * FROM UsuarioTemporal WHERE token = ?', [token]);
    if (results.length === 0) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    const userData = results[0];

    // Mover datos a la tabla principal
    const result = await query(
      'INSERT INTO Usuario (nombreUsuario, apellidoUsuario, telefonoUsuario, correoUsuario, contraseñaUsuario, direccionUsuario, ciudad, estado, codigoPostal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userData.nombreUsuario,
        userData.apellidoUsuario,
        userData.telefonoUsuario,
        userData.correoUsuario,
        userData.contraseñaUsuario,
        userData.direccionUsuario,
        userData.ciudad,
        userData.estado,
        userData.codigoPostal,
      ]
    );

    // Borrar datos de la tabla temporal
    await query('DELETE FROM UsuarioTemporal WHERE token = ?', [token]);

    res.status(200).json({ message: 'Cuenta validada con éxito.' });
  } catch (error) {
    console.error('Error al validar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;
