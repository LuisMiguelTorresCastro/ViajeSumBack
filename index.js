require('dotenv').config();

const express = require('express');
const cors = require('cors');

const loginRouter = require('./routes/login');
const agenciasRouter = require('./routes/agencias');
const registerRouter = require('./routes/register');
const paquetesRouter = require('./routes/paquetes')
const twitterRouter = require('./routes/twitter')
const geolocationRouter = require('./routes/geolocation');
const twitchRouter = require('./routes/twitch');
const recuperacionRouter = require('./routes/recuperacion');
const perfilRouter = require('./routes/perfil');
const sendemailRouter = require('./routes/sendemail');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/login', loginRouter);
app.use('/agencias', agenciasRouter);
app.use('/register', registerRouter);
app.use('/paquetes', paquetesRouter);
app.use('/twitter', twitterRouter);
app.use('/recuperacion', recuperacionRouter);
app.use('/geolocation', geolocationRouter);
app.use('/twitch', twitchRouter);
app.use('/perfil', perfilRouter);
app.use('/sendemail', sendemailRouter);
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
