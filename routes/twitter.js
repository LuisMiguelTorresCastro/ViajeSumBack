require('dotenv').config(); // Carga las variables desde el archivo .env

const express = require('express');
const { TwitterApi } = require('twitter-api-v2');
const query = require('../db'); // Asegúrate de que este archivo exporte correctamente la conexión a la base de datos

const router = express.Router();

// Configuración del cliente de Twitter con credenciales desde .env
const client = new TwitterApi({
  appKey: process.env.appKey,
  appSecret: process.env.appSecret,
  accessToken: process.env.accessToken,
  accessSecret: process.env.accessSecret,
});

// Definir la ruta POST para publicar un tweet
router.post('/', async (req, res) => {
  try {
    const { status } = req.body; // Asegúrate de que el cuerpo de la solicitud tenga un campo "status"
    
    // Publicar el tweet
    const tweet = await client.v2.tweet(status);

    const tweetText = tweet.data.text;
    const tweetId = tweet.data.id;

    // Guardar el tweet en la base de datos
    await query('INSERT INTO tweets (tweet_id, tweet_text) VALUES (?, ?)', [tweetId, tweetText]);

    res.json({ message: 'Tweet posted and saved successfully', tweet });
  } catch (error) {
    res.status(500).json({ error: 'Error posting tweet', details: error });
  }
});

// Definir la ruta GET para obtener tweets
router.get('/', async (req, res) => {
  try {
    const tweets = await query('SELECT * FROM tweets ORDER BY created_at DESC');
    res.json(tweets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tweets', details: error });
  }
});

module.exports = router;