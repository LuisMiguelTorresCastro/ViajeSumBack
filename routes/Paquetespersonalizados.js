const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const query = require('../db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'image/paquetespersonalizados/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM Paquetespersonalizados');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los paquetes personalizados:', error.message);
    res.status(500).json({ error: 'Error al obtener los paquetes personalizados', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT * FROM Paquetespersonalizados WHERE IdPaqPer = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'No se encontró el paquete personalizado con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al obtener el paquete personalizado:', error.message);
    res.status(500).json({ error: 'Error al obtener el paquete personalizado', details: error.message });
  }
});

router.post('/', upload.single('imageFile'), async (req, res) => {
  const nomPaqPer = req.body.nomPaqPer ? req.body.nomPaqPer.trim() : '';
  const desPaqPer = req.body.desPaqPer ? req.body.desPaqPer.trim() : null;
  const prePaqPer = req.body.prePaqPer ? parseFloat(req.body.prePaqPer) : null;
  const idUse = req.body.idUse ? parseInt(req.body.idUse, 10) : null;
  const imageUrl = req.body.imageUrl ? req.body.imageUrl.trim() : null;
  const imageFile = req.file ? req.file.path : null;

  if (!imageUrl && !imageFile) {
    return res.status(400).json({ error: 'Debes proporcionar una URL de imagen o cargar un archivo de imagen' });
  }

  const sql = `
    INSERT INTO Paquetespersonalizados (nomPaqPer, desPaqPer, prePaqPer, fecCre, idUse, imageUrl, imageFile) 
    VALUES (?, ?, ?, NOW(), ?, ?, ?)
  `;

  try {
    await query(sql, [nomPaqPer, desPaqPer, prePaqPer, idUse, imageUrl, imageFile]);
    res.status(201).json({ message: 'Paquete personalizado insertado correctamente' });
  } catch (error) {
    console.error('Error al insertar el paquete personalizado:', error.message);
    res.status(500).json({ error: 'Error al insertar el paquete personalizado', details: error.message });
  }
});

router.patch('/:id', upload.single('imageFile'), async (req, res) => {
  const { id } = req.params;
  const nomPaqPer = req.body.nomPaqPer ? req.body.nomPaqPer.trim() : null;
  const desPaqPer = req.body.desPaqPer ? req.body.desPaqPer.trim() : null;
  const prePaqPer = req.body.prePaqPer ? parseFloat(req.body.prePaqPer) : null;
  const idUse = req.body.idUse ? parseInt(req.body.idUse, 10) : null;
  const imageUrl = req.body.imageUrl ? req.body.imageUrl.trim() : null;
  const imageFile = req.file ? req.file.path : null;
  const idInt = parseInt(id, 10);

  if (isNaN(idInt)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const fieldsToUpdate = {};
  if (nomPaqPer) fieldsToUpdate.nomPaqPer = nomPaqPer;
  if (desPaqPer) fieldsToUpdate.desPaqPer = desPaqPer;
  if (prePaqPer !== null) fieldsToUpdate.prePaqPer = prePaqPer;
  if (idUse !== null) fieldsToUpdate.idUse = idUse;
  if (imageUrl) fieldsToUpdate.imageUrl = imageUrl;
  if (imageFile) fieldsToUpdate.imageFile = imageFile;

  const updateFields = Object.keys(fieldsToUpdate)
    .map(field => `${field} = ?`)
    .join(', ');

  const sql = `UPDATE Paquetespersonalizados SET ${updateFields} WHERE IdPaqPer = ?`;

  try {
    await query(sql, [...Object.values(fieldsToUpdate), idInt]);
    res.json({ message: 'Paquete personalizado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el paquete personalizado:', error.message);
    res.status(500).json({ error: 'Error al actualizar el paquete personalizado', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    await query('DELETE FROM Paquetespersonalizados WHERE IdPaqPer = ?', [parsedId]);
    res.json({ message: 'Paquete personalizado eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el paquete personalizado:', error.message);
    res.status(500).json({ error: 'Error al eliminar el paquete personalizado', details: error.message });
  }
});

module.exports = router;
