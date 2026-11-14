import React, { useState } from 'react';
import { TarjetaBarbero } from '../components/barberos/TarjetaBarbero';
import { ModalBarbero } from '../components/barberos/ModalBarbero';
import type { Barbero, PublicacionCorte } from '../types';

const obtenerBarberos = async (): Promise<Barbero[]> => {
  const response = await fetch('http://localhost:4000/api/barberos');
  if (!response.ok) {
    throw new Error(`Error al obtener barberos: ${response.status}`);
  }

  return response.json();
};

export const Barberos: React.FC = () => {
  const [barberos, setBarberos] = useState<Barbero[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [barberoAEditar, setBarberoAEditar] = useState<Barbero | null>(null);

  React.useEffect(() => {
    let mounted = true;

    obtenerBarberos()
      .then((data) => {
        if (mounted) setBarberos(data);
      })
      .catch((error: unknown) => {
        console.error('Error al cargar barberos:', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleAbrirCrear = () => {
    setBarberoAEditar(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (barbero: Barbero) => {
    setBarberoAEditar(barbero);
    setModalAbierto(true);
  };

  const handleGuardarBarbero = async (barb: Barbero) => {
    const response = await fetch(
      barberoAEditar
        ? `http://localhost:4000/api/barberos/${barb.id}`
        : 'http://localhost:4000/api/barberos',
      {
        method: barberoAEditar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barb),
      }
    );

    if (!response.ok) {
      throw new Error(`No se pudo guardar el barbero (${response.status}).`);
    }

    const barberoGuardado = barberoAEditar
      ? barb
      : { ...barb, id: String((await response.json() as { id: string | number }).id) };

    setBarberos((prev) =>
      barberoAEditar
        ? prev.map((barbero) => (barbero.id === barb.id ? barberoGuardado : barbero))
        : [barberoGuardado, ...prev]
    );
  };

  const handleCambiarEstado = (id: string) => {
    setBarberos((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, estado: b.estado === 'Activo' ? 'Inactivo' : 'Activo' } : b
      )
    );
  };

  const handleAgregarCorte = async (idBarbero: string, publicacion: Omit<PublicacionCorte, 'id'>) => {
    const response = await fetch(`http://localhost:4000/api/barberos/${idBarbero}/cortes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tituloCorte: publicacion.tituloCorte,
        descripcion: publicacion.descripcion,
        fotoAntes: publicacion.fotoAntes,
        fotoDespues: publicacion.fotoDespues,
      }),
    });

    if (!response.ok) {
      throw new Error(`No se pudo guardar la publicación (${response.status}).`);
    }

    const result: { id: string | number } = await response.json();
    setBarberos((prev) =>
      prev.map((barbero) =>
        barbero.id === idBarbero
          ? {
              ...barbero,
              historialCortes: [{ ...publicacion, id: String(result.id) }, ...barbero.historialCortes],
            }
          : barbero
      )
    );
  };

  const barberosOrdenados = [...barberos].sort((a, b) => {
    if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
    if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;
    return 0;
  });

  const activosCount = barberos.filter((b) => b.estado === 'Activo').length;
  const inactivosCount = barberos.filter((b) => b.estado === 'Inactivo').length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipo de Barberos</h1>
          <p className="text-sm text-gray-400">Administra los perfiles y la disponibilidad de tu equipo.</p>
        </div>
        <button
          onClick={handleAbrirCrear}
          className="bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          + Añadir Barbero
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <span>{barberos.length} barberos en el equipo</span>
        <span>{activosCount} activos · {inactivosCount} inactivos</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {barberosOrdenados.map((barbero) => (
          <TarjetaBarbero
            key={barbero.id}
            barbero={barbero}
            onEditar={handleAbrirEditar}
            onCambiarEstado={handleCambiarEstado}
            onAgregarCorte={handleAgregarCorte}
          />
        ))}
      </div>

      {modalAbierto && (
        <ModalBarbero
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardarBarbero}
          barberoAEditar={barberoAEditar}
        />
      )}
    </div>
  );
};