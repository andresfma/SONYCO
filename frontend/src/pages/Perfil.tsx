import { useAuth } from '../context/AuthContext';
import { EntityDetailView, type DetailField } from '../components/Views/EntityDetailView';
import type { Usuario } from '../types/index';
import { useNotificationHelpers } from '../hooks/Auxiliaries/useNotificationHelpers';
import { useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function PerfilDetalle() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const id = user?.id

    if (!id) {
        return <div>ID de usuario no válido</div>;
    }

    // Configuración de campos para mostrar detalles del usuario
    const clientFields: DetailField[] = [
        {
            key: 'nombre',
            label: 'Nombre',
            type: 'text'
        },
        {
            key: 'email',
            label: 'Email',
            type: 'text'
        },
        {
            key: 'rol_id',
            label: 'Rol',
            type: 'text',
            render: (rol_id) => {
                const tipos: Record<number, string> = {
                    1: 'Admin',
                    2: 'Usuario'
                };

                return tipos[rol_id] || rol_id;
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean'
        },

    ];

    // Gestión de exportación
    const { notifySuccess, notifyError } = useNotificationHelpers();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Llamada a la API de exportación
            const response = await api.get(`/exportar/movimientos/usuario/${id}`, {
                responseType: 'blob', // Importante para archivos
            });

            // Crear URL del blob para descarga
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/octet-stream'
            });
            const url = window.URL.createObjectURL(blob);

            // Obtener nombre del archivo del header o usar uno por defecto
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'usuario_movimientos_export.xlsx'; // nombre por defecto

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
            console.error('Error al exportar ventas:', err);

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

    // Botones de acción adicionales
    const actionButtons = (
        <>
            <button
                onClick={() => navigate(`/dashboard`)}
                className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
            >
                Inicio
            </button>
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
                    'Exportar movimientos'
                )}
            </button>
        </>
    );

    return (
        <EntityDetailView<Usuario>
            entityType='auth'
            entityId={id}
            title='Perfil del usuario'
            subtitle='Información detallada del usuario actual.'
            fields={clientFields}
            backPath='/dashboard'
            actions={actionButtons}
        />
    );
}