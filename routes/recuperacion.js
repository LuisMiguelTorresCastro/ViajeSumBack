const express = require('express');
const router = express.Router();
const query = require('../db'); 
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Configura el transporter de Nodemailer (Debería ser configurado solo una vez, preferiblemente al inicio de la app)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para generar un token de 5 dígitos
function generarToken() {
    const min = 10000;
    const max = 99999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para enviar el correo electrónico con el token de recuperación
async function enviarCorreoRecuperacion(correoElectronico, token) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correoElectronico,
        subject: 'Recuperación de contraseña',
        html: `<p>Tu token de recuperación es: <b>${token}</b></p>`
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Correo electrónico enviado:', info.messageId);
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw error; // Propaga el error para que sea manejado por el llamador
    }
}

// 1. RUTA PARA SOLICITAR LA RECUPERACIÓN DE CONTRASEÑA
router.post('/solicitar-recuperacion', async (req, res) => {
    const { correoElectronico } = req.body;

    try {
        // Verifica si el correo electrónico existe en la base de datos
        const results = await query('SELECT * FROM Usuario WHERE correoElectronico = ?', [correoElectronico]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Correo electrónico no encontrado' });
        }

        // Genera un token único
        const token = generarToken();

        // Establece una fecha de expiración para el token (5 minutos desde ahora)
        const fechaExpiracion = new Date();
        fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 5);

        // Guarda el token en la base de datos junto con el correo electrónico y la fecha de expiración
        await query('INSERT INTO TokenTemporal (token, correoElectronico, fechaExpiracion) VALUES (?, ?, ?)', [token, correoElectronico, fechaExpiracion]);

        // Envía el correo electrónico con el token
        await enviarCorreoRecuperacion(correoElectronico, token);

        // Elimina el token después de 5 minutos
        setTimeout(async () => {
            try {
                await query('DELETE FROM TokenTemporal WHERE token = ?', [token]);
                console.log('Token eliminado:', token);
            } catch (error) {
                console.error('Error al eliminar el token:', error);
            }
        }, 5 * 60 * 1000);

        res.json({ message: 'Se ha enviado un correo electrónico con instrucciones para recuperar tu contraseña' });

    } catch (error) {
        console.error('Error al solicitar recuperación de contraseña:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// 2. RUTA PARA VERIFICAR EL TOKEN
router.post('/verificar-token', async (req, res) => {
    const { correoElectronico, token } = req.body;

    try {
        // Busca el token en la base de datos
        const results = await query('SELECT * FROM TokenTemporal WHERE correoElectronico = ? AND token = ? AND fechaExpiracion > NOW()', [correoElectronico, token]);

        if (results.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        // Si el token es válido, elimina el token de la base de datos
        await query('DELETE FROM TokenTemporal WHERE token = ?', [token]);

        // Responde con un indicador de que el token es válido
        res.json({ message: 'Token válido', tokenValido: true });

    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(500).json({ error: 'Error al verificar el token' });
    }
});

// 3. RUTA PARA CAMBIAR LA CONTRASEÑA
router.post('/cambiar-contrasena', async (req, res) => {
    const { correoElectronico, nuevaContrasena } = req.body;

    try {
        // Verifica que la nueva contraseña sea válida
        if (!nuevaContrasena || nuevaContrasena.length < 8) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
        }

        // Encripta la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualiza la contraseña en la base de datos
        const updateUsuarioResult = await query('UPDATE Usuario SET contraseñaUsuario = ? WHERE correoElectronico = ?', [hashedPassword, correoElectronico]);

        if (updateUsuarioResult.affectedRows === 1) {
            res.json({ message: 'Contraseña actualizada correctamente' });
        } else {
            res.status(500).json({ error: 'Error al actualizar la contraseña' });
        }

    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).json({ error: 'Error al cambiar la contraseña', details: error.message });
    }
});

module.exports = router;