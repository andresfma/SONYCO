import { useParams, useNavigate } from 'react-router-dom';
import { EntityDetailView, type DetailField } from '../../components/Views/EntityDetailView';
import type { Inventario } from '../../types/index';

export default function InventarioDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!id) {
        return <div>ID de inventario no válido</div>;
    }

    // Configuración de campos para mostrar detalles del inventario
    const inventarioFields: DetailField[] = [
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
            key: 'estado',
            label: 'Estado',
            type: 'boolean'
        },
        {
            key: 'cantidad',
            label: 'Cantidad actual',
            type: 'text'
        },
        {
            key: 'cantidad_minima',
            label: 'Cantidad mínima',
            type: 'text'
        },
    ];

    // Botones de acción adicionales
    const actionButtons = (
        <>
            <button
                onClick={() => navigate(`/inventarios/${id}/editar`)}
                className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
            >
                Editar
            </button>
            <button
                onClick={() => navigate('/inventarios')}
                className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
            >
                Ver Todos
            </button>
        </>
    );

    return (
        <EntityDetailView<Inventario>
            entityType='inventarios'
            entityId={id}
            title='Detalle del inventario'
            subtitle='Información completa del inventario seleccionado.'
            fields={inventarioFields}
            backPath='/inventarios'
            actions={actionButtons}
        />
    );
}