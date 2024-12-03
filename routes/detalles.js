const express = require('express');
const router = express.Router();
const query = require('../db');

// Obtener todos los paquetes
router.get('/paquetes', async (req, res) => {
    try {
        const results = await query('SELECT * FROM Paquete WHERE estado = "activo"');
        res.json(results);
    } catch (error) {
        console.error('Error al obtener paquetes:', error.message);
        res.status(500).json({ error: 'Error al obtener paquetes', details: error.message });
    }
});

// Obtener detalles de un paquete específico por ID
router.get('/paquetes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await query('SELECT * FROM Paquete WHERE idPaquete = ?', [id]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'No se encontró el paquete con el ID proporcionado' });
        }
    } catch (error) {
        console.error('Error al obtener el paquete:', error.message);
        res.status(500).json({ error: 'Error al obtener el paquete', details: error.message });
    }
});



// Realizar un pago para una reserva


module.exports = router;
