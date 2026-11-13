const db = require('../config/db');

// 1. Obtener todos los servicios
const obtenerServicios = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM servicios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Crear un nuevo servicio
const crearServicio = async (req, res) => {
    try {
        const { nombre_servicio, descripcion, duracion, precio, categoria, foto } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO servicios (nombre_servicio, descripcion, duracion, precio, categoria, foto) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre_servicio, descripcion, duracion, precio, categoria, foto]
        );

        res.status(201).json({ 
            id: result.insertId, 
            mensaje: 'Servicio creado correctamente en la base de datos' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerServicios,
    crearServicio
};