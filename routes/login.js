// routes/login.js

const express = require('express');
const router = express.Router();
const query = require('../db'); // Asegúrate de que esto está bien
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    const { correoUsuario, contraseñaUsuario } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!correoUsuario || !contraseñaUsuario) {
        return res.status(400).json({ message: 'Por favor, completa todos los campos requeridos.' });
    }

    try {
        // Buscar el usuario por correo
        const userQuery = 'SELECT * FROM Usuario WHERE correoUsuario = ?';
        const userResults = await query(userQuery, [correoUsuario]);

        if (userResults.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = userResults[0];

        // Comparar la contraseña proporcionada con el hash almacenado
        const match = await bcrypt.compare(contraseñaUsuario, user.contraseñaUsuario);
        if (!match) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Consulta para verificar si el usuario tiene el rol de "Admin"
        const roleQuery = `
            SELECT r.nombreRol 
            FROM Rol r 
            JOIN UsuarioRol ur ON ur.idRol = r.idRol 
            WHERE ur.idUsuario = ? AND r.nombreRol = 'Admin'`;

        const roleResults = await query(roleQuery, [user.idUsuario]);
        const isAdmin = roleResults.length > 0; // Si se encuentra "Admin" en los roles, `isAdmin` será true

        // Generar un token JWT
        const token = jwt.sign(
            { userId: user.idUsuario, isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            userId: user.idUsuario,
            isAdmin,
            rol: isAdmin ? 'admin' : 'cliente', // Asegúrate de devolver el rol aquí
            token,
        });
    } catch (error) {
        console.error('Error al procesar la solicitud de inicio de sesión:', error);
        return res.status(500).json({ message: 'Error al iniciar sesión.', details: error.message });
    }
});


module.exports = router;