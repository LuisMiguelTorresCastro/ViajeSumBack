const express = require('express');
const router = express.Router();
const query = require('../db');

router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM Experiencias');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener las Experiencias:', error.message);
    res.status(500).json({ error: 'Error al obtener las Experiencias', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT * FROM Experiencias WHERE idExperiencias = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'No se encontró la experiencia con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al obtener la experiencia:', error.message);
    res.status(500).json({ error: 'Error al obtener la experiencia', details: error.message });
  }
});


router.post('/', async (req, res) => {
  const nombre = req.body.nombreExperiencias ? req.body.nombreExperiencias.trim() : '';
  const categoria = req.body.categoria ? req.body.categoria.trim() : null;
  const descripcion = req.body.descripcion ? req.body.descripcion.trim() : null;
  const costo = req.body.costo ? parseFloat(req.body.costo) : null;
  const fechas = req.body.fechas ? req.body.fechas.trim() : null;
  const duracion = req.body.duracion ? req.body.duracion.trim() : null;
  const direccion = req.body.direccion ? req.body.direccion.trim() : null;
  const correo = req.body.correo ? req.body.correo.trim() : null;
  const telefono = req.body.telefono ? parseInt(req.body.telefono, 10) : null;
  const tipo = req.body.tipo ? req.body.tipo.trim() : null;
  const imageUrl = req.body.imageUrl ? req.body.imageUrl.trim() : null;

  const sql = `
    INSERT INTO Experiencias (nombreExperiencias, descripcion, categoria, costo, fechas, duracion, direccion, correo, telefono, tipo, imageUrl) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await query(sql, [nombre, descripcion, categoria, costo, fechas, duracion, direccion, correo, telefono, tipo, imageUrl]);
    res.status(201).json({ message: 'Experiencia insertada correctamente' });
  } catch (error) {
    console.error('Error al insertar la experiencia:', error.message);
    res.status(500).json({ error: 'Error al insertar la experiencia', details: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const nombre = req.body.nombreExperiencias ? req.body.nombreExperiencias.trim() : null;
  const categoria = req.body.categoria ? req.body.categoria.trim() : null;
  const descripcion = req.body.descripcion ? req.body.descripcion.trim() : null;
  const costo = req.body.costo ? parseFloat(req.body.costo) : null;
  const fechas = req.body.fechas ? req.body.fechas.trim() : null;
  const duracion = req.body.duracion ? req.body.duracion.trim() : null;
  const direccion = req.body.direccion ? req.body.direccion.trim() : null;
  const correo = req.body.correo ? req.body.correo.trim() : null;
  const telefono = req.body.telefono ? parseInt(req.body.telefono, 10) : null;
  const tipo = req.body.tipo ? req.body.tipo.trim() : null;
  const imageUrl = req.body.imageUrl ? req.body.imageUrl.trim() : null;
  const idInt = parseInt(id, 10);

  if (isNaN(idInt)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    await query(`UPDATE Experiencias SET nombreExperiencias = ?, descripcion = ?, categoria = ?, costo = ?, fechas = ?, duracion = ?, direccion = ?, correo = ?, telefono = ?, tipo = ?, imageUrl = ?
      WHERE idExperiencias = ?`, [nombre, descripcion, categoria, costo, fechas, duracion, direccion, correo, telefono, tipo, imageUrl, idInt]);
    res.json({ message: 'Experiencia actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la experiencia:', error.message);
    res.status(500).json({ error: 'Error al actualizar la experiencia', details: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    await query('DELETE FROM Experiencias WHERE idExperiencias = ?', [parsedId]);
    res.json({ message: 'Experiencia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la experiencia:', error.message);
    res.status(500).json({ error: 'Error al eliminar la experiencia', details: error.message });
  }
});

module.exports = router;
