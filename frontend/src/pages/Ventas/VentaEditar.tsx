import { useParams } from 'react-router-dom';
import { EntityEditView, type EditField } from '../../components/Views/EntityEditView';
import type { Venta } from '../../types/index';

export default function VentaEditar() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>ID de venta no válido</div>;
  }

  // Configuración de campos para editar venta
  const ventaEditFields: EditField[] = [
    {
      key: 'cliente_id',
      label: 'Cliente',
      type: 'infiniteSelect',
      required: true,
      infiniteEndpoint: 'clientes/infinito',
      placeholder: 'Buscar y seleccionar...'
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'boolean',
      required: true
    },
  ];

  return (
    <EntityEditView<Venta>
      entityType="ventas"
      entityId={id}
      title="Editar Venta"
      subtitle="Modifica la información de la venta."
      fields={ventaEditFields}
      backPath="/ventas"
      detailPath={`/ventas/${id}`}
    />
  );
}