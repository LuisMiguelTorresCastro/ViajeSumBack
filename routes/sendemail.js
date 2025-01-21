const express = require('express');
const router = express.Router();
const query = require('../db'); 
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Configura el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// Ruta para enviar correos electrónicos
router.post('/', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
      html: body
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Correo electrónico enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    res.status(500).json({ error: 'Error al enviar el correo electrónico' });
  }
});

module.exports = router;