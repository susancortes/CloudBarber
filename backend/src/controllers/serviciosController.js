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
        const {
            nombre_servicio,
            descripcion,
            duracion,
            precio,
            categoria,
            foto,
            tiene_oferta = false,
            precio_ofertado
        } = req.body;

        if (
            typeof tiene_oferta !== 'boolean' ||
            (tiene_oferta &&
                (precio_ofertado == null ||
                    !Number.isFinite(Number(precio_ofertado)) ||
                    Number(precio_ofertado) < 0 ||
                    Number(precio_ofertado) > Number(precio)))
        ) {
            return res.status(400).json({ error: 'Los datos de la oferta no son válidos' });
        }
        
        const [result] = await db.query(
            `INSERT INTO servicios
             (nombre_servicio, descripcion, duracion, precio, categoria, foto, tiene_oferta, precio_ofertado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre_servicio,
                descripcion,
                duracion,
                precio,
                categoria,
                foto,
                tiene_oferta,
                tiene_oferta ? precio_ofertado : null
            ]
        );

        res.status(201).json({ 
            id: result.insertId, 
            mensaje: 'Servicio creado correctamente en la base de datos' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarServicio = async (req, res) => {
    const {
        nombre_servicio,
        descripcion,
        duracion,
        precio,
        categoria,
        estado,
        foto,
        tiene_oferta = false,
        precio_ofertado
    } = req.body || {};

    if (
        typeof nombre_servicio !== 'string' ||
        !nombre_servicio.trim() ||
        typeof duracion !== 'string' ||
        !duracion.trim() ||
        !Number.isFinite(Number(precio)) ||
        !['Cabello', 'Barba', 'Facial'].includes(categoria) ||
        !['Activo', 'Inactivo'].includes(estado) ||
        typeof tiene_oferta !== 'boolean' ||
        (tiene_oferta &&
            (precio_ofertado == null ||
                !Number.isFinite(Number(precio_ofertado)) ||
                Number(precio_ofertado) < 0 ||
                Number(precio_ofertado) > Number(precio)))
    ) {
        return res.status(400).json({ error: 'Los datos del servicio no son válidos' });
    }

    try {
        const [result] = await db.query(
            `UPDATE servicios
             SET nombre_servicio = ?, descripcion = ?, duracion = ?, precio = ?,
                 categoria = ?, estado = ?, foto = ?, tiene_oferta = ?, precio_ofertado = ?
             WHERE id = ?`,
            [
                nombre_servicio.trim(),
                descripcion || '',
                duracion.trim(),
                Number(precio),
                categoria,
                estado,
                foto || '',
                tiene_oferta,
                tiene_oferta ? Number(precio_ofertado) : null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            const [rows] = await db.query('SELECT id FROM servicios WHERE id = ?', [req.params.id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Servicio no encontrado' });
            }
        }

        res.json({ mensaje: 'Servicio actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarEstadoServicio = async (req, res) => {
    const { estado } = req.body;
    if (estado !== 'Activo' && estado !== 'Inactivo') {
        return res.status(400).json({ error: 'El estado debe ser Activo o Inactivo' });
    }

    try {
        const [result] = await db.query(
            'UPDATE servicios SET estado = ? WHERE id = ?',
            [estado, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ mensaje: 'Estado del servicio actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarServicio = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM servicios WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ mensaje: 'Servicio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerServicios,
    crearServicio,
    actualizarServicio,
    actualizarEstadoServicio,
    eliminarServicio
};