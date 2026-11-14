// --- BARBEROS ---
export interface PublicacionCorte {
  id: string;
  tituloCorte: string;
  descripcion: string;
  fotoAntes?: string;
  fotoDespues: string;
  fecha?: string;
}

export interface Barbero {
  id: string;
  nombre: string;
  rol: string;
  fotoPerfil: string;
  estado: 'Activo' | 'Inactivo';
  historialCortes: PublicacionCorte[];
}

// --- SERVICIOS ---
export interface Servicio {
  id: string;
  nombreServicio: string;
  descripcion: string;
  duracion: string; 
  precio: number;
  tieneOferta?: boolean;
  precioOfertado?: number;
  foto?: string; // Foto opcional del servicio
  categoria?: 'Cabello' | 'Barba' | 'Facial';
  estado: 'Activo' | 'Inactivo';
}

// --- PAQUETES ---
export interface Paquete {
  id: string;
  nombrePaquete: string;
  descripcion: string;
  serviciosIncluidos: string[]; // Lista de IDs o nombres de los servicios que abarca
  duracionTotal: string; // ej. '60 min'
  precioRegular: number;
  precioOfertado?: number; // Opcional por si no tiene oferta
  tieneOferta: boolean; // Indica si la oferta está activa o no
  categoria?: 'Estándar' | 'Promoción';
  estado: 'Activo' | 'Inactivo';
}

// --- CITAS ---
export type EstadoCita = 'Confirmada' | 'Pendiente' | 'Realizada' | 'Cancelada';
export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';

export interface Cita {
  id: string; // ej. '#001'
  cliente: string;
  contacto?: string; // Teléfono o correo
  servicioOpaquete: string; // Nombre del servicio o paquete
  barberoAsignado: string; // Nombre del barbero
  fecha: string; // Separado: ej. "17/10/2026"
  hora: string; // Separado: ej. "10:00 h"
  estado: EstadoCita;
  precioTotal: number;
  pagado: boolean;
  metodoPago?: MetodoPago;
}

// --- MÉTRICAS DEL PANEL ---
export interface MetricaPanel {
  citasHoy: number;
  confirmadasHoy: number;
  pendientesHoy: number;
  ingresosDia: number;
}