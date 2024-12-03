const express = require('express');
const router = express.Router();
const query = require('../db');

// Obtener todos los restaurantes
router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM Restaurante');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los restaurantes:', error.message);
    res.status(500).json({ error: 'Error al obtener los restaurantes', details: error.message });
  }
});

// Obtener un restaurante por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT * FROM Restaurante WHERE idRestaurante = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'No se encontró el restaurante con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al obtener el restaurante:', error.message);
    res.status(500).json({ error: 'Error al obtener el restaurante', details: error.message });
  }
});

// Crear un nuevo restaurante
router.post('/', async (req, res) => {
  const { imageUrl, nombreRestaurante, descripcion, calificacion, costo, horario, categoria } = req.body;

  const sql = `
    INSERT INTO Restaurante (imageUrl, nombreRestaurante, descripcion, calificacion, costo, categoria) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    await query(sql, [imageUrl, nombreRestaurante, descripcion, calificacion, costo, horario, categoria]);
    res.status(201).json({ message: 'Restaurante insertado correctamente' });
  } catch (error) {
    console.error('Error al insertar el restaurante:', error.message);
    res.status(500).json({ error: 'Error al insertar el restaurante', details: error.message });
  }
});

// Actualizar un restaurante
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { imageUrl, nombreRestaurante, descripcion, calificacion, costo, horario, categoria } = req.body;

  try {
    await query(
      `UPDATE Restaurante SET imageUrl = ?, nombreRestaurante = ?, descripcion = ?, calificacion = ?, costo = ?, categoria = ?
      WHERE idRestaurante = ?`,
      [imageUrl, nombreRestaurante, descripcion, calificacion, costo,categoria, id]
    );
    res.json({ message: 'Restaurante actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el restaurante:', error.message);
    res.status(500).json({ error: 'Error al actualizar el restaurante', details: error.message });
  }
});

// Eliminar un restaurante
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM Restaurante WHERE idRestaurante = ?', [id]);
    res.json({ message: 'Restaurante eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el restaurante:', error.message);
    res.status(500).json({ error: 'Error al eliminar el restaurante', details: error.message });
  }
});

module.exports = router;
