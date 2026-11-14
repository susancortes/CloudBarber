const express = require('express');
const router = express.Router();
const {
    obtenerBarberos,
    crearBarbero,
    actualizarBarbero,
    cambiarEstadoBarbero,
    agregarCorteBarbero,
} = require('../controllers/barberosController');

router.get('/', obtenerBarberos);
router.post('/', crearBarbero);
router.put('/:id', actualizarBarbero);
router.patch('/:id/estado', cambiarEstadoBarbero);
router.post('/:id/cortes', agregarCorteBarbero); // Endpoint para guardar el Antes/Después con título y descripción

module.exports = router;