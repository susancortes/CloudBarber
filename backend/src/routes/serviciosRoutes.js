const express = require('express');
const router = express.Router();
const {
    obtenerServicios,
    crearServicio,
    actualizarServicio,
    actualizarEstadoServicio,
    eliminarServicio
} = require('../controllers/serviciosController');

// Definir endpoints
router.get('/', obtenerServicios);
router.post('/', crearServicio);
router.put('/:id', actualizarServicio);
router.patch('/:id/estado', actualizarEstadoServicio);
router.delete('/:id', eliminarServicio);

module.exports = router;