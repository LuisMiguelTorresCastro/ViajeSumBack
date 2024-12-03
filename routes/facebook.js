const express = require('express');
const axios = require('axios'); // Para hacer solicitudes a la API de Facebook
const query = require('../db'); // Archivo donde configuras tu conexión a la base de datos
const bcrypt = require('bcrypt'); // Para generar una contraseña encriptada

const router = express.Router();

// Configuración de tu app de Facebook
const appId = '4035272223372521';

// Función para dividir el nombre completo en nombre y apellido
function dividirNombreCompleto(nombreCompleto) {
  const partes = nombreCompleto.split(' ');
  const nombre = partes[0];
  const apellido = partes.slice(1).join(' ') || '';
  return { nombre, apellido };
}

// Ruta para el inicio de sesión con Facebook
router.post('/', async (req, res) => {
  try {
    const { accessToken, userID } = req.body; // Recibe el token de acceso y userID desde el cliente

    // Verificar el token de Facebook
    const facebookResponse = await axios.get(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`);

    if (facebookResponse.data.data.is_valid) {
      // Token válido, obtener los datos del perfil del usuario
      const userInfoResponse = await axios.get(`https://graph.facebook.com/${userID}?fields=id,name,email&access_token=${accessToken}`);

      const { id, name, email } = userInfoResponse.data;

      // Dividir el nombre en nombre y apellido
      const { nombre, apellido } = dividirNombreCompleto(name);

      // Generar una contraseña aleatoria encriptada
      const contraseñaGenerada = await bcrypt.hash(id, 10); // Usamos el `id` de Facebook como base para la contraseña

      // Insertar o actualizar el usuario en la tabla 'Usuario'
      await query(
        `INSERT INTO Usuario (nombreUsuario, apellidoUsuario, telefonoUsuario, correoUsuario, contraseñaUsuario, fechaUltimoLogin) 
        VALUES (?, ?, NULL, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE nombreUsuario = VALUES(nombreUsuario), apellidoUsuario = VALUES(apellidoUsuario), fechaUltimoLogin = NOW()`,
        [nombre, apellido, email, contraseñaGenerada]
      );

      res.json({ message: 'Usuario autenticado y registrado con éxito', user: { nombre, apellido, email } });
    } else {
      res.status(401).json({ message: 'Token de Facebook no válido' });
    }
  } catch (error) {
    console.error('Error al autenticar con Facebook:', error);
    res.status(500).json({ error: 'Error al autenticar con Facebook', details: error.message });
  }
});

// Ruta GET para obtener los usuarios registrados
router.get('/', async (req, res) => {
  try {
    const usuarios = await query('SELECT * FROM Usuario ORDER BY fechaRegistro DESC');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios', details: error });
  }
});

module.exports = router;
