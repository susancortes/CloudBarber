const express = require('express');
const router = express.Router();
const {
    obtenerPaquetes,
    crearPaquete,
    actualizarPaquete,
    eliminarPaquete
} = require('../controllers/paquetesController');

router.get('/', obtenerPaquetes);
router.post('/', crearPaquete);
router.put('/:id', actualizarPaquete);
router.delete('/:id', eliminarPaquete);

module.exports = router;