require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const loginRouter = require('./routes/login');
const agenciasRouter = require('./routes/agencias');
const registerRouter = require('./routes/register');
const hotelesRouter = require('./routes/hoteles')
const restaurantesRouter = require('./routes/restaurantes')
const PaquetespersonalizadosRouter = require('./routes/Paquetespersonalizados')
const experienciasRouter = require('./routes/experiencias')
const transportistaRouter = require('./routes/transportista')
const guiasRouter = require('./routes/guias')
const paquetesRouter = require('./routes/paquetes')
const clienteRouter = require('./routes/cliente')
const twitterRouter = require('./routes/twitter')
const profileRouter = require('./routes/profile');
const geolocationRouter = require('./routes/geolocation');
const facebookRouter = require('./routes/facebook');
const metodosPagoRouter = require('./routes/metodo-pago');
const reservasRouter = require('./routes/reserva');
const detallesPagoRouter = require('./routes/detalles');
const twitchRouter = require('./routes/twitch');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/login', loginRouter);
app.use('/agencias', agenciasRouter);
app.use('/register', registerRouter);
app.use('/hoteles', hotelesRouter);
app.use('/restaurantes', restaurantesRouter);
app.use('/PaquetesPersonalizados', PaquetespersonalizadosRouter);
app.use('/experiencias', experienciasRouter);
app.use('/transportista', transportistaRouter);
app.use('/guias', guiasRouter);
app.use('/paquetes', paquetesRouter);
app.use('/cliente', clienteRouter);
app.use('/twitter', twitterRouter);
app.use('/profile', profileRouter);
app.use('/geolocation', geolocationRouter);
app.use('/facebook', facebookRouter);
app.use('/metodos-pago', metodosPagoRouter);
app.use('/reservas', reservasRouter);
app.use('/detalles', detallesPagoRouter);
app.use('/twitch', twitchRouter);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
