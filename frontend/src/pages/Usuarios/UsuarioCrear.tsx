import { EntityCreateView, type CreateField } from '../../components/Views/EntityCreateView';
import type { Usuario } from '../../types/index';

export default function UsuarioCrear() {
    // Configuración de campos para crear usuario
    const userCreateFields: CreateField[] = [
        {
            key: 'nombre',
            label: 'Nombre',
            type: 'text',
            required: true,
            placeholder: 'Nombre del usuario',
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

                // Validar que solo tenga letras y espacios
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
            key: 'rol_id',
            label: 'Rol',
            type: 'select',
            required: true,
            options: [
                { value: 1, label: 'Admin' },
                { value: 2, label: 'Usuario' },
            ]
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean',
            required: true
        },
        {
            key: 'contrasena',
            label: 'Contraseña',
            type: 'password',
            required: true,
            placeholder: 'Ingresa la contraseña',
            confirmField: 'confirmar_contrasena',
            validation: (value) => {
                if (!value) {
                    return 'La contraseña es obligatoria';
                }

                if (value.length < 8) {
                    return 'La contraseña debe tener al menos 8 caracteres';
                }

                // Validar que tenga al menos una mayúscula, una minúscula y un número
                const hasUpperCase = /[A-Z]/.test(value);
                const hasLowerCase = /[a-z]/.test(value);
                const hasNumbers = /\d/.test(value);

                if (!hasUpperCase) {
                    return 'La contraseña debe contener al menos una letra mayúscula';
                }

                if (!hasLowerCase) {
                    return 'La contraseña debe contener al menos una letra minúscula';
                }

                if (!hasNumbers) {
                    return 'La contraseña debe contener al menos un número';
                }

                return null;
            }
        },
        {
            key: 'confirmar_contrasena',
            label: 'Confirmar Contraseña',
            type: 'password',
            required: true,
            placeholder: 'Confirma la contraseña',
            validation: (value) => {
                if (!value) {
                    return 'Debes confirmar la contraseña';
                }
                return null;
            }
        },
    ];

    return (
        <EntityCreateView<Usuario>
            entityType="usuarios"
            title="Crear Nuevo Usuario"
            subtitle="Completa la información del usuario"
            fields={userCreateFields}
            backPath="usuarios"
        />
    );
}