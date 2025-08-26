import { useState, useEffect } from 'react';
import { TableBase } from './Generic/TableBase';
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { useNavigate } from "react-router-dom";
import { usePagination } from '../hooks/Auxiliaries/usePagination';
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useMovimientoInventarios } from '../hooks/useMovimientoInventarios';
import type { TableColumn, TableActions } from '../types';
import type { MovimientoInventario } from '../types/index';
import { formatDateOnly } from '../utils/dateUtils';

interface MovimientoInventariosTableProps {
    onMovimientoInventarioDetail?: (movimiento_inventario: MovimientoInventario) => void;
    onMovimientoInventarioEdit?: (movimiento_inventario: MovimientoInventario) => void;
    
    // Personalizar acciones desde componente padre
    showActions?: {
        detail?: boolean;
        edit?: boolean;
        toggleActive?: boolean;
        delete?: boolean;
    };
}

export function MovimientoInventariosTable({
    onMovimientoInventarioDetail,
    showActions = {
        detail: true,
        edit: false,
        toggleActive: false,
        delete: false
    }
}: MovimientoInventariosTableProps = {}) {
    const navigate = useNavigate();
    const [showLoader, setShowLoader] = useState(false);

    // Hook de paginación con soporte para filtros
    const pagination = usePagination({
        initialPage: 1,
        initialPageSize: 10,
        initialSortBy: 'fecha',
        initialSortOrder: 'desc'
    });

    // Hook de filtros
    const filterHook = useFilters({
        onFiltersChange: pagination.updateFilters
    });

    // Configuración de campos de filtro para movimiento_inventarios
    const filterFields: FilterField[] = [
        {
            key: 'search',
            label: 'Búsqueda',
            type: 'text',
            placeholder: 'Usuario o producto'
        },
        {
            key: 'tipo',
            label: 'Tipo',
            type: 'select',
            options: [
                { value: 'ENTRADA', label: 'Entrada' },
                { value: 'SALIDA', label: 'Salida' },
                { value: 'VENTA', label: 'Venta' },
                { value: 'ANULACIÓN_VENTA', label: 'Anulación de venta' },
                { value: 'ENTRADA_EDICIÓN', label: 'Edición de entrada' },
                { value: 'SALIDA_EDICIÓN', label: 'Edición de salida' },
            ]
        },
    ];

    // Hook para obtener movimiento_inventarios con todos los parámetros
    const {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
    } = useMovimientoInventarios({
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.filters.search as string,
        tipo: pagination.filters.tipo as string,
    });

    // Efecto para manejar el delay del loader
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (isLoading) {
            // Si después de 200ms sigue cargando, mostramos el loader
            timer = setTimeout(() => {
                setShowLoader(true);
            }, 200);
        } else {
            // Cuando deja de cargar, ocultamos el loader inmediatamente
            setShowLoader(false);
        }

        // Cleanup: limpiar timeout si el componente se desmonta o cambia isLoading
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [isLoading]);

    // Definir las columnas de la tabla
    const columns: TableColumn<MovimientoInventario>[] = [
        {
            header: 'ID',
            render: (movimiento_inventario) => (
                <span>
                    {movimiento_inventario.id}
                </span>
            ),
            sortable: true,
            sortKey: 'id',
        },
        {
            header: 'Fecha',
            render: (movimiento_inventario) => (
                <span>
                    {formatDateOnly(movimiento_inventario.fecha)}
                </span>
            ),
            sortable: true,
            sortKey: 'fecha',
        },
        {
            header: 'Producto',
            render: (movimiento_inventario) => (
                <span
                    className="cursor-pointer hover:text-blue"
                    onClick={() => navigate(`/productos/${movimiento_inventario.producto.id}`)}
                >
                    {movimiento_inventario.producto.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'producto_nombre'
        },
        {
            header: 'Tipo',
            render: (movimiento_inventario) => (
                <span>
                    {movimiento_inventario.tipo}
                </span>
            ),
            sortable: true,
            sortKey: 'tipo',
        },
        {
            header: 'Movimiento',
            render: (movimiento_inventario) => (
                <span>
                    {movimiento_inventario.cantidad.toFixed(2)}
                </span>
            ),
            sortable: true,
            sortKey: 'cantidad',
        },
        {
            header: 'Cantidad final',
            render: (movimiento_inventario) => (
                <span>
                    {movimiento_inventario.cantidad_inventario.toFixed(2)}
                </span>
            ),
            sortable: true,
            sortKey: 'cantidad_inventario',
        },
        {
            header: 'Usuario',
            render: (movimiento_inventario) => (
                <span>
                    {movimiento_inventario.usuario.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'usuario_nombre'
        },
    ];

    // Definir las acciones de la tabla
    const actions: TableActions<MovimientoInventario> = {
        showDetail: showActions.detail,
        showEdit: showActions.edit,
        showToggleActive: showActions.toggleActive,
        showDelete: showActions.delete,

        onDetail: onMovimientoInventarioDetail,
    };

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
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
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                        <p className="text-gray-500">Cargando movimiento_inventarios...</p>
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