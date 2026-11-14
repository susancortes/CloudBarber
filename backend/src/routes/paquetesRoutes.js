const express = require('express');
const router = express.Router();
const {
    obtenerPaquetes,
    crearPaquete,
    actualizarPaquete
} = require('../controllers/paquetesController');

router.get('/', obtenerPaquetes);
router.post('/', crearPaquete);
router.put('/:id', actualizarPaquete);

module.exports = router;