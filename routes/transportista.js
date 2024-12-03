const express = require('express');
const router = express.Router();
const query = require('../db');  // Ajusta la ruta según tu estructura de archivos

// Obtener todos los transportistas
router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM Transportista');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los transportistas:', error.message);
    res.status(500).json({ error: 'Error al obtener los transportistas', details: error.message });
  }
});

// Obtener un transportista por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT * FROM Transportista WHERE idTransportista = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'No se encontró el transportista con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al obtener el transportista:', error.message);
    res.status(500).json({ error: 'Error al obtener el transportista', details: error.message });
  }
});

// Crear un nuevo transportista
router.post('/', async (req, res) => {
  const { nombreTransportista, costo, descripcion, telefono } = req.body;

  const sql = `
    INSERT INTO Transportista (nombreTransportista, costo, descripcion, telefono) 
    VALUES (?, ?, ?, ?)
  `;

  try {
    await query(sql, [nombreTransportista, costo, descripcion, telefono]);
    res.status(201).json({ message: 'Transportista insertado correctamente' });
  } catch (error) {
    console.error('Error al insertar el transportista:', error.message);
    res.status(500).json({ error: 'Error al insertar el transportista', details: error.message });
  }
});

// Actualizar un transportista
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombreTransportista, costo, descripcion, telefono } = req.body;

  try {
    await query(
      `UPDATE Transportista SET nombreTransportista = ?, costo = ?, descripcion = ?, telefono = ?
      WHERE idTransportista = ?`,
      [nombreTransportista, costo, descripcion, telefono, id]
    );
    res.json({ message: 'Transportista actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el transportista:', error.message);
    res.status(500).json({ error: 'Error al actualizar el transportista', details: error.message });
  }
});

// Eliminar un transportista
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM Transportista WHERE idTransportista = ?', [id]);
    res.json({ message: 'Transportista eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el transportista:', error.message);
    res.status(500).json({ error: 'Error al eliminar el transportista', details: error.message });
  }
});

module.exports = router;
