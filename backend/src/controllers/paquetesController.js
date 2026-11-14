const db = require('../config/db');

// 1. Obtener todos los paquetes con sus servicios incluidos
const obtenerPaquetes = async (req, res) => {
    try {
        const [paquetes] = await db.query('SELECT * FROM paquetes');
        
        // Para cada paquete, buscamos los nombres de los servicios que incluye en la tabla intermedia
        const paquetesConServicios = await Promise.all(
            paquetes.map(async (paquete) => {
                const [servicios] = await db.query(`
                    SELECT s.nombre_servicio 
                    FROM paquete_servicios ps
                    JOIN servicios s ON ps.servicio_id = s.id
                    WHERE ps.paquete_id = ?
                `, [paquete.id]);

                return {
                    id: String(paquete.id),
                    nombrePaquete: paquete.nombre_paquete,
                    descripcion: paquete.descripcion,
                    serviciosIncluidos: servicios.map(s => s.nombre_servicio),
                    duracionTotal: paquete.duracion_total,
                    precioRegular: Number(paquete.precio_regular),
                    precioOfertado: paquete.precio_ofertado == null ? null : Number(paquete.precio_ofertado),
                    tieneOferta: Boolean(paquete.tiene_oferta),
                    categoria: 'Promoción',
                    estado: paquete.estado
                };
            })
        );

        res.json(paquetesConServicios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Crear un nuevo paquete y asociar sus servicios
const crearPaquete = async (req, res) => {
    const {
        nombre_paquete,
        descripcion,
        duracion_total,
        precio_regular,
        precio_ofertado,
        tiene_oferta,
        servicios_ids
    } = req.body || {};

    if (
        typeof nombre_paquete !== 'string' ||
        !nombre_paquete.trim() ||
        !Number.isFinite(Number(precio_regular)) ||
        (precio_ofertado != null && !Number.isFinite(Number(precio_ofertado))) ||
        !Array.isArray(servicios_ids) ||
        !servicios_ids.every((id) => Number.isInteger(id) && id > 0)
    ) {
        return res.status(400).json({ error: 'Los datos del paquete no son válidos' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO paquetes (nombre_paquete, descripcion, duracion_total, precio_regular, precio_ofertado, tiene_oferta) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nombre_paquete.trim(),
                descripcion || '',
                duracion_total || '60 min',
                Number(precio_regular),
                precio_ofertado == null ? null : Number(precio_ofertado),
                Boolean(tiene_oferta)
            ]
        );

        const paqueteId = result.insertId;

        // Si se enviaron IDs de servicios asociados, los guardamos en la tabla intermedia
        if (servicios_ids.length > 0) {
            const values = servicios_ids.map(servicioId => [paqueteId, servicioId]);
            await connection.query(
                `INSERT INTO paquete_servicios (paquete_id, servicio_id) VALUES ?`,
                [values]
            );
        }

        await connection.commit();

        res.status(201).json({ id: paqueteId, mensaje: 'Paquete creado con éxito en la base de datos 🚀' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const actualizarPaquete = async (req, res) => {
    const {
        nombre_paquete,
        descripcion,
        duracion_total,
        precio_regular,
        precio_ofertado,
        tiene_oferta,
        servicios_ids
    } = req.body || {};

    if (
        typeof nombre_paquete !== 'string' ||
        !nombre_paquete.trim() ||
        !Number.isFinite(Number(precio_regular)) ||
        typeof tiene_oferta !== 'boolean' ||
        (tiene_oferta && (precio_ofertado == null || !Number.isFinite(Number(precio_ofertado)))) ||
        !Array.isArray(servicios_ids) ||
        !servicios_ids.every((id) => Number.isInteger(id) && id > 0)
    ) {
        return res.status(400).json({ error: 'Los datos del paquete no son válidos' });
    }

    let connection;
    let transactionStarted = false;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        const [result] = await connection.query(
            `UPDATE paquetes
             SET nombre_paquete = ?, descripcion = ?, duracion_total = ?,
                 precio_regular = ?, precio_ofertado = ?, tiene_oferta = ?
             WHERE id = ?`,
            [
                nombre_paquete.trim(),
                descripcion || '',
                duracion_total || '60 min',
                Number(precio_regular),
                tiene_oferta ? Number(precio_ofertado) : null,
                tiene_oferta,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            const [rows] = await connection.query(
                'SELECT id FROM paquetes WHERE id = ?',
                [req.params.id]
            );
            if (rows.length === 0) {
                await connection.rollback();
                transactionStarted = false;
                return res.status(404).json({ error: 'Paquete no encontrado' });
            }
        }

        await connection.query('DELETE FROM paquete_servicios WHERE paquete_id = ?', [req.params.id]);
        if (servicios_ids.length > 0) {
            const values = servicios_ids.map((servicioId) => [req.params.id, servicioId]);
            await connection.query(
                'INSERT INTO paquete_servicios (paquete_id, servicio_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        transactionStarted = false;
        res.json({ id: req.params.id, mensaje: 'Paquete actualizado correctamente' });
    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const eliminarPaquete = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM paquetes WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Paquete no encontrado' });
        }

        res.json({ mensaje: 'Paquete eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerPaquetes,
    crearPaquete,
    actualizarPaquete,
    eliminarPaquete
};