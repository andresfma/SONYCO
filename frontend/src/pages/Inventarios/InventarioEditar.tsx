import { useParams } from 'react-router-dom';
import { EntityEditView, type EditField } from '../../components/Views/EntityEditView';
import type { Inventario } from '../../types/index';

export default function InventarioEditar() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>ID de inventario no válido</div>;
  }

  // Configuración de campos para editar inventario
  const inventarioEditFields: EditField[] = [
    {
      key: 'producto',
      label: 'Producto',
      type: 'display',
      displayPath: 'producto.nombre'
    },
    {
      key: 'codigo',
      label: 'Código',
      type: 'display',
      displayPath: 'producto.codigo' 
    },
    {
      key: 'cantidad',
      label: 'Cantidad',
      type: 'number',
      required: true,
      placeholder: 'Cantidad actual del producto',
      validation: (value) => {

        if (value !== undefined && value !== null && value <= 0) {
          return 'La cantidad debe ser mayor a 0';
        }

        return null;
      }
    },
    {
      key: 'cantidad_minima',
      label: 'Cantidad mínima',
      type: 'number',
      required: true,
      placeholder: 'Cantidad mínima del producto',
      validation: (value) => {

        if (value !== undefined && value !== null && value <= 0) {
          return 'La cantidad debe ser mayor a 0';
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
  ];

  return (
    <EntityEditView<Inventario>
      entityType="inventarios"
      entityId={id}
      title="Editar Inventario"
      subtitle="Modifica la información del inventario."
      fields={inventarioEditFields}
      backPath="/inventarios"
      detailPath={`/inventarios/${id}`}
    />
  );
}