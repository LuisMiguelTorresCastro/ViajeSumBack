const express = require('express');
const router = express.Router();
const query = require('../db'); 

router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM Agencia');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener las agencias:', error.message);
    res.status(500).json({ error: 'Error al obtener las agencias', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT * FROM Agencia WHERE idAgencia = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'No se encontró la agencia con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al obtener la agencia:', error.message);
    res.status(500).json({ error: 'Error al obtener la agencia', details: error.message });
  }
});

router.post('/', async (req, res) => {
  const nombreAgencia = req.body.nombreAgencia !== undefined ? req.body.nombreAgencia.trim() : '';
  const descripcion = req.body.descripcion !== undefined ? req.body.descripcion.trim() : '';
  const imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl.trim() : null;
  const correo = req.body.correo !== undefined ? req.body.correo.trim() : null;
  const telefono = req.body.telefono !== undefined ? req.body.telefono.trim() : null;
  const direccion = req.body.direccion !== undefined ? req.body.direccion.trim() : null;

  const sql = `
    INSERT INTO Agencia (nombreAgencia, descripcion, imageUrl, correo, telefono, direccion) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    await query(sql, [nombreAgencia, descripcion, imageUrl, correo, telefono, direccion]);
    res.status(201).json({ message: 'Agencia insertada correctamente' });
  } catch (error) {
    console.error('Error al insertar la agencia:', error.message);
    res.status(500).json({ error: 'Error al insertar la agencia', details: error.message });
  }
});


router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('ID recibido:', id);

  const nombreAgencia = req.body.nombreAgencia !== undefined ? req.body.nombreAgencia.trim() : null;
  const descripcion = req.body.descripcion !== undefined ? req.body.descripcion.trim() : null;
  const imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl.trim() : null;
  const correo = req.body.correo !== undefined ? req.body.correo.trim() : null;
  const telefono = req.body.telefono !== undefined ? Number(req.body.telefono) : null;
  const direccion = req.body.direccion !== undefined ? req.body.direccion.trim() : null;

  const idInt = parseInt(id, 10);
  if (isNaN(idInt)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  console.log('ID convertido:', idInt);
  console.log('Datos de la agencia:', { nombreAgencia, descripcion, imageUrl, correo, telefono, direccion });

  try {
    await query(`UPDATE Agencia SET nombreAgencia = ?, descripcion = ?, imageUrl = ?, correo = ?, telefono = ?, direccion = ?
      WHERE idAgencia = ?`, [nombreAgencia, descripcion, imageUrl, correo, telefono, direccion, idInt]);
    res.json({ message: 'Agencia actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la agencia:', error.message);
    res.status(500).json({ error: 'Error al actualizar la agencia', details: error.message });
  }
});



router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`ID recibido: ${id}`);
  try {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    await query('DELETE FROM Agencia WHERE idAgencia = ?', [parsedId]);
    res.json({ message: 'Agencia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la agencia:', error.message);
    res.status(500).json({ error: 'Error al eliminar la agencia', details: error.message });
  }
});

module.exports = router;
