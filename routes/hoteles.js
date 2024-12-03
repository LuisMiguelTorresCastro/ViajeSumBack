const express = require('express');
const axios = require('axios');
const router = express.Router();

// Ruta para obtener los hoteles
router.get('/', async (req, res) => {
  const url = 'https://sky-scanner3.p.rapidapi.com/hotels/detail?id=eyJlbnRpdHlJZCI6IjI3NTM3NTQyIiwiaWQiOiI0Njk0NDY1MyJ9';  // Cambia el entityId si es necesario

  try {
    const response = await axios.get(url, {
      headers: {
        'x-rapidapi-host': 'sky-scanner3.p.rapidapi.com',  // Host de la API
        'x-rapidapi-key': '8f579d656emsh307773b0c85b730p1da4bdjsn03b19ba2cb0c',  // Reemplaza con tu clave de RapidAPI
      }
    });
    
    // Devuelve los datos obtenidos de la API al cliente
    res.json(response.data);
  } catch (error) {
    console.error('Error al hacer la solicitud:', error);
    res.status(500).send('Error al obtener los datos de los hoteles');
  }
});

module.exports = router;
