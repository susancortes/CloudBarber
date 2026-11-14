-- Crear base de datos
CREATE DATABASE IF NOT EXISTS cloudbarber_db;
USE cloudbarber_db;

-- 1. Tabla de Barberos
CREATE TABLE IF NOT EXISTS barberos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Barbero',
    foto_perfil TEXT,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS barbero_cortes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barbero_id INT NOT NULL,
    titulo_corte VARCHAR(100) NOT NULL, 
    descripcion TEXT,                   
    foto_antes TEXT NULL,               
    foto_despues TEXT NOT NULL,         
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barbero_id) REFERENCES barberos(id) ON DELETE CASCADE
);

-- 2. Tabla de Servicios
CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion VARCHAR(20) DEFAULT '30 min',
    precio DECIMAL(10, 2) NOT NULL,
    categoria ENUM('Cabello', 'Barba', 'Facial') DEFAULT 'Cabello',
    foto TEXT,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

-- 3. Tabla de Paquetes
CREATE TABLE IF NOT EXISTS paquetes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_paquete VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_total VARCHAR(20) DEFAULT '60 min',
    precio_regular DECIMAL(10, 2) NOT NULL,
    precio_ofertado DECIMAL(10, 2) NULL,
    tiene_oferta BOOLEAN DEFAULT FALSE,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

-- Tabla intermedia para Paquetes y Servicios
CREATE TABLE IF NOT EXISTS paquete_servicios (
    paquete_id INT,
    servicio_id INT,
    PRIMARY KEY (paquete_id, servicio_id),
    FOREIGN KEY (paquete_id) REFERENCES paquetes(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
);

-- 4. Tabla de Catálogo de Estados de Cita (¡La idea pro!)
CREATE TABLE IF NOT EXISTS estados_cita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL
);

INSERT INTO estados_cita (nombre_estado) VALUES 
('Pendiente'), 
('Confirmada'), 
('Realizada'), 
('Cancelada');

-- 5. Tabla de Citas (Relacionada)
CREATE TABLE IF NOT EXISTS citas (
    id VARCHAR(10) PRIMARY KEY,
    cliente VARCHAR(100) NOT NULL,
    contacto VARCHAR(150),
    servicio_id INT NULL,
    paquete_id INT NULL,
    barbero_id INT NULL,
    fecha DATE NOT NULL,
    hora VARCHAR(10) NOT NULL,
    estado_id INT DEFAULT 1, 
    precio_total DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia') NULL,
    pagado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL,
    FOREIGN KEY (paquete_id) REFERENCES paquetes(id) ON DELETE SET NULL,
    FOREIGN KEY (barbero_id) REFERENCES barberos(id) ON DELETE SET NULL,
    FOREIGN KEY (estado_id) REFERENCES estados_cita(id)
);