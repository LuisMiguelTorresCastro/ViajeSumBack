const express = require('express');
const router = express.Router();
const query = require('../db');  
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { nombreCliente, apellidoCliente, correoCliente, telefonoCliente, password } = req.body;
  
  try {
    if (!nombreCliente || !apellidoCliente || !correoCliente || !telefonoCliente || !password) {
      return res.status(400).json({ error: 'Por favor, rellena todos los campos' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      'INSERT INTO Clientes (nombreCliente, apellidoCliente, correoCliente, telefonoCliente, PasswordHash) VALUES (?, ?, ?, ?, ?)',
      [nombreCliente, apellidoCliente, correoCliente, telefonoCliente, hashedPassword]
    );

    res.json({ message: 'Cliente registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar cliente:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    res.status(500).json({ error: 'Error al registrar cliente', details: error.message });
  }
});

module.exports = router;
