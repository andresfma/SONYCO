import { EntityCreateView, type CreateField } from '../../components/Views/EntityCreateView';
import type { Inventario } from '../../types/index';

export default function InventarioCrear() {
  // Configuración de campos para crear inventario
  const inventarioCreateFields: CreateField[] = [
    {
      key: 'producto_id',
      label: 'Producto',
      type: 'infiniteSelect',
      required: true,
      infiniteEndpoint: 'productos/infinito/inventario',
      placeholder: 'Buscar y seleccionar...'
    },
    {
      key: 'cantidad',
      label: 'Cantidad',
      type: 'number',
      required: true,
      placeholder: '0.00',
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
      placeholder: '0.00',
      validation: (value) => {
        if (value !== undefined && value !== null && value <= 0) {
          return 'La cantidad mínima debe ser mayor a 0';
        }
        return null;
      }
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'boolean',
      required: true,
      defaultValue: true
    },
  ];

  return (
    <EntityCreateView<Inventario>
      entityType="inventarios"
      title="Crear Nuevo Inventario"
      subtitle="Completa la información del inventario"
      fields={inventarioCreateFields}
      backPath="inventarios"
    />
  );
}