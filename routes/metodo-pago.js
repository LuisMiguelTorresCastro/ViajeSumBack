// En el archivo de rutas, por ejemplo, `routes/metodosPago.js`
const express = require('express');
const router = express.Router();
const query = require('../db');

// Obtener todos los métodos de pago
router.get('/', async (req, res) => {
    try {
        const metodosPago = await query('SELECT * FROM MetodoPago');
        res.json(metodosPago);
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error.message);
        res.status(500).json({ error: 'Error al obtener métodos de pago', details: error.message });
    }
});
router.post('/pago', async (req, res) => {
    const { idReserva, idMetodoPago, monto } = req.body;
    try {
        await query('INSERT INTO Pago (idReserva, idMetodoPago, monto, estado) VALUES (?, ?, ?, "pendiente")', [idReserva, idMetodoPago, monto]);
        res.json({ message: 'Pago registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar el pago:', error.message);
        res.status(500).json({ error: 'Error al registrar el pago', details: error.message });
    }
});

// Obtener métodos de pago disponibles
router.get('/metodos-pago', async (req, res) => {
    try {
        const results = await query('SELECT * FROM MetodoPago WHERE estado = "activo"');
        res.json(results);
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error.message);
        res.status(500).json({ error: 'Error al obtener métodos de pago', details: error.message });
    }
});
module.exports = router;
