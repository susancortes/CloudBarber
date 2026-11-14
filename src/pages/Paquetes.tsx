import React, { useEffect, useState } from 'react';
import { ModalConfirmacion } from '../components/common/ModalConfirmacion';
import { ModalPaquete } from '../components/servicios/ModalPaquete';
import type { Paquete } from '../types';

interface ServicioApi {
  id: string | number;
  nombre_servicio: string;
}

interface PaqueteApi {
  id: string | number;
  nombrePaquete: string;
  descripcion: string;
  serviciosIncluidos: string[];
  duracionTotal: string;
  precioRegular: number | string;
  precioOfertado: number | string | null;
  tieneOferta: boolean;
  categoria?: Paquete['categoria'];
  estado: Paquete['estado'];
}

interface ServicioCatalogo {
  id: string;
  nombre: string;
}

const obtenerServicios = async (): Promise<ServicioCatalogo[]> => {
  const response = await fetch('http://localhost:4000/api/servicios');
  if (!response.ok) {
    throw new Error(`Error al obtener servicios: ${response.status}`);
  }

  const data: ServicioApi[] = await response.json();
  return data.map((servicio) => ({
    id: String(servicio.id),
    nombre: servicio.nombre_servicio,
  }));
};

const obtenerPaquetes = async (): Promise<Paquete[]> => {
  const response = await fetch('http://localhost:4000/api/paquetes');
  if (!response.ok) {
    throw new Error(`Error al obtener paquetes: ${response.status}`);
  }

  const data: PaqueteApi[] = await response.json();
  return data.map((paquete) => ({
    ...paquete,
    id: String(paquete.id),
    precioRegular: Number(paquete.precioRegular),
    precioOfertado: paquete.precioOfertado === null
      ? undefined
      : Number(paquete.precioOfertado),
  }));
};

export const Paquetes: React.FC = () => {
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [ordenPrecio, setOrdenPrecio] = useState<'ninguno' | 'menor-mayor' | 'mayor-menor'>('ninguno');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [paqueteAEditar, setPaqueteAEditar] = useState<Paquete | null>(null);
  const [paqueteAEliminar, setPaqueteAEliminar] = useState<Paquete | null>(null);
  const [eliminandoPaquete, setEliminandoPaquete] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([obtenerServicios(), obtenerPaquetes()])
      .then(([serviciosResult, paquetesResult]) => {
        if (!mounted) return;

        if (serviciosResult.status === 'fulfilled') {
          setServicios(serviciosResult.value);
        } else {
          console.error('Error al obtener servicios:', serviciosResult.reason);
        }

        if (paquetesResult.status === 'fulfilled') {
          setPaquetes(paquetesResult.value);
        } else {
          console.error('Error al obtener paquetes:', paquetesResult.reason);
        }
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleGuardarPaquete = async (paquete: Paquete) => {
    const serviciosIds = paquete.serviciosIncluidos.map((nombreServicio) => {
      const servicio = servicios.find(
        (item) => item.nombre.trim().toLocaleLowerCase() === nombreServicio.trim().toLocaleLowerCase()
      );
      if (!servicio) {
        throw new Error(`No se encontró el servicio "${nombreServicio}" en el catálogo.`);
      }

      const id = Number(servicio.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error(`El servicio "${nombreServicio}" tiene un identificador inválido.`);
      }
      return id;
    });

    const response = await fetch(
      paqueteAEditar
        ? `http://localhost:4000/api/paquetes/${paquete.id}`
        : 'http://localhost:4000/api/paquetes',
      {
        method: paqueteAEditar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_paquete: paquete.nombrePaquete,
          descripcion: paquete.descripcion,
          duracion_total: paquete.duracionTotal,
          precio_regular: paquete.precioRegular,
          precio_ofertado: paquete.tieneOferta ? paquete.precioOfertado : null,
          tiene_oferta: paquete.tieneOferta,
          servicios_ids: serviciosIds,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`No se pudo guardar el paquete (${response.status}).`);
    }

    const result: { id?: string | number } = await response.json();
    const paqueteGuardado = {
      ...paquete,
      id: paqueteAEditar ? paquete.id : String(result.id),
    };

    setPaquetes((prev) =>
      paqueteAEditar
        ? prev.map((item) => (item.id === paquete.id ? paqueteGuardado : item))
        : [paqueteGuardado, ...prev]
    );
  };

  const handleCambiarEstado = (id: string) => {
    setPaquetes((prev) =>
      prev.map((paquete) =>
        paquete.id === id
          ? { ...paquete, estado: paquete.estado === 'Activo' ? 'Inactivo' : 'Activo' }
          : paquete
      )
    );
  };

  const handleEliminarPaquete = async () => {
    if (!paqueteAEliminar) return;
    setEliminandoPaquete(true);
    setErrorEliminar(null);
    try {
      const response = await fetch(`http://localhost:4000/api/paquetes/${paqueteAEliminar.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`No se pudo eliminar el paquete (${response.status}).`);
      }

      setPaquetes((prev) => prev.filter((paquete) => paquete.id !== paqueteAEliminar.id));
      setPaqueteAEliminar(null);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido.';
      console.error('Error al eliminar paquete:', error);
      setErrorEliminar(mensaje);
    } finally {
      setEliminandoPaquete(false);
    }
  };

  const paquetesFiltrados = paquetes.filter((paquete) => {
    if (filtroCategoria === 'ofertas' && !paquete.tieneOferta) return false;
    if (filtroCategoria === 'estandar' && paquete.tieneOferta) return false;
    return true;
  });

  const paquetesProcesados = [...paquetesFiltrados].sort((a, b) => {
    if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
    if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;

    const precioA = a.tieneOferta && a.precioOfertado ? a.precioOfertado : a.precioRegular;
    const precioB = b.tieneOferta && b.precioOfertado ? b.precioOfertado : b.precioRegular;
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
          <h1 className="text-2xl font-bold text-white">Paquetes</h1>
          <p className="text-sm text-gray-400">Administra los paquetes y sus ofertas.</p>
        </div>
        <button
          onClick={() => {
            setPaqueteAEditar(null);
            setModalAbierto(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200"
        >
          + Añadir Paquete
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-800 bg-[#161B2C] p-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Filtrar paquetes</label>
          <select
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#1e2538] p-2.5 text-sm text-gray-200 focus:outline-none"
          >
            <option value="todas">Todos los paquetes</option>
            <option value="ofertas">Solo paquetes con oferta activa</option>
            <option value="estandar">Solo paquetes a precio regular</option>
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
                <th className="px-6 py-3 font-medium">Paquete</th>
                <th className="px-6 py-3 font-medium">Incluye</th>
                <th className="px-6 py-3 font-medium">Duración</th>
                <th className="px-6 py-3 font-medium">Precios</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="w-[270px] whitespace-nowrap px-6 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-sm">
              {paquetesProcesados.map((paquete) => {
                const activo = paquete.estado === 'Activo';
                return (
                  <tr key={paquete.id} className={`transition-colors hover:bg-[#1e2538]/50 ${!activo ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-white">{paquete.nombrePaquete}</td>
                    <td className="max-w-xs px-6 py-4 text-gray-300">{paquete.serviciosIncluidos.join(', ')}</td>
                    <td className="px-6 py-4 text-gray-300">{paquete.duracionTotal}</td>
                    <td className="px-6 py-4">
                      {paquete.tieneOferta ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 line-through">${paquete.precioRegular}.00 MXN</span>
                          <span className="text-base font-bold text-emerald-400">${paquete.precioOfertado}.00 MXN</span>
                          <span className="mt-0.5 text-[10px] font-medium text-amber-400">¡Oferta Activa!</span>
                        </div>
                      ) : (
                        <span className="font-bold text-white">${paquete.precioRegular}.00 MXN</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${activo ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-gray-500/20 bg-gray-500/10 text-gray-400'}`}>
                        {paquete.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setPaqueteAEditar(paquete);
                            setModalAbierto(true);
                          }}
                          className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-gray-700 bg-[#1e2538] px-2 py-1.5 text-[11px] font-medium leading-4 text-gray-200 transition-colors hover:bg-gray-700"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(paquete.id)}
                          className="whitespace-nowrap rounded-lg border border-gray-700 bg-[#1e2538] px-2 py-1.5 text-[11px] font-medium leading-4 text-gray-200 transition-colors hover:bg-gray-700"
                        >
                          {activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => {
                            setErrorEliminar(null);
                            setPaqueteAEliminar(paquete);
                          }}
                          className="whitespace-nowrap rounded-lg border border-red-900 bg-red-950/40 px-2 py-1.5 text-[11px] font-medium leading-4 text-red-300 transition-colors hover:bg-red-900/60"
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

      {modalAbierto && (
        <ModalPaquete
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardarPaquete}
          paqueteAEditar={paqueteAEditar}
        />
      )}
      <ModalConfirmacion
        isOpen={paqueteAEliminar !== null}
        titulo="Eliminar paquete"
        mensaje={`¿Deseas eliminar "${paqueteAEliminar?.nombrePaquete}"? Las citas asociadas quedarán sin este paquete. Esta acción no se puede deshacer.`}
        error={errorEliminar}
        confirmando={eliminandoPaquete}
        onCancelar={() => {
          setPaqueteAEliminar(null);
          setErrorEliminar(null);
        }}
        onConfirmar={handleEliminarPaquete}
      />
    </div>
  );
};