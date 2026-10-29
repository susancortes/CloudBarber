import React, { useState } from 'react';
import { ModalServicio } from '../components/servicios/ModalServicio';
import { ModalPaquete } from '../components/servicios/ModalPaquete';
import type { Servicio, Paquete } from '../types';

export const Servicios: React.FC = () => {
  const [pestanaActiva, setPestanaActiva] = useState<'servicios' | 'paquetes'>('servicios');

  // Estados para Filtros
  const [filtroCategoriaServicio, setFiltroCategoriaServicio] = useState('todas');
  const [filtroCategoriaPaquete, setFiltroCategoriaPaquete] = useState('todas');
  const [ordenPrecio, setOrdenPrecio] = useState<'ninguno' | 'menor-mayor' | 'mayor-menor'>('ninguno');

  const [servicios, setServicios] = useState<Servicio[]>([
    {
      id: '1',
      nombreServicio: 'Corte clásico',
      descripcion: 'Corte tradicional con máquina y tijera.',
      duracion: '30 min',
      precio: 200,
      categoria: 'Cabello',
      estado: 'Activo',
    },
    {
      id: '2',
      nombreServicio: 'Arreglo de barba',
      descripcion: 'Perfilado con navaja y toalla caliente.',
      duracion: '25 min',
      precio: 150,
      categoria: 'Barba',
      estado: 'Activo',
    },
    {
      id: '3',
      nombreServicio: 'Mascarilla Negra Facial',
      descripcion: 'Limpieza profunda de poros.',
      duracion: '20 min',
      precio: 180,
      categoria: 'Facial',
      estado: 'Activo',
    },
  ]);

  const [paquetes, setPaquetes] = useState<Paquete[]>([
    {
      id: 'p1',
      nombrePaquete: 'Paquete Ejecutivo',
      descripcion: 'Corte clásico + Arreglo de barba.',
      serviciosIncluidos: ['Corte clásico', 'Arreglo de barba'],
      duracionTotal: '1h 15min',
      precioRegular: 450,
      precioOfertado: 320,
      tieneOferta: true,
      categoria: 'Promoción',
      estado: 'Activo',
    },
    {
      id: 'p2',
      nombrePaquete: 'Combo Full Relax',
      descripcion: 'Corte + Barba + Mascarilla Facial.',
      serviciosIncluidos: ['Corte clásico', 'Arreglo de barba', 'Mascarilla Facial'],
      duracionTotal: '1h 40min',
      precioRegular: 600,
      precioOfertado: 500,
      tieneOferta: false,
      categoria: 'Estándar',
      estado: 'Activo',
    },
  ]);

  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState<Servicio | null>(null);

  const [modalPaqueteAbierto, setModalPaqueteAbierto] = useState(false);
  const [paqueteAEditar, setPaqueteAEditar] = useState<Paquete | null>(null);

  const handleGuardarServicio = (serv: Servicio) => {
    if (servicioAEditar) {
      setServicios((prev) => prev.map((s) => (s.id === serv.id ? serv : s)));
    } else {
      setServicios((prev) => [serv, ...prev]);
    }
  };

  const handleCambiarEstadoServicio = (id: string) => {
    setServicios((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, estado: s.estado === 'Activo' ? 'Inactivo' : 'Activo' } : s
      )
    );
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
    // 1. Primero por estado (Cola: Activos arriba, Inactivos abajo)
    if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
    if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;

    // 2. Luego por precio (si el filtro de precio está activo)
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
    // 1. Primero por estado (Cola: Activos arriba, Inactivos abajo)
    if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
    if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;

    // Obtener precio efectivo a pagar (oferta si está activa, de lo contrario precio regular)
    const precioEfectivoA = a.tieneOferta && a.precioOfertado ? a.precioOfertado : a.precioRegular;
    const precioEfectivoB = b.tieneOferta && b.precioOfertado ? b.precioOfertado : b.precioRegular;

    // 2. Orden por precio inteligente (incluyendo ofertas)
    if (ordenPrecio === 'menor-mayor') return precioEfectivoA - precioEfectivoB;
    if (ordenPrecio === 'mayor-menor') return precioEfectivoB - precioEfectivoA;

    return 0;
  });

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
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setServicioAEditar(serv);
                            setModalServicioAbierto(true);
                          }}
                          className="inline-flex w-24 items-center justify-center whitespace-nowrap rounded-lg border border-gray-700 bg-[#1e2538] px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-700"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleCambiarEstadoServicio(serv.id)}
                          className="inline-flex w-24 items-center justify-center whitespace-nowrap rounded-lg border border-gray-700 bg-[#1e2538] px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-700"
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
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setPaqueteAEditar(pq);
                              setModalPaqueteAbierto(true);
                            }}
                            className="inline-flex w-24 items-center justify-center whitespace-nowrap rounded-lg border border-gray-700 bg-[#1e2538] px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:bg-gray-700"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleCambiarEstadoPaquete(pq.id)}
                            className="inline-flex w-24 items-center justify-center whitespace-nowrap rounded-lg border border-gray-700 bg-[#1e2538] px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:bg-gray-700"
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