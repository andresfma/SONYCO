import { EntityCreateView, type CreateField } from '../../components/Views/EntityCreateView';
import type { Producto } from '../../types/index';

export default function ProductoCrear() {
  // Configuración de campos para crear producto
  const productCreateFields: CreateField[] = [
    {
      key: 'codigo',
      label: 'Código',
      type: 'text',
      required: true,
      placeholder: 'Ej: P001',
      validation: (value) => {
        if (!value) {
          return 'El código es obligatorio';
        }

        const trimmed = value.trim();

        // Verificar espacios al inicio o final
        if (value !== trimmed) {
          return 'El código no puede comenzar ni terminar con espacios';
        }
        if (trimmed && trimmed.length < 3) {
          return 'El código debe tener al menos 3 caracteres';
        }
        return null;
      }
    },
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Nombre del producto',
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
      key: 'precio_unitario',
      label: 'Precio Unitario',
      type: 'number',
      required: true,
      placeholder: '0.00',
      validation: (value) => {
        if (value !== undefined && value !== null && value <= 0) {
          return 'El precio debe ser mayor a 0';
        }
        return null;
      }
    },
    {
      key: 'unidad_medida',
      label: 'Unidad de Medida',
      type: 'select',
      required: true,
      options: [
        { value: 'Unidad', label: 'Unidad' },
        { value: 'Metro', label: 'Metro' },
        { value: 'Kilogramo', label: 'Kilogramo' },
        { value: 'Litro', label: 'Litro' },
        { value: 'Caja', label: 'Caja' },
        { value: 'Paquete', label: 'Paquete' },
        { value: 'Servicio', label: 'Servicio' }
      ]
    },
    {
      key: 'categoria_id',
      label: 'Categoría',
      type: 'infiniteSelect',
      required: true,
      infiniteEndpoint: 'categorias/infinito',
      placeholder: 'Buscar y seleccionar...'
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'boolean',
      required: true,
      defaultValue: true
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción del producto'
    }
  ];

  return (
    <EntityCreateView<Producto>
      entityType="productos"
      title="Crear Nuevo Producto"
      subtitle="Completa la información del producto"
      fields={productCreateFields}
      backPath="productos"
    />
  );
}