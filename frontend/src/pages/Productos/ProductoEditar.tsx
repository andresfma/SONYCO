import { useParams } from 'react-router-dom';
import { EntityEditView, type EditField } from '../../components/Views/EntityEditView';
import type { Producto } from '../../types/index';

export default function ProductoEditar() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>ID de producto no válido</div>;
  }

  // Configuración de campos para editar producto
  const productEditFields: EditField[] = [
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
      required: true
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción del producto'
    }
  ];

  return (
    <EntityEditView<Producto>
      entityType="productos"
      entityId={id}
      title="Editar Producto"
      subtitle="Modifica la información del producto."
      fields={productEditFields}
      backPath="/productos"
      detailPath={`/productos/${id}`}
    />
  );
}