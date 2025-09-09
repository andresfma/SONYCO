import { useState, useEffect } from 'react';
import { TableBase } from './Generic/TableBase';
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { ConfirmDeleteModal } from './Auxiliaries/ConfirmDeleteModal';
import { usePagination } from '../hooks/Auxiliaries/usePagination';
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useVentas } from '../hooks/useVentas';
import { useNotificationHelpers } from '../hooks/Auxiliaries/useNotificationHelpers';
import type { TableColumn, TableActions } from '../types';
import type { Venta } from '../types/index';
import { formatDateOnly } from '../utils/dateUtils';

interface ventasTableProps {
    onVentaDetail?: (venta: Venta) => void;
    onVentaEdit?: (venta: Venta) => void;

    // Personalizar acciones desde componente padre
    showActions?: {
        detail?: boolean;
        edit?: boolean;
        toggleActive?: boolean;
        delete?: boolean;
    };
}

export function VentasTable({
    onVentaDetail,
    onVentaEdit,
    showActions = {
        detail: true,
        edit: true,
        toggleActive: true,
        delete: true
    }
}: ventasTableProps = {}) {
    const [showLoader, setShowLoader] = useState(false);
    const { notifyEntityDeleted, notifyEntityError, notifySuccess, notifyError } = useNotificationHelpers();

    // Estado para el modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        venta: Venta | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        venta: null,
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

    // Configuración de campos de filtro para ventas
    const filterFields: FilterField[] = [
        {
            key: 'search',
            label: 'Búsqueda',
            type: 'text',
            placeholder: 'ID, cliente o vendedor'
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
                { value: true, label: 'Activo' },
                { value: false, label: 'Inactivo' }
            ]
        }
    ];

    // Hook para obtener ventas con todos los parámetros
    const {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        toggleItemStatus,
        deleteItem
    } = useVentas({
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.filters.search as string,
        estado: pagination.filters.estado as boolean
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
    const handleDeleteClick = (venta: Venta) => {
        setDeleteModal({
            isOpen: true,
            venta,
            isLoading: false
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.venta) return;

        setDeleteModal(prev => ({ ...prev, isLoading: true }));

        try {
            await deleteItem(deleteModal.venta.id);

            // Cerrar modal
            setDeleteModal({
                isOpen: false,
                venta: null,
                isLoading: false
            });

            // Mostrar notificación de éxito
            notifyEntityDeleted('Venta');
        } catch (err: any) {
            // Mantener modal abierto y mostrar error
            setDeleteModal(prev => ({ ...prev, isLoading: false }));

            // Mostrar notificación de error
            notifyEntityError('eliminar', 'venta', err.message || 'Ocurrió un error inesperado');
        }
    };

    const handleDeleteCancel = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                venta: null,
                isLoading: false
            });
        }
    };

    // Definir las columnas de la tabla
    const columns: TableColumn<Venta>[] = [
        {
            header: 'ID',
            render: (venta) => (
                <span>
                    {venta.id}
                </span>
            ),
            sortable: true,
            sortKey: 'id'
        },
        {
            header: 'Cliente',
            render: (venta) => (
                <span>
                    {venta.cliente.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'cliente_nombre'
        },
        {
            header: 'Vendedor',
            render: (venta) => (
                <span>
                    {venta.usuario.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'usuario_nombre'
        },
        {
            header: 'Fecha',
            render: (venta) => (
                <span>
                    {formatDateOnly(venta.fecha)}
                </span>
            ),
            sortable: true,
            sortKey: 'fecha'
        },
        {
            header: 'Total',
            render: (venta) => (
                <span>
                    $ {Number(venta.total)
                        .toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
            ),
            sortable: true,
            sortKey: 'total'
        },
        {
            header: 'Estado',
            render: (venta) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${venta.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {venta.estado ? 'Activo' : 'Inactivo'}
                </span>
            ),
            sortable: true,
            sortKey: 'estado'
        }
    ];

    // Definir las acciones de la tabla
    const actions: TableActions<Venta> = {
        showDetail: showActions.detail,
        showEdit: showActions.edit,
        showToggleActive: showActions.toggleActive,
        showDelete: showActions.delete,

        onDetail: onVentaDetail,
        onEdit: onVentaEdit,

        onToggleActive: async (venta) => {
            try {
                await toggleItemStatus(venta.id);
                // Notificación de éxito para cambio de estado
                notifySuccess(
                    'Estado actualizado',
                    `La venta ${venta.id} ahora está ${venta.estado ? 'inactiva' : 'activa'}`
                );
            } catch (err: any) {
                // Notificación de error para cambio de estado
                notifyError(
                    'Error al cambiar estado',
                    err.message || 'No se pudo cambiar el estado de la venta'
                );
            }
        },

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
                        <p className='text-gray-500'>Cargando ventas...</p>
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
                title='Eliminar Venta'
                message='¿Estás seguro de que quieres eliminar esta venta?'
                itemName={deleteModal.venta?.id.toString()}
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
}