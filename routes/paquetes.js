const express = require('express');
const router = express.Router();
const query = require('../db');
const { body, validationResult } = require('express-validator');

// Middleware para manejo de errores global
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).json({ error: 'Error en el servidor', details: err.message });
};

// Obtener todos los paquetes
router.get('/', async (req, res) => {
    try {
        const results = await query('SELECT * FROM Paquete');
        res.json(results);
    } catch (error) {
        console.error('Error al obtener paquetes:', error); 
        res.status(500).json({ error: 'Error al obtener paquetes' }); 
    }
});

// Obtener un paquete por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await query('SELECT * FROM Paquete WHERE idPaquete = ?', [id]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'No se encontró el paquete con el ID proporcionado' });
        }
    } catch (error) {
        console.error('Error al obtener el paquete:', error);
        res.status(500).json({ error: 'Error al obtener el paquete' });
    }
});

// Validaciones para crear un nuevo paquete (adaptadas a la tabla Paquete)
const paqueteValidationRules = [
    body('nombrePaquete').notEmpty().withMessage('El nombre del paquete es obligatorio'),
    body('costo').isNumeric().withMessage('El costo debe ser un número'),
    // ... otras validaciones que necesites
];

// Crear un nuevo paquete
router.post('/', paqueteValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            nombrePaquete,
            descripcion,
            categoria,
            costo,
            estado = 'activo', // Mantener el valor por defecto
            descuento,
            valoracion,
            tipo,
            imageUrl 
        } = req.body;

        const sql = `
            INSERT INTO Paquete (
                imageUrl, nombrePaquete, descripcion, categoria, costo,  estado, descuento, valoracion, tipo 
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            imageUrl, nombrePaquete, descripcion, categoria, costo, estado, descuento, valoracion, tipo
        ];

        await query(sql, values);
        res.status(201).json({ message: 'Paquete insertado correctamente' });
    } catch (error) {
        console.error('Error al insertar el paquete:', error);
        res.status(500).json({ error: 'Error al insertar el paquete' });
    }
});

// Actualizar paquete
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body; 

    try {
        const setClauses = Object.keys(updates)
            .filter(key => updates[key] !== undefined) 
            .map(key => `${key} = ?`)
            .join(', ');

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
        }

        const sql = `UPDATE Paquete SET ${setClauses} WHERE idPaquete = ?`;
        const values = [...Object.values(updates), id];

        await query(sql, values);
        res.json({ message: 'Paquete actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el paquete:', error);
        res.status(500).json({ error: 'Error al actualizar el paquete' });
    }
});

// Eliminar un paquete
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        await query('DELETE FROM Paquete WHERE idPaquete = ?', [parsedId]);
        res.json({ message: 'Paquete eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el paquete:', error);
        res.status(500).json({ error: 'Error al eliminar el paquete' });
    }
});

// ... (código anterior)

// Obtener el historial de compras de un usuario
router.get('/historial/:idUsuario', async (req, res) => {
    const { idUsuario } = req.params;
  
    try {
      const sql = `
        SELECT p.nombrePaquete, p.descripcion, p.costo, p.imageUrl, c.fechaCompra
        FROM Compras c
        INNER JOIN Paquete p ON c.idPaquete = p.idPaquete
        WHERE c.idUsuario = ?
        ORDER BY c.fechaCompra DESC
      `;
      const results = await query(sql, [idUsuario]);
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'No se encontró historial de compras para este usuario.' });
      }
  
      res.json(results);
    } catch (error) {
      console.error('Error al obtener el historial de compras:', error);
      res.status(500).json({ error: 'Error al obtener el historial de compras' });
    }
  });
  
router.use(errorHandler);

module.exports = router;