const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Tu contraseña de Workbench
    database: process.env.DB_NAME || 'cloudbarber_db',
    port: process.env.DB_PORT || 3306
});

// Probar conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    } else {
        console.log('✅ Conexión exitosa a la base de datos MySQL');
        connection.release();
    }
});

module.exports = pool.promise();