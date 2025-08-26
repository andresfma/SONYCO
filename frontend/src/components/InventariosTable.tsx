import { useState, useEffect } from 'react';
import { TableBase } from './Generic/TableBase';
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { usePagination } from '../hooks/Auxiliaries/usePagination';
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useInventarios } from '../hooks/useInventarios';
import { useNotificationHelpers } from '../hooks/Auxiliaries/useNotificationHelpers';
import type { TableColumn, TableActions } from '../types';
import type { Inventario } from '../types/index';

interface inventariosTableProps {
    onInventarioDetail?: (inventario: Inventario) => void;
    onInventarioEdit?: (inventario: Inventario) => void;

    // Personalizar acciones desde componente padre
    showActions?: {
        detail?: boolean;
        edit?: boolean;
        toggleActive?: boolean;
        delete?: boolean;
    };
}

export function InventariosTable({
    onInventarioDetail,
    onInventarioEdit,
    showActions = {
        detail: true,
        edit: true,
        toggleActive: true,
        delete: false
    }
}: inventariosTableProps = {}) {
    const [showLoader, setShowLoader] = useState(false);
    const { notifySuccess, notifyError } = useNotificationHelpers();

    // Hook de paginación con soporte para filtros
    const pagination = usePagination({
        initialPage: 1,
        initialPageSize: 10,
        initialSortBy: 'codigo'
    });

    // Hook de filtros
    const filterHook = useFilters({
        onFiltersChange: pagination.updateFilters
    });

    // Configuración de campos de filtro para inventarios
    const filterFields: FilterField[] = [
        {
            key: 'search',
            label: 'Búsqueda',
            type: 'text',
            placeholder: 'Nombre o código del producto'
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

    // Hook para obtener inventarios con todos los parámetros
    const {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        toggleItemStatus,
    } = useInventarios({
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

    // Definir las columnas de la tabla
    const columns: TableColumn<Inventario>[] = [
        {
            header: 'Código',
            render: (inventario) => (
                <span>
                    {inventario.producto.codigo}
                </span>
            ),
            sortable: true,
            sortKey: 'codigo'
        },
        {
            header: 'Producto',
            render: (inventario) => (
                <span>
                    {inventario.producto.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'nombre'
        },
        {
            header: 'Cantidad',
            render: (inventario) => (
                <span>
                    {inventario.cantidad.toFixed(2)}
                </span>
            ),
            sortable: true,
            sortKey: 'cantidad'
        },
        {
            header: 'Cantidad mínima',
            render: (inventario) => (
                <span>
                    {inventario.cantidad_minima.toFixed(2)}
                </span>
            ),
            sortable: true,
            sortKey: 'cantidad_minima'
        },

        {
            header: 'Estado',
            render: (inventario) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${inventario.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {inventario.estado ? 'Activo' : 'Inactivo'}
                </span>
            ),
            sortable: true,
            sortKey: 'estado'
        }
    ];

    // Definir las acciones de la tabla
    const actions: TableActions<Inventario> = {
        showDetail: showActions.detail,
        showEdit: showActions.edit,
        showToggleActive: showActions.toggleActive,
        showDelete: showActions.delete,

        onDetail: onInventarioDetail,
        onEdit: onInventarioEdit,

        onToggleActive: async (inventario) => {
            try {
                await toggleItemStatus(inventario.id);
                // Notificación de éxito para cambio de estado
                notifySuccess(
                    'Estado actualizado',
                    `El inventario para el producto: ${inventario.producto.codigo} ahora está ${inventario.estado ? 'inactivo' : 'activo'}`
                );
            } catch (err: any) {
                // Notificación de error para cambio de estado
                notifyError(
                    'Error al cambiar estado',
                    err.message || 'No se pudo cambiar el estado del inventario'
                );
            }
        },
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
                        <p className='text-gray-500'>Cargando inventarios...</p>
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
        </div>
    );
}