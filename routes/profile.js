// routes/profile.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que este archivo esté correctamente configurado

// Obtener todos los usuarios
router.get('/usuarios', (req, res) => {
    const query = 'SELECT * FROM Usuario';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener usuarios.' });
        res.json(results);
    });
});

// Crear un nuevo usuario
router.post('/usuarios', (req, res) => {
    const { nombreUsuario, apellidoUsuario, telefonoUsuario, correoUsuario, contraseñaUsuario } = req.body;
    const query = 'INSERT INTO Usuario (nombreUsuario, apellidoUsuario, telefonoUsuario, correoUsuario, contraseñaUsuario) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nombreUsuario, apellidoUsuario, telefonoUsuario, correoUsuario, contraseñaUsuario], (err) => {
        if (err) return res.status(500).json({ message: 'Error al crear el usuario.' });
        res.status(201).json({ message: 'Usuario creado exitosamente.' });
    });
});

// Actualizar un usuario
router.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombreUsuario, apellidoUsuario, telefonoUsuario } = req.body;
    const query = 'UPDATE Usuario SET nombreUsuario = ?, apellidoUsuario = ?, telefonoUsuario = ? WHERE idUsuario = ?';
    db.query(query, [nombreUsuario, apellidoUsuario, telefonoUsuario, id], (err) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar el usuario.' });
        res.json({ message: 'Usuario actualizado exitosamente.' });
    });
});

// Eliminar un usuario
router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Usuario WHERE idUsuario = ?';
    db.query(query, [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar el usuario.' });
        res.json({ message: 'Usuario eliminado exitosamente.' });
    });
});

// Obtener todas las direcciones de un usuario
router.get('/usuarios/:id/direcciones', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Direccion WHERE idUsuario = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener direcciones.' });
        res.json(results);
    });
});

// Crear una nueva dirección
router.post('/usuarios/:id/direcciones', (req, res) => {
    const { id } = req.params;
    const { direccion, ciudad, estado, codigoPostal } = req.body;
    const query = 'INSERT INTO Direccion (idUsuario, direccion, ciudad, estado, codigoPostal) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [id, direccion, ciudad, estado, codigoPostal], (err) => {
        if (err) return res.status(500).json({ message: 'Error al crear la dirección.' });
        res.status(201).json({ message: 'Dirección creada exitosamente.' });
    });
});

// Actualizar una dirección
router.put('/direcciones/:id', (req, res) => {
    const { id } = req.params;
    const { direccion, ciudad, estado, codigoPostal } = req.body;
    const query = 'UPDATE Direccion SET direccion = ?, ciudad = ?, estado = ?, codigoPostal = ? WHERE idDireccion = ?';
    db.query(query, [direccion, ciudad, estado, codigoPostal, id], (err) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar la dirección.' });
        res.json({ message: 'Dirección actualizada exitosamente.' });
    });
});

// Eliminar una dirección
router.delete('/direcciones/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Direccion WHERE idDireccion = ?';
    db.query(query, [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar la dirección.' });
        res.json({ message: 'Dirección eliminada exitosamente.' });
    });
});

module.exports = router;
