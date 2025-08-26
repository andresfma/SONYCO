import { useParams } from 'react-router-dom';
import { EntityEditView, type EditField } from '../../components/Views/EntityEditView';
import type { DetalleVenta } from '../../types/index';

export default function DetalleVentaEditar() {
  // Obtener tanto id como ventaId de los parámetros
  const { id, ventaId } = useParams<{ id: string; ventaId?: string }>();

  if (!id) {
    return <div>ID de detalle_venta no válido</div>;
  }

  // Configuración de campos para editar detalle_venta
  const detalle_ventaEditFields: EditField[] = [
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
      key: 'precio_unitario',
      label: 'Precio Unitario',
      type: 'number',
      placeholder: 'Incluye descuentos o promociones',
      validation: (value) => {
        if (value !== undefined && value !== null && value <= 0) {
          return 'El precio debe ser mayor a 0';
        }
        return null;
      }
    },
  ];

  return (
    <EntityEditView<DetalleVenta>
      entityType="detalle_venta"
      entityId={id}
      title={`Editar la sub-venta N°${id}`}
      subtitle="Modifica la información de esta sub-venta."
      fields={detalle_ventaEditFields}
      backPath={`/ventas/${ventaId}`}
      detailPath={`/ventas/${ventaId}`}
    />
  );
}