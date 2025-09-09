import { EntityCreateView, type CreateField } from '../../components/Views/EntityCreateView';
import type { Categoria } from '../../types/index';

export default function CategoriaCrear() {
    // Configuración de campos para crear categoria
    const categoriaCreateFields: CreateField[] = [
        {
            key: 'nombre',
            label: 'Nombre',
            type: 'text',
            required: true,
            placeholder: 'Nombre de la categoria',
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
            placeholder: 'Descripción de la categoria'
        },
    ];

    return (
        <EntityCreateView<Categoria>
            entityType="categorias"
            title="Crear Nueva Categoría"
            subtitle="Completa la información de la categoría"
            fields={categoriaCreateFields}
            backPath="categorias"
        />
    );
}