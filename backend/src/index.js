const express = require('express');
const cors = require('cors');
require('dotenv').config();

const serviciosRoutes = require('./routes/serviciosRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/servicios', serviciosRoutes);

// Rutas de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de CloudBarber funcionando correctamente 🚀' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});