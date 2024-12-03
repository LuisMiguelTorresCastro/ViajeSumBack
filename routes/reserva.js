const express = require('express');
const router = express.Router();
const query = require('../db');


// Crear una nueva reserva para un usuario autenticado
router.post('/', async (req, res) => {
    const { idUsuario, idPaquete, metodoPagoId } = req.body;

    // Validar que todos los parámetros estén definidos
    if (idUsuario === undefined || idPaquete === undefined || metodoPagoId === undefined) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const result = await query('INSERT INTO Reserva (idUsuario, idPaquete, metodoPagoId) VALUES (?, ?, ?)', [idUsuario, idPaquete, metodoPagoId]);
        res.json({ message: 'Reserva creada con éxito', idReserva: result.insertId });
    } catch (error) {
        console.error('Error al crear la reserva:', error.message);
        res.status(500).json({ error: 'Error al crear la reserva', details: error.message });
    }
});
module.exports = router;
