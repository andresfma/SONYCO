import { EntityCreateView, type CreateField } from '../../components/Views/EntityCreateView';
import type { MovimientoInventario } from '../../types/index';

export default function MovimientoInventarioCrear() {
  // Configuración de campos para crear movimiento_inventario
  const movimiento_inventarioCreateFields: CreateField[] = [
    {
      key: 'producto_id',
      label: 'Producto',
      type: 'infiniteSelect',
      required: true,
      infiniteEndpoint: 'productos/infinito/movimiento',
      placeholder: 'Buscar y seleccionar...'
    },
    {
      key: 'cantidad',
      label: 'Cantidad del movimiento',
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
  ];

  return (
    <EntityCreateView<MovimientoInventario>
      entityType="inventarios/movimientos/salida"
      title="Crear Nueva Salida"
      subtitle="Completa la información de la Salida"
      fields={movimiento_inventarioCreateFields}
      backPath="movimientos"
    />
  );
}