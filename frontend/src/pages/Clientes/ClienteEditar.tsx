import { useParams } from "react-router-dom";
import { EntityEditView, type EditField } from "../../components/Views/EntityEditView";
import type { Cliente } from "../../types/index";

export default function ClienteEditar() {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return <div>ID de cliente no válido</div>;
    }

    // Configuración de campos para editar cliente
    const clientEditFields: EditField[] = [
        {
            key: 'nombre',
            label: 'Nombre',
            type: 'text',
            required: true,
            placeholder: 'Nombre del cliente',
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
            key: 'email',
            label: 'Email',
            type: 'text',
            required: true,
            placeholder: 'Ej: wonka@email.com',
            validation: (value) => {
                if (!value) {
                    return 'El correo es obligatorio';
                }

                const trimmed = value.trim();

                // Verificar espacios al inicio o final
                if (value !== trimmed) {
                    return 'El email no puede comenzar ni terminar con espacios';
                }

                if (trimmed.length < 5) {
                    return 'El correo debe tener al menos 5 caracteres';
                }

                // Validación ligera (no reemplaza la del backend)
                const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!basicEmailRegex.test(trimmed)) {
                    return 'El correo no parece válido';
                }

                return null;
            }
        },
        {
            key: 'telefono',
            label: 'Teléfono',
            type: 'text',
            required: true,
            placeholder: 'Teléfono del cliente',
            validation: (value) => {
                if (!value) {
                    return 'El teléfono es obligatorio';
                }

                const trimmed = value.trim();

                // Verificar espacios al inicio o final
                if (value !== trimmed) {
                    return 'El teléfono no puede comenzar ni terminar con espacios';
                }

                // Permitir números, espacios, +, -, paréntesis
                const phoneRegex = /^[0-9+\-\s()]+$/;
                if (!phoneRegex.test(trimmed)) {
                    return 'El teléfono solo puede contener números y caracteres válidos (+, -, espacio, paréntesis)';
                }

                // Validar longitud mínima
                const digitsOnly = trimmed.replace(/\D/g, ''); // quita todo lo que no sea número
                if (digitsOnly.length < 7) {
                    return 'El teléfono debe tener al menos 7 dígitos';
                }

                return null;
            }
        },
        {
            key: 'direccion',
            label: 'Dirreción',
            type: 'text',
            placeholder: 'Dirección del cliente'
        },
        {
            key: 'tipo_persona',
            label: 'Tipo de persona',
            type: 'select',
            required: true,
            options: [
                { value: 'natural', label: 'Natural' },
                { value: 'juridica', label: 'Jurídica' }
            ]
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean',
            required: true
        },
        {
            key: 'identificacion',
            label: 'Identificación',
            type: 'text',
            required: true,
            placeholder: 'CC / NIT / RUT',
            validation: (value) => {
                if (!value) {
                    return 'El ID es obligatorio';
                }

                const trimmed = value.trim();

                // Verificar espacios al inicio o final
                if (value !== trimmed) {
                    return 'El ID no puede comenzar ni terminar con espacios';
                }

                if (trimmed.length < 5) {
                    return 'El ID debe tener al menos 5 caracteres';
                }

                return null;
            }
        },
    ];

    return (
        <EntityEditView<Cliente>
            entityType="clientes"
            entityId={id}
            title="Editar Cliente"
            subtitle="Modifica la información del cliente."
            fields={clientEditFields}
            backPath="/clientes"
            detailPath={`/clientes/${id}`}
        />
    );
}