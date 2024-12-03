const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const query = require('../db');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../fileimages');

// Asegúrate de que la carpeta fileimages exista
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configura multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

// Función para manejar errores
const handleError = (res, error, message) => {
    console.error(message, error.message);
    res.status(500).json({ error: message, details: error.message });
};

// Obtener todos los paquetes
router.get('/', async (req, res) => {
    try {
        const results = await query('SELECT * FROM Paquete');
        res.json(results);
    } catch (error) {
        handleError(res, error, 'Error al obtener paquetes');
    }
});

// Obtener un paquete por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await query('SELECT * FROM Paquete WHERE idPaquete = ?', [id]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'No se encontró el paquete con el ID proporcionado' });
        }
    } catch (error) {
        handleError(res, error, 'Error al obtener el paquete');
    }
});

// Crear un nuevo paquete
router.post('/', upload.single('imageFile'), async (req, res) => {
    try {
        const {
            nombrePaquete,
            descripcion,
            categoria,
            costo,
            fechas,
            fechaInicio,
            fechaFin,
            duracion,
            maxParticipantes,
            estado = 'activo',
            descuento,
            popularidad = 0,
            valoracion,
            tipo,
            imageUrl
        } = req.body;

        const imageFilePath = req.file ? req.file.path : null;

        if (!nombrePaquete || costo === null || isNaN(costo)) {
            return res.status(400).json({ error: 'Faltan datos obligatorios o son inválidos.' });
        }

        const sql = `
            INSERT INTO Paquete (
                imageUrl, imageFile, nombrePaquete, descripcion, categoria, costo, fechas, fechaInicio, fechaFin, duracion,
                maxParticipantes, estado, descuento, popularidad, valoracion, tipo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            imageUrl, imageFilePath, nombrePaquete, descripcion, categoria, costo, fechas, fechaInicio, fechaFin, duracion,
            maxParticipantes, estado, descuento, popularidad, valoracion, tipo
        ];

        await query(sql, values);
        res.status(201).json({ message: 'Paquete insertado correctamente' });
    } catch (error) {
        handleError(res, error, 'Error al insertar el paquete');
    }
});

// Actualizar paquete
router.patch('/:id', upload.single('imageFile'), async (req, res) => {
    const { id } = req.params;
    const {
        nombrePaquete,
        descripcion,
        categoria,
        costo,
        fechas,
        fechaInicio,
        fechaFin,
        duracion,
        maxParticipantes,
        estado,
        descuento,
        popularidad,
        valoracion,
        tipo,
        imageUrl
    } = req.body;

    const imageFilePath = req.file ? req.file.path : null;

 try {
        const sql = `
            UPDATE Paquete 
            SET imageUrl = COALESCE(?, imageUrl), imageFile = COALESCE(?, imageFile), nombrePaquete = COALESCE(?, nombrePaquete),
                descripcion = COALESCE(?, descripcion), categoria = COALESCE(?, categoria), costo = COALESCE(?, costo), 
                fechas = COALESCE(?, fechas), fechaInicio = COALESCE(?, fechaInicio), fechaFin = COALESCE(?, fechaFin), 
                duracion = COALESCE(?, duracion), maxParticipantes = COALESCE(?, maxParticipantes), estado = COALESCE(?, estado), 
                descuento = COALESCE(?, descuento), popularidad = COALESCE(?, popularidad), valoracion = COALESCE(?, valoracion), 
                tipo = COALESCE(?, tipo)
            WHERE idPaquete = ?
        `;

        await query(sql, [
            imageUrl, imageFilePath, nombrePaquete, descripcion, categoria, costo, fechas, fechaInicio, fechaFin, duracion,
            maxParticipantes, estado, descuento, popularidad, valoracion, tipo, id
        ]);

        res.json({ message: 'Paquete actualizado correctamente' });
    } catch (error) {
        handleError(res, error, 'Error al actualizar el paquete');
    }
});

// Eliminar un paquete
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        await query('DELETE FROM Paquete WHERE idPaquete = ?', [parsedId]);
        res.json({ message: 'Paquete eliminado correctamente' });
    } catch (error) {
        handleError(res, error, 'Error al eliminar el paquete');
    }
});

router.post('/paquetes', async (req, res) => {
    const query = req.body.query.toLowerCase();

    try {
        if (query.includes('paquete') || query.includes('paquetes')) {
            const paquetes = await query('SELECT * FROM Paquete');
            const listaPaquetes = paquetes.map(p => p.nombrePaquete).join(', ');
            return res.json({ message: `Tenemos los siguientes paquetes disponibles: ${listaPaquetes}` });
        } else if (query.includes('precio') || query.includes('costo')) {
            const paquetes = await query('SELECT nombrePaquete, costo FROM Paquete');
            const listaPrecios = paquetes.map(p => `${p.nombrePaquete}: $${p.costo}`).join(', ');
            return res.json({ message: `Los precios de los paquetes son: ${listaPrecios}` });
        } else if (query.includes('duración') || query.includes('días')) {
            const paquetes = await query('SELECT nombrePaquete, duracion FROM Paquete');
            const listaDuraciones = paquetes.map(p => `${p.nombrePaquete}: ${p.duracion} días`).join(', ');
            return res.json({ message: `Las duraciones de los paquetes son: ${listaDuraciones}` });
        } else if (query.includes('categoría')) {
            const categorias = await query('SELECT DISTINCT categoria FROM Paquete');
            const listaCategorias = categorias.map(c => c.categoria).join(', ');
            return res.json({ message: `Las categorías de paquetes disponibles son: ${listaCategorias}` });
        } else if (query.includes('estado activo')) {
            const paquetesActivos = await query('SELECT * FROM Paquete WHERE estado = "activo"');
            const listaPaquetesActivos = paquetesActivos.map(p => p.nombrePaquete).join(', ');
            return res.json({ message: `Los paquetes activos disponibles son: ${listaPaquetesActivos}` });
        } else if (query.includes('descuento')) {
            const paquetesConDescuento = await query('SELECT nombrePaquete, descuento FROM Paquete WHERE descuento IS NOT NULL AND descuento > 0');
            const listaDescuentos = paquetesConDescuento.map(p => `${p.nombrePaquete}: ${p.descuento}%`).join(', ');
            return res.json({ message: `Los paquetes con descuento son: ${listaDescuentos}` });
        } else if (query.includes('ayuda') || query.includes('información')) {
            return res.json({ message: 'Puedes preguntarme sobre paquetes, precios, duración, categorías, estado de paquetes, o información adicional sobre las experiencias disponibles.' });
        } else {
            return res.json({ message: 'Lo siento, no entendí tu pregunta. Intenta preguntar sobre paquetes, precios, duración, categorías o experiencias.' });
        }
    } catch (error) {
        console.error('Error en la consulta de paquetes:', error.message);
        return res.status(500).json({ error: 'Error en la consulta de paquetes', details: error.message });
    }
});

module.exports = router;