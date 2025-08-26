import { EntityCreateView, type CreateField } from '../../components/Views/EntityCreateView';
import type { Venta } from '../../types/index';

export default function VentaCrear() {
  // Configuración de campos para crear venta
  const ventaCreateFields: CreateField[] = [
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
      required: true,
      defaultValue: true
    },
  ];

  return (
    <EntityCreateView<Venta>
      entityType="ventas"
      title="Crear Nueva Venta"
      subtitle="Completa la información de la venta"
      fields={ventaCreateFields}
      backPath="ventas"
    />
  );
}