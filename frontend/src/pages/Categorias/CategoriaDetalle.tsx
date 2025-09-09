import { useParams, useNavigate } from 'react-router-dom';
import { EntityDetailView, type DetailField } from '../../components/Views/EntityDetailView';
import type { Categoria } from '../../types/index';

export default function CategoriaDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!id) {
        return <div>ID de categoria no válido</div>;
    }

    // Configuración de campos para mostrar detalles la categoria
    const categoriaFields: DetailField[] = [
        {
            key: 'nombre',
            label: 'Nombre',
            type: 'text'
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            type: 'text'
        },
    ];

    // Botones de acción adicionales
    const actionButtons = (
        <>
            <button
                onClick={() => navigate(`/categorias/${id}/editar`)}
                className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
            >
                Editar
            </button>
            <button
                onClick={() => navigate('/categorias')}
                className="bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
            >
                Ver Todos
            </button>
        </>
    );

    return (
        <EntityDetailView<Categoria>
            entityType='categorias'
            entityId={id}
            title='Detalle de la Categoría'
            subtitle='Información completa de la categoría seleccionada.'
            fields={categoriaFields}
            backPath='/categorias'
            actions={actionButtons}
        />
    );
}