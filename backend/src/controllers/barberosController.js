const db = require('../config/db');

// 1. Obtener todos los barberos junto con sus publicaciones de cortes (Antes/Después)
const obtenerBarberos = async (req, res) => {
    try {
        const [barberos] = await db.query('SELECT * FROM barberos');

        const barberosCompletos = await Promise.all(
            barberos.map(async (barbero) => {
                const [publicaciones] = await db.query(
                    'SELECT id, titulo_corte, descripcion, foto_antes, foto_despues, fecha_publicacion FROM barbero_cortes WHERE barbero_id = ? ORDER BY fecha_publicacion DESC',
                    [barbero.id]
                );

                return {
                    id: String(barbero.id),
                    nombre: barbero.nombre,
                    rol: barbero.rol,
                    fotoPerfil: barbero.foto_perfil || '',
                    estado: barbero.estado,
                    // Mapeamos cada registro de la tabla para que coincida con la vista de portafolio
                    historialCortes: publicaciones.map((p) => ({
                        id: String(p.id),
                        tituloCorte: p.titulo_corte,
                        descripcion: p.descripcion,
                        fotoAntes: p.foto_antes,
                        fotoDespues: p.foto_despues,
                        fecha: p.fecha_publicacion,
                    })),
                };
            })
        );

        res.json(barberosCompletos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Crear un nuevo barbero
const crearBarbero = async (req, res) => {
    try {
        const { nombre, rol, fotoPerfil, estado } = req.body;

        const [result] = await db.query(
            'INSERT INTO barberos (nombre, rol, foto_perfil, estado) VALUES (?, ?, ?, ?)',
            [nombre, rol || 'Barbero', fotoPerfil || '', estado || 'Activo']
        );

        res.status(201).json({
            id: String(result.insertId),
            mensaje: 'Barbero registrado correctamente',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Editar datos de un barbero
const actualizarBarbero = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, rol, fotoPerfil, estado } = req.body;

        await db.query(
            'UPDATE barberos SET nombre = ?, rol = ?, foto_perfil = ?, estado = ? WHERE id = ?',
            [nombre, rol, fotoPerfil || '', estado, id]
        );

        res.json({ mensaje: 'Barbero actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Cambiar estado (Activo / Inactivo)
const cambiarEstadoBarbero = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        await db.query('UPDATE barberos SET estado = ? WHERE id = ?', [estado, id]);

        res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Agregar una nueva publicación de corte (Antes y Después) al portafolio
const agregarCorteBarbero = async (req, res) => {
    try {
        const { id } = req.params; // ID del barbero
        const { tituloCorte, descripcion, fotoAntes, fotoDespues } = req.body;

        const [result] = await db.query(
            'INSERT INTO barbero_cortes (barbero_id, titulo_corte, descripcion, foto_antes, foto_despues) VALUES (?, ?, ?, ?, ?)',
            [id, tituloCorte, descripcion || '', fotoAntes || null, fotoDespues]
        );

        res.status(201).json({
            id: String(result.insertId),
            mensaje: 'Publicación agregada al portafolio con éxito'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerBarberos,
    crearBarbero,
    actualizarBarbero,
    cambiarEstadoBarbero,
    agregarCorteBarbero,
};