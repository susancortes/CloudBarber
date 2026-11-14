import React from 'react';

interface PropsModalConfirmacion {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  error?: string | null;
  confirmando?: boolean;
  onCancelar: () => void;
  onConfirmar: () => void | Promise<void>;
}

export const ModalConfirmacion: React.FC<PropsModalConfirmacion> = ({
  isOpen,
  titulo,
  mensaje,
  error,
  confirmando = false,
  onCancelar,
  onConfirmar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacion-titulo"
        aria-describedby="modal-confirmacion-mensaje"
        className="w-full max-w-md overflow-hidden rounded-xl border border-gray-800 bg-[#161B2C] shadow-2xl"
      >
        <div className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-lg font-bold text-red-400">
            !
          </div>
          <div>
            <h2 id="modal-confirmacion-titulo" className="text-lg font-bold text-white">
              {titulo}
            </h2>
            <p id="modal-confirmacion-mensaje" className="mt-2 text-sm leading-6 text-gray-400">
              {mensaje}
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mx-6 mb-4 rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-800 px-6 py-4">
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void onConfirmar()}
            disabled={confirmando}
            className="rounded-lg border border-red-500/30 bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmando ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};
