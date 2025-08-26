import { useParams, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { EntityDetailView, type DetailField } from '../../components/Views/EntityDetailView';
import { DetalleVentasTable } from '../../components/DetalleVentasTable';
import type { Venta, DetalleVenta } from '../../types/index';
import { useNotificationHelpers } from '../../hooks/Auxiliaries/useNotificationHelpers';
import api from '../../api/axiosInstance';

export default function VentaDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Estado para forzar re-render del EntityDetailView
    const [refreshKey, setRefreshKey] = useState(0);

    if (!id) {
        return <div>ID de venta no válido</div>;
    }

    const ventaId = parseInt(id, 10);

    // Configuración de campos para mostrar detalles de la venta
    const ventaFields: DetailField[] = [
        {
            key: 'id',
            label: 'Identificador',
            type: 'text'
        },
        {
            key: 'cliente',
            label: 'Cliente',
            type: 'nested',
            nestedFields: [
                {
                    key: 'nombre',
                    label: 'Nombre',
                    type: 'text'
                }
            ],
            render: (cliente) => (
                <button
                    onClick={() => navigate(`/clientes/${cliente?.id}`)}
                    className="text-blue hover:text-blue_hover underline"
                >
                    {cliente?.nombre || 'Sin cliente'}
                </button>
            )
        },
        {
            key: 'usuario',
            label: 'Vendedor',
            type: 'nested',
            nestedFields: [
                {
                    key: 'nombre',
                    label: 'Nombre',
                    type: 'text'
                }
            ],
            render: (usuario) => (
                <button
                    onClick={() => navigate(`/usuarios/${usuario?.id}`)}
                    className="text-blue hover:text-blue_hover underline"
                >
                    {usuario?.nombre || 'Sin usuario'}
                </button>
            )
        },
        {
            key: 'fecha',
            label: 'Fecha',
            type: 'date'
        },
        {
            key: 'total',
            label: 'Total',
            type: 'currency'
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean'
        },
    ];

    // Handler para editar un detalle de venta
    const handleDetalleVentaEdit = (detalle_venta: DetalleVenta) => {
        // Navegar a página de edición del detalle_venta incluyendo el ventaId
        navigate(`/ventas/${ventaId}/detalle_venta/${detalle_venta.id}/editar`);
    };

    // Handler para después de eliminar un detalle - forzar re-render
    const handleAfterDelete = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Botones de acción adicionales
    const actionButtons = (
        <>
            <button
                onClick={() => navigate(`/ventas/${id}/editar`)}
                className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
            >
                Editar
            </button>
            <button
                onClick={() => navigate('/ventas')}
                className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
            >
                Ver Todos
            </button>
        </>
    );

    // Gestión de exportación para detalle-venta
    const { notifySuccess, notifyError } = useNotificationHelpers();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Llamada a la API de exportación
            const response = await api.get(`/exportar/detalles/${ventaId}`, {
                responseType: 'blob', // Importante para archivos
            });

            // Crear URL del blob para descarga
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/octet-stream'
            });
            const url = window.URL.createObjectURL(blob);

            // Obtener nombre del archivo del header o usar uno por defecto
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'venta_detalle_export.xlsx'; // nombre por defecto

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

    return (
        <div>
            {/* Vista de detalle de la venta */}
            <EntityDetailView<Venta>
                key={refreshKey}
                entityType='ventas'
                entityId={id}
                title='Detalle de la venta'
                subtitle='Información completa de la venta seleccionada.'
                fields={ventaFields}
                backPath='/ventas'
                actions={actionButtons}
            />

            <div className='p-4'>
                {/* Sección de productos vendidos */}
                <div className="p-6 bg-white rounded-lg border">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-cl_font_main">
                                Productos Vendidos
                            </h2>
                            <p className="text-cl_font_sec mt-1">
                                Detalles de los productos incluidos en esta venta.
                            </p>
                        </div>

                        {/* Botones acciones para detalle_venta */}
                        <div className='space-x-4'>
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
                                onClick={() => navigate(`/ventas/${ventaId}/agregar-producto`)}
                                className="bg-orange hover:bg-orange_hover text-white px-4 py-2 rounded transition-colors"
                            >
                                Agregar Producto
                            </button>
                        </div>
                    </div>

                    {/* Tabla de detalles de venta */}
                    <DetalleVentasTable
                        ventaId={ventaId}
                        onClientEdit={handleDetalleVentaEdit}
                        onAfterDelete={handleAfterDelete}
                        showActions={{
                            detail: false,
                            edit: true,
                            toggleActive: false,
                            delete: true
                        }}
                    />
                </div>
            </div>
        </div>
    );
}