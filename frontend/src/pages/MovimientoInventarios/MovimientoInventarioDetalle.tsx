import { useParams, useNavigate } from 'react-router-dom';
import { EntityDetailView, type DetailField } from '../../components/Views/EntityDetailView';
import type { MovimientoInventario } from '../../types/index';

export default function MovimientoInventarioDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!id) {
        return <div>ID de movimiento_inventario no válido</div>;
    }

    // Configuración de campos para mostrar detalles del movimiento_inventario
    const movimiento_inventarioFields: DetailField[] = [
        {
            key: 'id',
            label: 'Identificador',
            type: 'text'
        },
        {
            key: 'tipo',
            label: 'Tipo',
            type: 'text'
        },
        {
            key: 'producto',
            label: 'Producto',
            type: 'nested',
            nestedFields: [
                {
                    key: 'nombre',
                    label: 'Nombre',
                    type: 'text'
                },
                {
                    key: 'codigo',
                    label: 'Codigo',
                    type: 'text'
                },

            ],
            render: (producto) => (
                <button
                    onClick={() => navigate(`/productos/${producto?.id}`)}
                    className="text-blue hover:text-blue_hover underline"
                >
                    {producto?.nombre
                        ? `${producto.codigo}: ${producto.nombre}`
                        : 'Sin producto'}
                </button>
            )

        },
        {
            key: 'fecha',
            label: 'Fecha',
            type: 'date'
        },
        {
            key: 'cantidad',
            label: 'Cantidad del movimiento',
            type: 'text'
        },
        {
            key: 'cantidad_inventario',
            label: 'Inventario final',
            type: 'text'
        },
        {
            key: 'usuario',
            label: 'Usuario',
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
                    {usuario?.nombre || 'Sin producto'}
                </button>
            )
        },
        {
            key: 'venta_id',
            label: 'ID venta',
            type: 'text',
            render: (venta_id) => {
                const label = venta_id ? `N°${venta_id}` : 'Sin venta asociada';
                return (
                    <button
                        onClick={venta_id ? () => navigate(`/ventas/${venta_id}`) : undefined}
                        disabled={!venta_id}
                        className={`underline ${venta_id
                            ? 'text-blue hover:text-blue_hover cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {label}
                    </button>
                );
            }
        }

    ];

    // Botones de acción adicionales
    const actionButtons = (
        <>
            <button
                onClick={() => navigate('/movimientos')}
                className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
            >
                Ver Todos
            </button>
        </>
    );

    return (
        <EntityDetailView<MovimientoInventario>
            entityType="inventarios/movimientos"
            entityId={id}
            title="Detalle del Movimiento"
            subtitle="Información completa del movimiento seleccionado."
            fields={movimiento_inventarioFields}
            backPath="/movimientos"
            actions={actionButtons}
        />
    );
}