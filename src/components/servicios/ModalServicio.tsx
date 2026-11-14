import React, { useState } from 'react';
import type { Servicio } from '../../types';

interface PropsModalServicio {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (servicio: Servicio) => Promise<void> | void;
  servicioAEditar?: Servicio | null;
}

export const ModalServicio: React.FC<PropsModalServicio> = ({
  isOpen,
  ...props
}) => {
  if (!isOpen) return null;

  return <FormularioModalServicio key={props.servicioAEditar?.id ?? 'nuevo'} {...props} />;
};

type PropsFormularioModalServicio = Omit<PropsModalServicio, 'isOpen'>;

const FormularioModalServicio: React.FC<PropsFormularioModalServicio> = ({
  onClose,
  onGuardar,
  servicioAEditar,
}) => {
  const [nombreServicio, setNombreServicio] = useState(servicioAEditar?.nombreServicio ?? '');
  const [descripcion, setDescripcion] = useState(servicioAEditar?.descripcion ?? '');
  const [duracion, setDuracion] = useState(servicioAEditar?.duracion ?? '30 min');
  const [precio, setPrecio] = useState(servicioAEditar?.precio ?? 200);
  const [categoria, setCategoria] = useState<'Cabello' | 'Barba' | 'Facial'>(
    servicioAEditar?.categoria ?? 'Cabello'
  );
  const [foto, setFoto] = useState(servicioAEditar?.foto ?? '');
  const [tieneOferta, setTieneOferta] = useState(servicioAEditar?.tieneOferta ?? false);
  const [precioOfertado, setPrecioOfertado] = useState(
    servicioAEditar?.precioOfertado ?? servicioAEditar?.precio ?? 150
  );
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreServicio.trim()) return;

    const servicioData: Servicio = {
      id: servicioAEditar ? servicioAEditar.id : Date.now().toString(),
      nombreServicio,
      descripcion,
      duracion,
      precio: Number(precio),
      tieneOferta,
      precioOfertado: tieneOferta ? Number(precioOfertado) : undefined,
      categoria,
      foto,
      estado: servicioAEditar ? servicioAEditar.estado : 'Activo',
    };

    setGuardando(true);
    setErrorGuardar(null);
    try {
      await onGuardar(servicioData);
      onClose();
    } catch (error) {
      setErrorGuardar(error instanceof Error ? error.message : 'No se pudo guardar el servicio.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B2C] border border-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            {servicioAEditar ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre del servicio</label>
            <input
              type="text"
              required
              placeholder="Ej. Corte clásico"
              value={nombreServicio}
              onChange={(e) => setNombreServicio(e.target.value)}
              className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 rounded-lg p-2.5 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as 'Cabello' | 'Barba' | 'Facial')}
              className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 rounded-lg p-2.5 focus:outline-none"
            >
              <option value="Cabello">Cabello</option>
              <option value="Barba">Barba</option>
              <option value="Facial">Facial / Tratamiento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea
              placeholder="Breve descripción del servicio..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 rounded-lg p-2.5 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Duración</label>
              <input
                type="text"
                placeholder="Ej. 30 min"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 rounded-lg p-2.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Precio ($ MXN)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 rounded-lg p-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">URL de foto referencial (Opcional)</label>
            <input
              type="text"
              placeholder="https://..."
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              className="w-full bg-[#1e2538] border border-gray-700 text-gray-200 rounded-lg p-2.5 focus:outline-none"
            />
          </div>

          <div className="space-y-3 rounded-lg border border-gray-800 bg-[#131726] p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={tieneOferta}
                onChange={(e) => setTieneOferta(e.target.checked)}
                className="rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-white">¿Activar oferta para este servicio?</span>
            </label>

            {tieneOferta && (
              <div>
                <label className="mb-1 block text-xs text-gray-400">Precio con oferta ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={precio}
                  required
                  value={precioOfertado}
                  onChange={(e) => setPrecioOfertado(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-[#1e2538] p-2.5 text-gray-200 focus:outline-none"
                />
              </div>
            )}
          </div>

          {errorGuardar && (
            <p role="alert" className="text-sm text-red-400">
              {errorGuardar}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-200 font-semibold"
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};