import { useNavigate } from 'react-router-dom';
import { UsuariosTable } from '../../components/UsuariosTable';
import type { Usuario } from '../../types/index';
import { useState } from 'react';
import { useNotificationHelpers } from '../../hooks/Auxiliaries/useNotificationHelpers';
import api from '../../api/axiosInstance';

export default function Usuarios() {
  const navigate = useNavigate();

  // Gestión de exportación
  const { notifySuccess, notifyError } = useNotificationHelpers();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Llamada a la API de exportación
      const response = await api.get('/exportar/usuarios', {
        responseType: 'blob', // Importante para archivos
      });

      // Crear URL del blob para descarga
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);

      // Obtener nombre del archivo del header o usar uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'usuarios_export.xlsx'; // nombre por defecto

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Crear link temporal y hacer click para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Notificación de éxito
      notifySuccess(
        'Exportación exitosa',
        'El archivo se ha descargado correctamente'
      );

    } catch (err: any) {
      console.error('Error al exportar usuarios:', err);

      // Notificación de error
      if (err.response?.status === 404) {
        notifyError(
          'Error de exportación',
          'No se encontró el servicio de exportación'
        );
      } else if (err.response?.status === 500) {
        notifyError(
          'Error del servidor',
          'Error interno al generar el archivo'
        );
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        notifyError(
          'Error de conexión',
          'No se pudo conectar con el servidor'
        );
      } else {
        notifyError(
          'Error de exportación',
          err.response?.data?.detail || 'Ocurrió un error inesperado'
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Handlers personalizados para las acciones (opcionales)
  const handleUserDetail = (usuario: Usuario) => {
    // Navegar a página de detalle del usuario
    navigate(`/usuarios/${usuario.id}`);
  };

  const handleUserEdit = (usuario: Usuario) => {
    // Navegar a página de edición del usuario
    navigate(`/usuarios/${usuario.id}/editar`);
  };

  return (
    < div className="p-4" >
      <div className="mb-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue hover:text-blue_hover font-medium transition-colors"
        >
          ← Volver
        </button>
      </div>
      <div className="flex justify-between items-center mb-8 pb-2">
        {/* Texto */}
        <div>
          <h1 className="text-2xl font-semibold text-cl_font_main">
            Lista de Usuarios
          </h1>
          <p className="text-cl_font_sec mt-1">
            Crea, edita y administra cada detalle de tus usuarios.
          </p>
        </div>

        {/* Botones */}
        <div className="space-x-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-4 py-2 rounded transition-colors text-white ${isExporting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue hover:bg-blue_hover'
              }`}
          >
            {isExporting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Exportando...
              </span>
            ) : (
              'Exportar'
            )}
          </button>

          <button
            onClick={() => navigate('/usuarios/crear')}
            className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
          >
            Nuevo Usuario
          </button>
        </div>
      </div>


      <UsuariosTable
        onUserDetail={handleUserDetail}
        onUserEdit={handleUserEdit}
        showActions={{
          detail: true,
          edit: true,
          toggleActive: true,
          delete: true
        }}
      />
    </div>
  );
}