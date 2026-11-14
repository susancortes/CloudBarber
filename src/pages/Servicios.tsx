import React, { useEffect, useState } from 'react';
import { ModalConfirmacion } from '../components/common/ModalConfirmacion';
import { ModalServicio } from '../components/servicios/ModalServicio';
import type { Servicio } from '../types';

interface ServicioApi {
  id: string | number;
  nombre_servicio: string;
  descripcion: string;
  duracion: string;
  precio: number | string;
  tiene_oferta?: boolean | number;
  precio_ofertado?: number | string | null;
  categoria?: Servicio['categoria'];
  estado?: Servicio['estado'];
  foto?: string;
}

const obtenerServicios = async (): Promise<Servicio[]> => {
  const response = await fetch('http://localhost:4000/api/servicios');
  if (!response.ok) {
    throw new Error(`Error al obtener servicios: ${response.status}`);
  }

  const data: ServicioApi[] = await response.json();
  return data.map((servicio) => ({
    id: String(servicio.id),
    nombreServicio: servicio.nombre_servicio,
    descripcion: servicio.descripcion,
    duracion: servicio.duracion,
    precio: Number(servicio.precio),
    tieneOferta: Boolean(servicio.tiene_oferta),
    precioOfertado: servicio.precio_ofertado == null
      ? undefined
      : Number(servicio.precio_ofertado),
    categoria: servicio.categoria,
    estado: servicio.estado ?? 'Activo',
    foto: servicio.foto,
  }));
};

export const Servicios: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroOferta, setFiltroOferta] = useState('todas');
  const [ordenPrecio, setOrdenPrecio] = useState<'ninguno' | 'menor-mayor' | 'mayor-menor'>('ninguno');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState<Servicio | null>(null);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);
  const [eliminandoServicio, setEliminandoServicio] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    obtenerServicios()
      .then((data) => {
        if (mounted) setServicios(data);
      })
      .catch((error: unknown) => {
        console.error('Error al obtener servicios:', error);
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleGuardarServicio = async (servicio: Servicio) => {
    const response = await fetch(
      servicioAEditar
        ? `http://localhost:4000/api/servicios/${servicio.id}`
        : 'http://localhost:4000/api/servicios',
      {
        method: servicioAEditar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_servicio: servicio.nombreServicio,
          descripcion: servicio.descripcion,
          duracion: servicio.duracion,
          precio: servicio.precio,
          categoria: servicio.categoria,
          estado: servicio.estado,
          foto: servicio.foto,
          tiene_oferta: servicio.tieneOferta ?? false,
          precio_ofertado: servicio.tieneOferta ? servicio.precioOfertado : null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`No se pudo guardar el servicio (${response.status}).`);
    }

    const servicioGuardado = servicioAEditar
      ? servicio
      : { ...servicio, id: String((await response.json() as { id: string | number }).id) };

    setServicios((prev) =>
      servicioAEditar
        ? prev.map((item) => (item.id === servicioGuardado.id ? servicioGuardado : item))
        : [servicioGuardado, ...prev]
    );
  };

  const handleCambiarEstado = async (id: string) => {
    const servicioActual = servicios.find((servicio) => servicio.id === id);
    if (!servicioActual) return;

    const nuevoEstado = servicioActual.estado === 'Activo' ? 'Inactivo' : 'Activo';
    setServicios((prev) =>
      prev.map((servicio) => (servicio.id === id ? { ...servicio, estado: nuevoEstado } : servicio))
    );

    try {
      const response = await fetch(`http://localhost:4000/api/servicios/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar el estado: ${response.status}`);
      }
    } catch (error) {
      setServicios((prev) =>
        prev.map((servicio) =>
          servicio.id === id ? { ...servicio, estado: servicioActual.estado } : servicio
        )
      );
      console.error('Error al cambiar el estado del servicio:', error);
    }
  };

  const handleEliminarServicio = async () => {
    if (!servicioAEliminar) return;
    setEliminandoServicio(true);
    setErrorEliminar(null);
    try {
      const response = await fetch(`http://localhost:4000/api/servicios/${servicioAEliminar.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`No se pudo eliminar el servicio (${response.status}).`);
      }

      setServicios((prev) => prev.filter((servicio) => servicio.id !== servicioAEliminar.id));
      setServicioAEliminar(null);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido.';
      console.error('Error al eliminar servicio:', error);
      setErrorEliminar(mensaje);
    } finally {
      setEliminandoServicio(false);
    }
  };

  const serviciosFiltrados = servicios.filter((servicio) => {
    if (filtroCategoria !== 'todas' && servicio.categoria !== filtroCategoria) return false;
    if (filtroOferta === 'ofertas' && !servicio.tieneOferta) return false;
    if (filtroOferta === 'sin-oferta' && servicio.tieneOferta) return false;
    return true;
  });
  const serviciosProcesados = [...serviciosFiltrados].sort((a, b) => {
    if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
    if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;
    const precioA = a.tieneOferta && a.precioOfertado != null ? a.precioOfertado : a.precio;
    const precioB = b.tieneOferta && b.precioOfertado != null ? b.precioOfertado : b.precio;
    if (ordenPrecio === 'menor-mayor') return precioA - precioB;
    if (ordenPrecio === 'mayor-menor') return precioB - precioA;
    return 0;
  });

  if (cargando) {
    return <div className="py-20 text-center text-gray-400">Conectando con la base de datos de CloudBarber...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Catálogo de Servicios</h1>
          <p className="text-sm text-gray-400">Administra los cortes y precios de tu barbería.</p>
        </div>
        <button
          onClick={() => {
            setServicioAEditar(null);
            setModalAbierto(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200"
        >
          + Añadir Servicio
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-800 bg-[#161B2C] p-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Filtrar por categoría</label>
          <select
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#1e2538] p-2.5 text-sm text-gray-200 focus:outline-none"
          >
            <option value="todas">Todas las categorías</option>
            <option value="Cabello">Cabello</option>
            <option value="Barba">Barba</option>
            <option value="Facial">Facial / Tratamientos</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Filtrar por oferta</label>
          <select
            value={filtroOferta}
            onChange={(event) => setFiltroOferta(event.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#1e2538] p-2.5 text-sm text-gray-200 focus:outline-none"
          >
            <option value="todas">Con y sin oferta</option>
            <option value="ofertas">Solo servicios en oferta</option>
            <option value="sin-oferta">Sin oferta</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Ordenar por precio</label>
          <select
            value={ordenPrecio}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'ninguno' || value === 'menor-mayor' || value === 'mayor-menor') {
                setOrdenPrecio(value);
              }
            }}
            className="w-full rounded-lg border border-gray-700 bg-[#1e2538] p-2.5 text-sm text-gray-200 focus:outline-none"
          >
            <option value="ninguno">Orden por defecto</option>
            <option value="menor-mayor">Precio: menor a mayor</option>
            <option value="mayor-menor">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#161B2C] shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-[#131726]/50 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3 font-medium">Servicio</th>
                <th className="px-6 py-3 font-medium">Categoría</th>
                <th className="px-6 py-3 font-medium">Descripción</th>
                <th className="px-6 py-3 font-medium">Duración</th>
                <th className="px-6 py-3 font-medium">Precio</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="w-[270px] whitespace-nowrap px-6 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-sm">
              {serviciosProcesados.map((servicio) => {
                const activo = servicio.estado === 'Activo';
                return (
                  <tr key={servicio.id} className={`transition-colors hover:bg-[#1e2538]/50 ${!activo ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-700 bg-gray-800 text-sm text-gray-400">
                          {servicio.foto ? (
                            <img src={servicio.foto} alt={servicio.nombreServicio} className="h-full w-full object-cover" />
                          ) : (
                            '✂️'
                          )}
                        </div>
                        <span className="font-semibold text-white">{servicio.nombreServicio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-300">
                        {servicio.categoria || 'Cabello'}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-gray-300">{servicio.descripcion}</td>
                    <td className="px-6 py-4 text-gray-300">{servicio.duracion}</td>
                    <td className="px-6 py-4">
                      {servicio.tieneOferta && servicio.precioOfertado != null ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 line-through">${servicio.precio}.00 MXN</span>
                          <span className="text-base font-bold text-emerald-400">${servicio.precioOfertado}.00 MXN</span>
                          <span className="mt-0.5 text-[10px] font-medium text-amber-400">¡Oferta Activa!</span>
                        </div>
                      ) : (
                        <span className="font-bold text-white">${servicio.precio}.00 MXN</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${activo ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-gray-500/20 bg-gray-500/10 text-gray-400'}`}>
                        {servicio.estado}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setServicioAEditar(servicio);
                            setModalAbierto(true);
                          }}
                          className="whitespace-nowrap rounded border border-gray-700 bg-[#1e2538] px-2 py-1.5 text-[11px] leading-4 text-gray-300 hover:bg-gray-700"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(servicio.id)}
                          className="whitespace-nowrap rounded border border-gray-700 bg-[#1e2538] px-2 py-1.5 text-[11px] leading-4 text-gray-300 hover:bg-gray-700"
                        >
                          {activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => {
                            setErrorEliminar(null);
                            setServicioAEliminar(servicio);
                          }}
                          className="whitespace-nowrap rounded border border-red-900 bg-red-950/40 px-2 py-1.5 text-[11px] leading-4 text-red-300 hover:bg-red-900/60"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ModalServicio
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onGuardar={handleGuardarServicio}
        servicioAEditar={servicioAEditar}
      />
      <ModalConfirmacion
        isOpen={servicioAEliminar !== null}
        titulo="Eliminar servicio"
        mensaje={`¿Deseas eliminar "${servicioAEliminar?.nombreServicio}"? Se quitará de los paquetes que lo incluyen y las citas asociadas quedarán sin este servicio. Esta acción no se puede deshacer.`}
        error={errorEliminar}
        confirmando={eliminandoServicio}
        onCancelar={() => {
          setServicioAEliminar(null);
          setErrorEliminar(null);
        }}
        onConfirmar={handleEliminarServicio}
      />
    </div>
  );
};
