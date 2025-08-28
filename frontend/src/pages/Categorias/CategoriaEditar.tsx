import { useParams } from "react-router-dom";
import { EntityEditView, type EditField } from "../../components/Views/EntityEditView";
import type { Categoria } from "../../types/index";

export default function CategoriaEditar() {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return <div>ID de categoria no válido</div>;
    }

    // Configuración de campos para editar categoria
    const categoriaEditFields: EditField[] = [
        {
            key: 'nombre',
            label: 'Nombre',
            type: 'text',
            required: true,
            placeholder: 'Nombre del categoria',
            validation: (value) => {
                if (!value) {
                    return 'El nombre es obligatorio';
                }

                const trimmed = value.trim();

                // Verificar espacios al inicio o final
                if (value !== trimmed) {
                    return 'El nombre no puede comenzar ni terminar con espacios';
                }

                if (trimmed.length < 3) {
                    return 'El nombre debe tener al menos 3 caracteres';
                }

                // Validar que solo tenga letras y espacios (si no quieres números ni símbolos)
                const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
                if (!nameRegex.test(trimmed)) {
                    return 'El nombre solo puede contener letras y espacios';
                }

                return null;
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean',
            required: true
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            type: 'textarea',
            placeholder: 'Descripción de la categoría'
        },
    ];

    return (
        <EntityEditView<Categoria>
            entityType="categorias"
            entityId={id}
            title="Editar Categoria"
            subtitle="Modifica la información de la categoria."
            fields={categoriaEditFields}
            backPath="/categorias"
            detailPath={`/categorias/${id}`}
        />
    );
}