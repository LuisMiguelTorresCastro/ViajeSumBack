const express = require('express');
const router = express.Router();
const query = require('../db');

// ------------------------------------------------------------------
// Rutas para Usuarios
// ------------------------------------------------------------------

// 1. Mostrar todos los usuarios registrados (sin datos sensibles)
router.get('/usuarios', async (req, res) => {
  try {
    const sql = `
      SELECT
          idUsuario,
          nombreUsuario,
          apellidoUsuario,
          telefonoUsuario,
          correoElectronico,
          ciudad,
          estado,
          codigoPostal,
          rolUsuario,
          provider,
          DATE(created_at) AS fecha_registro
      FROM
          Usuario;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener los usuarios', details: error.message });
  }
});

// 2. Ver los datos de un usuario específico (sin datos sensibles)
router.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT
          idUsuario,
          nombreUsuario,
          apellidoUsuario,
          telefonoUsuario,
          correoElectronico,
          direccionUsuario,
          ciudad,
          estado,
          codigoPostal,
          rolUsuario,
          provider,
          created_at
      FROM
          Usuario
      WHERE
          idUsuario = ?;
    `;
    const results = await query(sql, [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'No se encontró el usuario con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al obtener el usuario:', error.message);
    res.status(500).json({ error: 'Error al obtener el usuario', details: error.message });
  }
});

// 3. Ver los usuarios que se registraron en un rango de fechas específico
router.get('/usuarios/registrados-entre/:fechaInicio/:fechaFin', async (req, res) => {
  const { fechaInicio, fechaFin } = req.params;
  try {
    const sql = `
      SELECT
          idUsuario,
          nombreUsuario,
          apellidoUsuario,
          telefonoUsuario,
          correoElectronico,
          ciudad,
          estado,
          codigoPostal,
          rolUsuario,
          provider,
          created_at
      FROM
          Usuario
      WHERE
          created_at BETWEEN ? AND ?;
    `;
    const results = await query(sql, [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`]);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener los usuarios', details: error.message });
  }
});

// 4. Ver los usuarios actualizados en un rango de fechas específico (asumiendo una columna `updated_at`)
router.get('/usuarios/actualizados-entre/:fechaInicio/:fechaFin', async (req, res) => {
  const { fechaInicio, fechaFin } = req.params;
  try {
    // Con columna updated_at (Recomendado)
    const sql = `
        SELECT
            idUsuario,
            nombreUsuario,
            apellidoUsuario,
            telefonoUsuario,
            correoElectronico,
            ciudad,
            estado,
            codigoPostal,
            rolUsuario,
            provider,
            updated_at
        FROM
            Usuario
        WHERE
            updated_at BETWEEN ? AND ?;
        `;

    // Sin columna updated_at (Menos preciso)
    /*
    const sql = `
      SELECT
          idUsuario,
          nombreUsuario,
          apellidoUsuario,
          telefonoUsuario,
          correoElectronico,
          ciudad,
          estado,
          codigoPostal,
          rolUsuario,
          provider,
          created_at
      FROM
          Usuario
      WHERE
          created_at BETWEEN ? AND ?;
    `;
    */
    const results = await query(sql, [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`]);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener los usuarios', details: error.message });
  }
});

// 8. Contar cuántos usuarios hay de cada rol
router.get('/usuarios/contar-por-rol', async (req, res) => {
  try {
    const sql = `
      SELECT
          rolUsuario,
          COUNT(*) AS cantidad
      FROM
          Usuario
      GROUP BY
          rolUsuario;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error al contar usuarios por rol:', error.message);
    res.status(500).json({ error: 'Error al contar usuarios por rol', details: error.message });
  }
});

// 11. Ver los usuarios que se registraron con Google
router.get('/usuarios/registrados-con-google', async (req, res) => {
  try {
    const sql = `
      SELECT
          idUsuario,
          nombreUsuario,
          apellidoUsuario,
          correoElectronico
      FROM
          Usuario
      WHERE
          provider = 'google';
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener los usuarios', details: error.message });
  }
});

// ------------------------------------------------------------------
// Rutas para Paquetes
// ------------------------------------------------------------------

// 5. Ver todos los paquetes
router.get('/paquetes', async (req, res) => {
  try {
    const sql = `
      SELECT
          idPaquete,
          nombrePaquete,
          descripcion,
          categoria,
          costo,
          estado,
          descuento,
          valoracion,
          tipo,
          imageUrl,
          DATE(created_at) AS fecha_creacion
      FROM
          Paquete;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener los paquetes:', error.message);
    res.status(500).json({ error: 'Error al obtener los paquetes', details: error.message });
  }
});

// 9. Encontrar el paquete más caro
router.get('/paquetes/mas-caro', async (req, res) => {
  try {
    const sql = `
      SELECT
          idPaquete,
          nombrePaquete,
          costo
      FROM
          Paquete
      ORDER BY
          costo DESC
      LIMIT 1;
    `;
    const results = await query(sql);
    res.json(results[0]); // Devuelve solo el paquete más caro
  } catch (error) {
    console.error('Error al obtener el paquete más caro:', error.message);
    res.status(500).json({ error: 'Error al obtener el paquete más caro', details: error.message });
  }
});

// ------------------------------------------------------------------
// Rutas para Agencias
// ------------------------------------------------------------------

// 6. Ver todas las agencias
router.get('/agencias', async (req, res) => {
  try {
    const sql = `
      SELECT
          idAgencia,
          nombreAgencia,
          descripcion,
          imageUrl,
          correo,
          telefono,
          direccion,
          DATE(created_at) AS fecha_creacion
      FROM
          Agencia;
    `;
    const results = await query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener las agencias:', error.message);
    res.status(500).json({ error: 'Error al obtener las agencias', details: error.message });
  }
});

// 10. Encontrar la agencia con el nombre que contiene una palabra clave
router.get('/agencias/buscar/:palabraClave', async (req, res) => {
  const { palabraClave } = req.params;
  try {
    const sql = `
      SELECT
          idAgencia,
          nombreAgencia
      FROM
          Agencia
      WHERE
          nombreAgencia LIKE ?;
    `;
    const results = await query(sql, [`%${palabraClave}%`]);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar agencias:', error.message);
    res.status(500).json({ error: 'Error al buscar agencias', details: error.message });
  }
});
// ------------------------------------------------------------------
// Rutas para Tweets
// ------------------------------------------------------------------
// 7. Ver todos los tweets:
router.get('/tweets', async (req, res) => {
    try {
        const sql = `
        SELECT
            id,
            tweet_id,
            tweet_text,
            created_at
        FROM
            tweets;
        `;
        const results = await query(sql);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener los tweets:', error.message);
        res.status(500).json({ error: 'Error al obtener los tweets', details: error.message });
    }
});

module.exports = router;