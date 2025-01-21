const express = require('express');
const router = express.Router();
const query = require('../db'); 
const bcrypt = require('bcrypt'); // Asegúrate de tener bcrypt instalado: npm install bcrypt
const nodemailer = require('nodemailer'); 
const token = generateToken();

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});
function generateToken() {
  const min = 10000; // Número mínimo de 5 dígitos
  const max = 99999; // Número máximo de 5 dígitos
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// GET all users
router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM Usuario');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener los usuarios', details: error.message });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT * FROM Usuario WHERE idUsuario = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'No se encontró el usuario con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al obtener el usuario:', error.message);
    res.status(500).json({ error: 'Error al obtener el usuario', details: error.message });
  }
});

router.post('/', async (req, res) => {
  const nombreUsuario = req.body.nombreUsuario;
  const apellidoUsuario = req.body.apellidoUsuario;
  const telefonoUsuario = req.body.telefonoUsuario;
  const correoElectronico = req.body.correoElectronico;
  const contraseñaUsuario = req.body.contraseñaUsuario; 
  const direccionUsuario = req.body.direccionUsuario;
  const ciudad = req.body.ciudad;
  const estado = req.body.estado;
  const codigoPostal = req.body.codigoPostal;

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseñaUsuario, 10); 

    // Generar un token único 

    // Guardar el usuario en la tabla UsuarioTemporal
    const sqlTemp = `
      INSERT INTO UsuarioTemporal (nombreUsuario, apellidoUsuario, telefonoUsuario, correoElectronico, contraseñaUsuario, direccionUsuario, ciudad, estado, codigoPostal, token) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await query(sqlTemp, [nombreUsuario, apellidoUsuario, telefonoUsuario, correoElectronico, hashedPassword, direccionUsuario, ciudad, estado, codigoPostal, token]);

    // Enviar correo electrónico de verificación (reemplaza con tu dominio)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correoElectronico,
      subject: 'Verificación de cuenta',
      html: `
        <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Código de Verificación</title>
  <style>
    body {
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f0f0;
      margin: 0;
    }
    .container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h1 {
      font-size: 2.5em;
      color: #333333;
      margin-bottom: 20px;
    }
    p {
      font-size: 1.2em;
      color: #555555;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Tu código de verificación es:</p>
    <h1>${token}</h1>
    <p>Gracias por registrarte!</p>
  </div>
</body>
</html>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Mensaje enviado:', info.messageId);
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
    }

    res.status(201).json({ message: 'Usuario registrado. Revisa tu correo electrónico para verificar tu cuenta.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('correoElectronico')) {
        return res.status(409).json({ error: 'El correo electrónico ya está en uso' });
      } 
    }
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario', details: error.message });
  }
});
//post
router.post('/verificar', async (req, res) => {
  const { token, correoElectronico } = req.body;

  try {
    // Buscar el usuario en la tabla UsuarioTemporal
    const results = await query('SELECT * FROM UsuarioTemporal WHERE token = ? AND correoElectronico = ?', [token, correoElectronico]);

    if (results.length > 0) {
      const usuario = results[0];

      // Insertar el usuario en la tabla Usuario con rol 'cliente' por defecto
      const sql = `
        INSERT INTO Usuario (nombreUsuario, apellidoUsuario, telefonoUsuario, correoElectronico, contraseñaUsuario, direccionUsuario, ciudad, estado, codigoPostal, rolUsuario) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'cliente')
      `;
      await query(sql, [usuario.nombreUsuario, usuario.apellidoUsuario, usuario.telefonoUsuario, usuario.correoElectronico, usuario.contraseñaUsuario, usuario.direccionUsuario, usuario.ciudad, usuario.estado, usuario.codigoPostal]);

      // Eliminar el usuario de la tabla UsuarioTemporal
      await query('DELETE FROM UsuarioTemporal WHERE token = ?', [token]);

      res.json({ message: 'Cuenta verificada correctamente' });
    } else {
      res.status(404).json({ error: 'Token o correo electrónico inválido' });
    }
  } catch (error) {
    console.error('Error al verificar la cuenta:', error);
    res.status(500).json({ error: 'Error al verificar la cuenta', details: error.message });
  }
});
router.post('/registrar-admin', async (req, res) => {
  const {
    nombreUsuario,
    apellidoUsuario,
    telefonoUsuario,
    correoElectronico,
    contraseñaUsuario,
    direccionUsuario,
    ciudadUsuario, // Cambiado de 'ciudad' a 'ciudadUsuario'
    estadoUsuario, // Cambiado de 'estado' a 'estadoUsuario'
    codigoPostalUsuario, // Cambiado de 'codigoPostal' a 'codigoPostalUsuario'
  } = req.body;

  // Validación: Asegurar que los campos requeridos están presentes
  if (!nombreUsuario || !apellidoUsuario || !telefonoUsuario || !correoElectronico || !contraseñaUsuario) {
    return res.status(400).json({ error: 'Los campos nombreUsuario, apellidoUsuario, telefonoUsuario, correoElectronico y contraseñaUsuario son obligatorios' });
  }

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseñaUsuario, 10);

    // Asignar null a los campos opcionales si no están presentes
    const direccion = direccionUsuario || null;
    const ciudad = ciudadUsuario || null;
    const estado = estadoUsuario || null;
    const codigoPostal = codigoPostalUsuario || null;

    // Insertar el usuario en la tabla Usuario con rol 'admin'
    const sql = `
      INSERT INTO Usuario (nombreUsuario, apellidoUsuario, telefonoUsuario, correoElectronico, contraseñaUsuario, direccionUsuario, ciudad, estado, codigoPostal, rolUsuario) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin')
    `;
    await query(sql, [nombreUsuario, apellidoUsuario, telefonoUsuario, correoElectronico, hashedPassword, direccion, ciudad, estado, codigoPostal]);

    res.status(201).json({ message: 'Administrador registrado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('correoElectronico')) {
        return res.status(409).json({ error: 'El correo electrónico ya está en uso' });
      }
    }
    console.error('Error al registrar el administrador:', error);
    res.status(500).json({ error: 'Error al registrar el administrador', details: error.message });
  }
});

// PUT (update) an existing user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const nombreUsuario = req.body.nombreUsuario;
  const apellidoUsuario = req.body.apellidoUsuario;
  const telefonoUsuario = req.body.telefonoUsuario;
  const correoElectronico = req.body.correoElectronico;
  let contraseñaUsuario = req.body.contraseñaUsuario; 
  const direccionUsuario = req.body.direccionUsuario;
  const ciudad = req.body.ciudad;
  const estado = req.body.estado;
  const codigoPostal = req.body.codigoPostal;

  try {
    // Hashear la contraseña solo si se proporciona una nueva
    if (contraseñaUsuario) {
      contraseñaUsuario = await bcrypt.hash(contraseñaUsuario, 10);
    }

    const sql = `
      UPDATE Usuario 
      SET nombreUsuario = ?, apellidoUsuario = ?, telefonoUsuario = ?, correoElectronico = ?, contraseñaUsuario = ?, direccionUsuario = ?, ciudad = ?, estado = ?, codigoPostal = ?
      WHERE idUsuario = ?
    `;

    await query(sql, [nombreUsuario, apellidoUsuario, telefonoUsuario, correoElectronico, contraseñaUsuario, direccionUsuario, ciudad, estado, codigoPostal, id]);
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error.message);
    res.status(500).json({ error: 'Error al actualizar el usuario', details: error.message });
  }
});

// DELETE a user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM Usuario WHERE idUsuario = ?', [id]);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error.message);
    res.status(500).json({ error: 'Error al eliminar el usuario', details: error.message });
  }
});

module.exports = router;