import React, { useState } from 'react';
import type { Barbero, PublicacionCorte } from '../../types';

interface TarjetaBarberoProps {
  barbero: Barbero;
  onEditar: (barbero: Barbero) => void;
  onCambiarEstado: (id: string) => void;
  onAgregarCorte: (idBarbero: string, publicacion: Omit<PublicacionCorte, 'id'>) => Promise<void> | void;
}

export const TarjetaBarbero: React.FC<TarjetaBarberoProps> = ({
  barbero,
  onEditar,
  onCambiarEstado,
  onAgregarCorte,
}) => {
  const [modalCorteAbierto, setModalCorteAbierto] = useState(false);
  const [tituloCorte, setTituloCorte] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotoAntes, setFotoAntes] = useState('');
  const [fotoDespues, setFotoDespues] = useState('');
  const [errorPublicacion, setErrorPublicacion] = useState<string | null>(null);
  const [guardandoPublicacion, setGuardandoPublicacion] = useState(false);

  const activo = barbero.estado === 'Activo';

  const handleSubmitCorte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fotoDespues || !tituloCorte) return;

    setGuardandoPublicacion(true);
    setErrorPublicacion(null);
    try {
      await onAgregarCorte(barbero.id, {
        tituloCorte,
        descripcion,
        fotoAntes,
        fotoDespues,
      });

      setTituloCorte('');
      setDescripcion('');
      setFotoAntes('');
      setFotoDespues('');
      setModalCorteAbierto(false);
    } catch (error) {
      setErrorPublicacion(
        error instanceof Error ? error.message : 'No se pudo guardar la publicación.'
      );
    } finally {
      setGuardandoPublicacion(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 rounded-2xl border bg-zinc-900 p-5 shadow-xl transition-all xl:flex-row xl:p-6 ${activo ? 'border-zinc-800' : 'border-zinc-800 opacity-60'}`}>
      <div className="flex flex-col gap-4 xl:w-64 xl:shrink-0 xl:border-r xl:border-zinc-800 xl:pr-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 text-3xl">
            {barbero.fotoPerfil ? (
              <img src={barbero.fotoPerfil} alt={barbero.nombre} className="h-full w-full object-cover" />
            ) : (
              '✂️'
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{barbero.nombre}</h3>
            <p className="text-xs font-medium text-pink-400">{barbero.rol}</p>
            <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] ${activo ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'}`}>
              {barbero.estado}
            </span>
          </div>
        </div>

        <button
          onClick={() => setModalCorteAbierto(true)}
          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-600/20 py-2 text-xs font-semibold text-pink-400 transition-colors hover:bg-pink-600/30"
        >
          <span>📸 + Subir Antes / Después</span>
        </button>

        <div className="mt-auto flex w-full flex-col gap-2 border-t border-zinc-800 pt-4">
          <button
            onClick={() => onEditar(barbero)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => onCambiarEstado(barbero.id)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            {activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      <div className="min-w-0 flex-1 xl:pl-1">
        <h4 className="mb-4 border-t border-zinc-800 pt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 xl:border-t-0 xl:pt-0">
          Portafolio de Trabajos ({barbero.historialCortes.length})
        </h4>

        {barbero.historialCortes.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-2">Este barbero aún no ha subido publicaciones de sus cortes.</p>
        ) : (
          <div className="grid max-h-[34rem] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 2xl:grid-cols-3">
            {barbero.historialCortes.map((pub) => (
              <div key={pub.id} className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-bold text-white">{pub.tituloCorte}</h5>
                  <span className="text-[10px] text-zinc-500">
                    {pub.fecha ? new Date(pub.fecha).toLocaleDateString() : 'Reciente'}
                  </span>
                </div>
                {pub.descripcion && (
                  <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{pub.descripcion}</p>
                )}

                {/* Contenedor de Fotos: Antes y Después */}
                <div className="grid grid-cols-2 gap-2">
                  {pub.fotoAntes && (
                    <div className="relative group">
                      <span className="absolute top-1 left-1 bg-black/70 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded font-medium z-10">Antes</span>
                      <img src={pub.fotoAntes} alt="Antes del corte" className="h-44 w-full rounded-lg border border-zinc-800 object-cover" />
                    </div>
                  )}
                  <div className={`relative group ${!pub.fotoAntes ? 'col-span-2' : ''}`}>
                    <span className="absolute top-1 left-1 bg-pink-600/80 text-white text-[9px] px-1.5 py-0.5 rounded font-medium z-10">Después</span>
                    <img src={pub.fotoDespues} alt="Después del corte" className="h-44 w-full rounded-lg border border-zinc-800 object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal interno para subir publicación */}
      {modalCorteAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Nueva Publicación (Antes / Después)</h3>
              <button onClick={() => setModalCorteAbierto(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitCorte} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nombre / Título del Corte *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fade Bajo con Textura"
                  value={tituloCorte}
                  onChange={(e) => setTituloCorte(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-pink-600"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Descripción del trabajo</label>
                <textarea
                  placeholder="Detalles sobre las técnicas utilizadas..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-pink-600 h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">URL o Imagen del ANTES (Opcional)</label>
                <input
                  type="text"
                  placeholder="https://... o ruta de imagen"
                  value={fotoAntes}
                  onChange={(e) => setFotoAntes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-pink-600"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">URL o Imagen del DESPUÉS *</label>
                <input
                  type="text"
                  required
                  placeholder="https://... o ruta de imagen"
                  value={fotoDespues}
                  onChange={(e) => setFotoDespues(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-pink-600"
                />
              </div>

              {errorPublicacion && (
                <p role="alert" className="text-xs text-red-400">
                  {errorPublicacion}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalCorteAbierto(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPublicacion}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-medium shadow-lg shadow-pink-900/30"
                >
                  {guardandoPublicacion ? 'Guardando…' : 'Publicar en Portafolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};