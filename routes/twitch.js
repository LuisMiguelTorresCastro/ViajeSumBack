const express = require('express');
const axios = require('axios');
const router = express.Router();

// Función auxiliar para verificar el token de acceso
async function verifyAccessToken(accessToken) {
  try {
    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': process.env.CLIENT_ID
      }
    });
    return response.data.data.length > 0; // Si el token es válido, devuelve true
  } catch (error) {
    console.error('Error verifying access token:', error);
    return false; // Si hay error, el token no es válido
  }
}

// Redirige al usuario a la URL de autorización de Twitch para iniciar sesión y obtener permisos
router.get('/login', (req, res) => {
  // URL de autorización con parámetros necesarios
  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=user:edit:broadcast`;
  console.log('Redirecting to:', authUrl); // Log para verificar la URL
  res.redirect(authUrl);
});

// Callback para recibir el código de autorización y cambiarlo por un token de acceso
router.get('/callback', async (req, res) => {
  const authCode = req.query.code;  // Obtén el código desde la query

  if (!authCode) {
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    // Solicita el token de acceso a Twitch usando el código de autorización
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: process.env.REDIRECT_URI
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // Verificar si el token de acceso está presente
    if (!accessToken) {
      throw new Error('Access token not received');
    }

    console.log('Authorization Code:', authCode);
    console.log('Client ID:', process.env.CLIENT_ID);
    console.log('Redirect URI:', process.env.REDIRECT_URI);

    // Redirige al frontend con el token
    res.redirect(`http://localhost:4200/Auth/twitch?access_token=${accessToken}`);
  } catch (error) {
    console.error('Error obtaining access token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error obtaining access token', details: error.response?.data || error.message });
  }
});

// Función auxiliar para obtener el Broadcaster ID usando el token de acceso
async function getBroadcasterId(accessToken) {
  try {
    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': process.env.CLIENT_ID
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].id; // Devuelve el ID del broadcaster
    } else {
      throw new Error('Usuario no encontrado o acceso inválido');
    }
  } catch (error) {
    console.error('Error al obtener el ID del broadcaster:', error);
    throw error;
  }
}


// Endpoint para obtener el título actual del stream
router.get('/stream-title', async (req, res) => {
  const accessToken = req.query.access_token; // Obtener el token de acceso desde la query
  
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const broadcasterId = await getBroadcasterId(accessToken); // Obtiene el broadcaster ID usando el token

    const streamResponse = await axios.get(`https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': process.env.CLIENT_ID
      }
    });

    const streamData = streamResponse.data.data[0];
    res.json({ title: streamData.title, game_id: streamData.game_id });
  } catch (error) {
    console.error('Error retrieving stream title:', error);
    res.status(500).json({ error: 'Error retrieving stream title', details: error.response?.data || error.message });
  }
});

router.post('/start-stream', async (req, res) => {
  const { accessToken, title, game_id } = req.body;

  try {
    console.log('Starting stream with:', accessToken, title, game_id);
    
    const broadcasterId = await getBroadcasterId(accessToken); // Obtiene el broadcaster ID usando el token
    console.log('Broadcaster ID:', broadcasterId);

    // Verifica si el token de acceso es válido antes de continuar
    const isTokenValid = await verifyAccessToken(accessToken);
    if (!isTokenValid) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    // Actualiza la transmisión usando el Broadcaster ID
    const response = await axios.patch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`,
      { title, game_id },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': process.env.CLIENT_ID
        }
      }
    );
    console.log('Twitch response:', response.data); // Muestra la respuesta de Twitch
    res.json({ message: 'Stream started successfully' });
  } catch (error) {
    console.error('Error starting stream:', error);
    const errorMessage = error.response?.data || error.message || 'Unknown error';
    res.status(500).json({ error: 'Error starting stream', details: errorMessage });
  }
});


module.exports = router;
