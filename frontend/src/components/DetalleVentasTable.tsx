import { useState, useEffect } from 'react';
import { TableBase } from './Generic/TableBase';
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { ConfirmDeleteModal } from './Auxiliaries/ConfirmDeleteModal';
import { usePagination } from '../hooks/Auxiliaries/usePagination';
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useNavigate } from "react-router-dom";
import { useDetalleVentas } from '../hooks/useDetalleVentas';
import { useNotificationHelpers } from '../hooks/Auxiliaries/useNotificationHelpers';
import type { TableColumn, TableActions } from '../types';
import type { DetalleVenta } from '../types/index';

interface detalle_ventasTableProps {
    ventaId: number;
    onClientEdit?: (detalle_venta: DetalleVenta) => void;
    onAfterDelete?: () => void;

    // Personalizar acciones desde componente padre
    showActions?: {
        detail?: boolean;
        edit?: boolean;
        toggleActive?: boolean;
        delete?: boolean;
    };
}

export function DetalleVentasTable({
    ventaId,
    onClientEdit,
    onAfterDelete,
    showActions = {
        detail: true,
        edit: true,
        toggleActive: true,
        delete: true
    }
}: detalle_ventasTableProps) {
    const navigate = useNavigate();
    const [showLoader, setShowLoader] = useState(false);
    const { notifyEntityDeleted, notifyEntityError} = useNotificationHelpers();

    // Estado para el modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        detalle_venta: DetalleVenta | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        detalle_venta: null,
        isLoading: false
    });

    // Hook de paginación con soporte para filtros
    const pagination = usePagination({
        initialPage: 1,
        initialPageSize: 10,
        initialSortBy: 'nombre'
    });

    // Hook de filtros
    const filterHook = useFilters({
        onFiltersChange: pagination.updateFilters
    });

    // Configuración de campos de filtro para detalle_ventas
    const filterFields: FilterField[] = [
        {
            key: 'search',
            label: 'Búsqueda',
            type: 'text',
            placeholder: 'Nombre o código del producto'
        },
    ];

    // Hook para obtener detalle_ventas con todos los parámetros
    const {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        deleteItem
    } = useDetalleVentas({
        ventaId,
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.filters.search as string,
    });

    // Efecto para manejar el delay del loader
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (isLoading) {
            timer = setTimeout(() => {
                setShowLoader(true);
            }, 200);
        } else {
            setShowLoader(false);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [isLoading]);

    // Funciones para el modal de eliminación
    const handleDeleteClick = (detalle_venta: DetalleVenta) => {
        setDeleteModal({
            isOpen: true,
            detalle_venta,
            isLoading: false
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.detalle_venta) return;

        setDeleteModal(prev => ({ ...prev, isLoading: true }));

        try {
            await deleteItem(deleteModal.detalle_venta.id);

            // Cerrar modal
            setDeleteModal({
                isOpen: false,
                detalle_venta: null,
                isLoading: false
            });

            // Mostrar notificación de éxito
            notifyEntityDeleted('DetalleVenta');

            // Llamar callback para actualizar datos del padre
            if (onAfterDelete) {
                onAfterDelete();
            }
        } catch (err: any) {
            // Mantener modal abierto y mostrar error
            setDeleteModal(prev => ({ ...prev, isLoading: false }));

            // Mostrar notificación de error
            notifyEntityError('eliminar', 'detalle_venta', err.message || 'Ocurrió un error inesperado');
        }
    };

    const handleDeleteCancel = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                detalle_venta: null,
                isLoading: false
            });
        }
    };

    // Definir las columnas de la tabla
    const columns: TableColumn<DetalleVenta>[] = [
        {
            header: 'ID',
            render: (detalle_venta) => (
                <span>
                    {detalle_venta.id}
                </span>
            ),
            sortable: true,
            sortKey: 'id',
        },
        {
            header: 'Producto',
            render: (detalle_venta) => (
                <span
                    className="cursor-pointer hover:text-blue"
                    onClick={() => navigate(`/productos/${detalle_venta.producto.id}`)}
                >
                    {detalle_venta.producto.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'producto_nombre',
        },
        {
            header: 'Cantidad',
            render: (detalle_venta) => (
                <span>
                    {detalle_venta.cantidad.toFixed(2)}
                </span>
            ),
            sortable: true,
            sortKey: 'cantidad',
        },
        {
            header: 'Precio unitario',
            render: (detalle_venta) => (
                <span>
                    $ {Number(detalle_venta.precio_unitario)
                        .toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
            ),
            sortable: true,
            sortKey: 'precio_unitario',
        },
        {
            header: 'Total',
            render: (detalle_venta) => (
                <span>
                    $ {Number(detalle_venta.cantidad * detalle_venta.precio_unitario)
                        .toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
            ),
            sortable: false,
        }
    ];

    // Definir las acciones de la tabla
    const actions: TableActions<DetalleVenta> = {
        showDetail: showActions.detail,
        showEdit: showActions.edit,
        showToggleActive: showActions.toggleActive,
        showDelete: showActions.delete,

        onEdit: onClientEdit,
        onDelete: handleDeleteClick
    };

    if (error) {
        return (
            <div className='text-center py-8'>
                <p className='text-red-600'>{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Panel de Filtros */}
            <FilterPanel
                filterHook={filterHook}
                filterFields={filterFields}
            />

            <div className='relative'>
                {/* Loader flotante con delay */}
                {showLoader && (
                    <div className='absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10'>
                        <p className='text-gray-500'>Cargando detalles de venta...</p>
                    </div>
                )}

                <TableBase
                    items={items}
                    totalItems={totalItems}
                    totalPages={totalPages}
                    currentPage={pagination.page}
                    pageSize={pagination.pageSize}
                    pageSizeOptions={pagination.pageSizeOptions}
                    columns={columns}
                    sortBy={pagination.sortBy}
                    sortOrder={pagination.sortOrder}
                    onPageChange={pagination.changePage}
                    onPageSizeChange={pagination.changePageSize}
                    onSortChange={pagination.changeSort}
                    actions={actions}
                />
            </div>

            {/* Modal de confirmación de eliminación */}
            <ConfirmDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title='Eliminar Detalle de Venta'
                message='¿Estás seguro de que quieres eliminar este detalle de venta?'
                itemName={`Producto: ${deleteModal.detalle_venta?.producto?.nombre || 'N/A'}`}
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
}