const express = require('express');
const router = express.Router();
const {
    obtenerServicios,
    crearServicio,
    actualizarServicio,
    actualizarEstadoServicio
} = require('../controllers/serviciosController');

// Definir endpoints
router.get('/', obtenerServicios);
router.post('/', crearServicio);
router.put('/:id', actualizarServicio);
router.patch('/:id/estado', actualizarEstadoServicio);

module.exports = router;