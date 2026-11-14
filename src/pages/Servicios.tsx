import React, { useState, useEffect } from 'react';
import { ModalServicio } from '../components/servicios/ModalServicio';
import { ModalPaquete } from '../components/servicios/ModalPaquete';
import type { Servicio, Paquete } from '../types';

interface ServicioApi {
  id: string | number;
  nombre_servicio: string;
  descripcion: string;
  duracion: string;
  precio: number | string;
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
    categoria: servicio.categoria,
    estado: servicio.estado ?? 'Activo',
    foto: servicio.foto,
  }));
};

export const Servicios: React.FC = () => {
  const [pestanaActiva, setPestanaActiva] = useState<'servicios' | 'paquetes'>('servicios');

  // Estados para Filtros
  const [filtroCategoriaServicio, setFiltroCategoriaServicio] = useState('todas');
  const [filtroCategoriaPaquete, setFiltroCategoriaPaquete] = useState('todas');
  const [ordenPrecio, setOrdenPrecio] = useState<'ninguno' | 'menor-mayor' | 'mayor-menor'>('ninguno');

  // Estados para datos reales de la base de datos
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState<Servicio | null>(null);

  const [modalPaqueteAbierto, setModalPaqueteAbierto] = useState(false);
  const [paqueteAEditar, setPaqueteAEditar] = useState<Paquete | null>(null);

  useEffect(() => {
    let mounted = true;

    obtenerServicios()
      .then((data) => {
        if (mounted) setServicios(data);
      })
      .catch((error: unknown) => {
        console.error('Error al conectar con la API:', error);
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // --- GUARDAR O CREAR SERVICIO EN LA BD ---
  const handleGuardarServicio = async (serv: Servicio) => {
    const response = await fetch(
      servicioAEditar
        ? `http://localhost:4000/api/servicios/${serv.id}`
        : 'http://localhost:4000/api/servicios',
      {
        method: servicioAEditar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_servicio: serv.nombreServicio,
          descripcion: serv.descripcion,
          duracion: serv.duracion,
          precio: serv.precio,
          categoria: serv.categoria,
          estado: serv.estado,
          foto: serv.foto
        })
      }
    );

    if (!response.ok) {
      throw new Error(`No se pudo guardar el servicio (${response.status})`);
    }

    const savedService = servicioAEditar
      ? serv
      : { ...serv, id: String((await response.json() as { id: string | number }).id) };

    setServicios((prev) =>
      servicioAEditar
        ? prev.map((item) => (item.id === savedService.id ? savedService : item))
        : [savedService, ...prev]
    );
  };

  const handleCambiarEstadoServicio = async (id: string) => {
    const servicioActual = servicios.find(s => s.id === id);
    if (!servicioActual) return;

    const nuevoEstado = servicioActual.estado === 'Activo' ? 'Inactivo' : 'Activo';

    setServicios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s))
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
        prev.map((s) => (s.id === id ? { ...s, estado: servicioActual.estado } : s))
      );
      console.error('Error al cambiar el estado del servicio:', error);
    }
  };

  const handleGuardarPaquete = (pq: Paquete) => {
    if (paqueteAEditar) {
      setPaquetes((prev) => prev.map((p) => (p.id === pq.id ? pq : p)));
    } else {
      setPaquetes((prev) => [pq, ...prev]);
    }
  };

  const handleCambiarEstadoPaquete = (id: string) => {
    setPaquetes((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: p.estado === 'Activo' ? 'Inactivo' : 'Activo' } : p
      )
    );
  };

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO DE SERVICIOS ---
  const serviciosFiltrados = servicios.filter((s) => {
    if (filtroCategoriaServicio !== 'todas' && s.categoria !== filtroCategoriaServicio) {
      return false;
    }
    return true;
  });

  const serviciosProcesados = [...serviciosFiltrados].sort((a, b) => {
    if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
    if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;

    if (ordenPrecio === 'menor-mayor') return a.precio - b.precio;
    if (ordenPrecio === 'mayor-menor') return b.precio - a.precio;

    return 0;
  });

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO DE PAQUETES ---
  const paquetesFiltrados = paquetes.filter((p) => {
    if (filtroCategoriaPaquete === 'ofertas' && !p.tieneOferta) return false;
    if (filtroCategoriaPaquete === 'estandar' && p.tieneOferta) return false;
    return true;
  });

  const paquetesProcesados = [...paquetesFiltrados].sort((a, b) => {
    if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
    if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;

    const precioEfectivoA = a.tieneOferta && a.precioOfertado ? a.precioOfertado : a.precioRegular;
    const precioEfectivoB = b.tieneOferta && b.precioOfertado ? b.precioOfertado : b.precioRegular;

    if (ordenPrecio === 'menor-mayor') return precioEfectivoA - precioEfectivoB;
    if (ordenPrecio === 'mayor-menor') return precioEfectivoB - precioEfectivoA;

    return 0;
  });

  if (cargando) {
    return <div className="text-center py-20 text-gray-400">Conectando con la base de datos de CloudBarber...</div>;
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Catálogo de Servicios</h1>
          <p className="text-sm text-gray-400">Administra los cortes, paquetes y precios de tu barbería.</p>
        </div>
        <button
          onClick={() => {
            if (pestanaActiva === 'servicios') {
              setServicioAEditar(null);
              setModalServicioAbierto(true);
            } else {
              setPaqueteAEditar(null);
              setModalPaqueteAbierto(true);
            }
          }}
          className="bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          {pestanaActiva === 'servicios' ? '+ Añadir Servicio' : '+ Añadir Paquete'}
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex gap-4 border-b border-gray-800 mb-6">
        <button
          onClick={() => setPestanaActiva('servicios')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            pestanaActiva === 'servicios'
              ? 'border-white text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Servicios individuales ({servicios.length})
        </button>
        <button
          onClick={() => setPestanaActiva('paquetes')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            pestanaActiva === 'paquetes'
              ? 'border-white text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Paquetes de ofertas ({paquetes.length})
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-[#161B2C] p-4 rounded-xl border border-gray-800">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Filtrar por categoría</label>
          {pestanaActiva === 'servicios' ? (
            <select
              value={filtroCategoriaServicio}
              onChange={(e) => setFiltroCategoriaServicio(e.target.value)}
              className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 text-sm rounded-lg p-2.5 focus:outline-none"
            >
              <option value="todas">Todas las categorías</option>
              <option value="Cabello">Cabello</option>
              <option value="Barba">Barba</option>
              <option value="Facial">Facial / Tratamientos</option>
            </select>
          ) : (
            <select
              value={filtroCategoriaPaquete}
              onChange={(e) => setFiltroCategoriaPaquete(e.target.value)}
              className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 text-sm rounded-lg p-2.5 focus:outline-none"
            >
              <option value="todas">Todos los paquetes</option>
              <option value="ofertas">Solo Paquetes con Oferta Activa</option>
              <option value="estandar">Solo Paquetes Precio Regular</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Ordenar por Precio (Incluye ofertas)</label>
          <select
            value={ordenPrecio}
            onChange={(e) => {
              const valor = e.target.value;
              if (valor === 'ninguno' || valor === 'menor-mayor' || valor === 'mayor-menor') {
                setOrdenPrecio(valor);
              }
            }}
            className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 text-sm rounded-lg p-2.5 focus:outline-none"
          >
            <option value="ninguno">Orden por defecto</option>
            <option value="menor-mayor">Precio: Menor a Mayor ⬆️</option>
            <option value="mayor-menor">Precio: Mayor a Menor ⬇️</option>
          </select>
        </div>
      </div>

      {/* Tabla Servicios */}
      {pestanaActiva === 'servicios' ? (
        <div className="bg-[#161B2C] border border-gray-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider bg-[#131726]/50">
                  <th className="px-6 py-3 font-medium">Servicio</th>
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 font-medium">Descripción</th>
                  <th className="px-6 py-3 font-medium">Duración</th>
                  <th className="px-6 py-3 font-medium">Precio</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm">
                {serviciosProcesados.map((serv) => {
                  const activo = serv.estado === 'Activo';
                  return (
                    <tr key={serv.id} className={`hover:bg-[#1e2538]/50 transition-colors ${!activo ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400 text-sm">
                            {serv.foto ? (
                              <img src={serv.foto} alt={serv.nombreServicio} className="w-full h-full object-cover" />
                            ) : (
                              '✂️'
                            )}
                          </div>
                          <span className="font-semibold text-white">{serv.nombreServicio}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded border border-gray-700">
                          {serv.categoria || 'Cabello'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 max-w-xs truncate">{serv.descripcion}</td>
                      <td className="px-6 py-4 text-gray-300">{serv.duracion}</td>
                      <td className="px-6 py-4 font-bold text-white">${serv.precio}.00 MXN</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${activo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {serv.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setServicioAEditar(serv);
                            setModalServicioAbierto(true);
                          }}
                          className="px-2.5 py-1 bg-[#1e2538] hover:bg-gray-700 rounded text-xs text-gray-300 border border-gray-700"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleCambiarEstadoServicio(serv.id)}
                          className="px-2.5 py-1 bg-[#1e2538] hover:bg-gray-700 rounded text-xs text-gray-300 border border-gray-700"
                        >
                          {activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tabla Paquetes */
        <div className="bg-[#161B2C] border border-gray-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider bg-[#131726]/50">
                  <th className="px-6 py-3 font-medium">Paquete</th>
                  <th className="px-6 py-3 font-medium">Incluye</th>
                  <th className="px-6 py-3 font-medium">Duración</th>
                  <th className="px-6 py-3 font-medium">Precios</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm">
                {paquetesProcesados.map((pq) => {
                  const activo = pq.estado === 'Activo';
                  return (
                    <tr key={pq.id} className={`hover:bg-[#1e2538]/50 transition-colors ${!activo ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-semibold text-white">{pq.nombrePaquete}</td>
                      <td className="px-6 py-4 text-gray-300 max-w-xs">{pq.serviciosIncluidos.join(', ')}</td>
                      <td className="px-6 py-4 text-gray-300">{pq.duracionTotal}</td>
                      <td className="px-6 py-4">
                        {pq.tieneOferta ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through">${pq.precioRegular}.00 MXN</span>
                            <span className="font-bold text-emerald-400 text-base">${pq.precioOfertado}.00 MXN</span>
                            <span className="text-[10px] text-amber-400 font-medium mt-0.5">¡Oferta Activa!</span>
                          </div>
                        ) : (
                          <span className="font-bold text-white">${pq.precioRegular}.00 MXN</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${activo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {pq.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setPaqueteAEditar(pq);
                              setModalPaqueteAbierto(true);
                            }}
                            className="px-3 py-1.5 bg-[#1e2538] hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-200 border border-gray-700 transition-colors flex items-center gap-1"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleCambiarEstadoPaquete(pq.id)}
                            className="px-3 py-1.5 bg-[#1e2538] hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-200 border border-gray-700 transition-colors"
                          >
                            {activo ? 'Desactivar' : 'Activar'}
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
      )}

      {/* Modales */}
      <ModalServicio
        isOpen={modalServicioAbierto}
        onClose={() => setModalServicioAbierto(false)}
        onGuardar={handleGuardarServicio}
        servicioAEditar={servicioAEditar}
      />

      {modalPaqueteAbierto && (
        <ModalPaquete
          onClose={() => setModalPaqueteAbierto(false)}
          onGuardar={handleGuardarPaquete}
          paqueteAEditar={paqueteAEditar}
        />
      )}
    </div>
  );
};