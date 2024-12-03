const express = require('express');
const fetch = require('node-fetch'); // Asegúrate de instalar node-fetch o usa axios
const router = express.Router();

// Ruta para obtener puntos de interés en Dolores Hidalgo
router.get('/location', async (req, res) => {
    const query = `
        [out:json];
        node(around:5000, 21.157916447386445, -100.93433955210766)
          ["tourism"="hotel"];
        node(around:5000, 21.157916447386445, -100.93433955210766)
          ["tourism"="museum"];
        node(around:5000, 21.157916447386445, -100.93433955210766)
          ["amenity"="place_of_worship"];
        out;
    `;

    try {
        // Realizar la solicitud a Overpass API
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();

        // Enviar la respuesta con los datos obtenidos
        res.json({
            message: 'Puntos de interés turístico en Dolores Hidalgo',
            locations: data.elements.map(element => ({
                lat: element.lat,
                lon: element.lon,
                name: element.tags.name || 'Punto de Interés',
                type: element.tags.tourism || element.tags.amenity
            }))
        });
    } catch (error) {
        console.error('Error al obtener puntos de interés:', error);
        res.status(500).json({ message: 'Error al obtener puntos de interés turísticos.' });
    }
});

module.exports = router;
