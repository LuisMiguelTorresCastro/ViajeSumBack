const express = require('express');
const router = express.Router();
const query = require('../db');  // Ajusta la ruta según tu estructura de archivos

// Obtener todas las guías
router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM Guias');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener las guías:', error.message);
    res.status(500).json({ error: 'Error al obtener las guías', details: error.message });
  }
});

// Obtener una guía por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT * FROM Guias WHERE idGuias = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'No se encontró la guía con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al obtener la guía:', error.message);
    res.status(500).json({ error: 'Error al obtener la guía', details: error.message });
  }
});

// Crear una nueva guía
router.post('/', async (req, res) => {
  const { nombreGuias, descripcion } = req.body;

  const sql = `
    INSERT INTO Guias (nombreGuias, descripcion) 
    VALUES (?, ?)
  `;

  try {
    await query(sql, [nombreGuias, descripcion]);
    res.status(201).json({ message: 'Guía insertada correctamente' });
  } catch (error) {
    console.error('Error al insertar la guía:', error.message);
    res.status(500).json({ error: 'Error al insertar la guía', details: error.message });
  }
});

// Actualizar una guía
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombreGuias, descripcion } = req.body;

  try {
    await query(
      `UPDATE Guias SET nombreGuias = ?, descripcion = ?
      WHERE idGuias = ?`,
      [nombreGuias, descripcion, id]
    );
    res.json({ message: 'Guía actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la guía:', error.message);
    res.status(500).json({ error: 'Error al actualizar la guía', details: error.message });
  }
});

// Eliminar una guía
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM Guias WHERE idGuias = ?', [id]);
    res.json({ message: 'Guía eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la guía:', error.message);
    res.status(500).json({ error: 'Error al eliminar la guía', details: error.message });
  }
});

module.exports = router;
