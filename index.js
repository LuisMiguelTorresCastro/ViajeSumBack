const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Importar JWT
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const conexion = mysql.createConnection({
  host: 'localhost',
  database: 'BD_ViajeSum',
  user: 'root',
  password: 'Luis0207@'
});

conexion.connect(error => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.get('/agencias', (req, res) => {
  const query = 'SELECT * FROM Agencia';

  conexion.query(query, (error, resultado) => {
    if (error) {
      console.error('Error al obtener las agencias:', error.message);
      return res.status(500).json({ error: 'Error al obtener las agencias', details: error.message });
    }
    res.json(resultado);
  });
});

app.get('/agencias/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Agencia WHERE idAge = ?';

  conexion.query(query, [id], (error, resultado) => {
    if (error) {
      console.error('Error al obtener la agencia:', error.message);
      return res.status(500).json({ error: 'Error al obtener la agencia', details: error.message });
    }
    if (resultado.length > 0) {
      res.json(resultado[0]);
    } else {
      res.status(404).json({ error: 'No se encontró la agencia con el ID proporcionado' });
    }
  });
});

app.post('/agencias', upload.single('imageFile'), (req, res) => {
  const agencia = {
    nomAge: req.body.nomAge,
    desAge: req.body.desAge,
    imageUrl: req.body.imageUrl,
    imageFile: req.file ? req.file.path : null
  };

  const query = 'INSERT INTO Agencia SET ?';

  conexion.query(query, agencia, (error, resultado) => {
    if (error) {
      console.error('Error al insertar la agencia:', error.message);
      return res.status(500).json({ error: 'Error al insertar la agencia', details: error.message });
    }
    res.status(201).json({ message: 'Agencia insertada correctamente' });
  });
});

app.patch('/agencias/:id', upload.single('imageFile'), (req, res) => {
  const { id } = req.params;
  const agencia = {
    nomAge: req.body.nomAge,
    desAge: req.body.desAge,
    imageUrl: req.body.imageUrl,
    imageFile: req.file ? req.file.path : null
  };

  const query = `
    UPDATE Agencia
    SET nomAge = ?, desAge = ?, imageUrl = ?, imageFile = ?
    WHERE idAge = ?
  `;

  conexion.query(query, [agencia.nomAge, agencia.desAge, agencia.imageUrl, agencia.imageFile, id], (error, resultado) => {
    if (error) {
      console.error('Error al actualizar la agencia:', error.message);
      return res.status(500).json({ error: 'Error al actualizar la agencia', details: error.message });
    }
    res.json({ message: 'Agencia actualizada correctamente' });
  });
});

app.delete('/agencias/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Agencia WHERE idAge = ?';

  conexion.query(query, [id], (error, resultado) => {
    if (error) {
      console.error('Error al eliminar la agencia:', error.message);
      return res.status(500).json({ error: 'Error al eliminar la agencia', details: error.message });
    }
    res.json({ message: 'Agencia eliminada correctamente' });
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO Users (Username, PasswordHash) VALUES (?, ?)';
    conexion.query(query, [username, hashedPassword], (error, resultado) => {
      if (error) {
        console.error('Error al registrar el usuario:', error.message);
        return res.status(500).send('Error al registrar el usuario');
      }
      res.status(201).send('Usuario registrado');
    });
  } catch (error) {
    res.status(500).send('Error al registrar el usuario');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'SELECT PasswordHash FROM Users WHERE Username = ?';
    conexion.query(query, [username], async (error, results) => {
      if (error) {
        console.error('Error al obtener el usuario:', error.message);
        return res.status(500).send('Error al iniciar sesión');
      }
      if (results.length === 0) {
        return res.status(400).send('Nombre de usuario o contraseña inválidos');
      }

      const { PasswordHash } = results[0];
      const isMatch = await bcrypt.compare(password, PasswordHash);

      if (!isMatch) {
        return res.status(400).send('Nombre de usuario o contraseña inválidos');
      }

      const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
  } catch (error) {
    res.status(500).send('Error al iniciar sesión');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/ViajeSum/src/app/login/pages/login/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '/ViajeSum/src/app/login/pages/register/register.html'));
});
