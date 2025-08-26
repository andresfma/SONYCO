import { useState, useEffect } from 'react';
import { TableBase } from './Generic/TableBase';
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { ConfirmDeleteModal } from './Auxiliaries/ConfirmDeleteModal';
import { useNavigate } from "react-router-dom";
import { usePagination } from '../hooks/Auxiliaries/usePagination';
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useProductos } from '../hooks/useProductos';
import { useNotificationHelpers } from '../hooks/Auxiliaries/useNotificationHelpers';
import type { TableColumn, TableActions } from '../types';
import type { Producto } from '../types/index';

interface ProductosTableProps {
    onProductDetail?: (producto: Producto) => void;
    onProductEdit?: (producto: Producto) => void;
    
    // Personalizar acciones desde componente padre
    showActions?: {
        detail?: boolean;
        edit?: boolean;
        toggleActive?: boolean;
        delete?: boolean;
    };
}

export function ProductosTable({
    onProductDetail,
    onProductEdit,
    showActions = {
        detail: true,
        edit: true,
        toggleActive: true,
        delete: true
    }
}: ProductosTableProps = {}) {
    const navigate = useNavigate();
    const [showLoader, setShowLoader] = useState(false);
    const { notifyEntityDeleted, notifyEntityError, notifySuccess, notifyError } = useNotificationHelpers();

    // Estado para el modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        producto: Producto | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        producto: null,
        isLoading: false
    });

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

    // Configuración de campos de filtro para productos
    const filterFields: FilterField[] = [
        {
            key: 'search',
            label: 'Nombre',
            type: 'text',
            placeholder: 'Buscar por nombre o código'
        },
        {
            key: 'categoria',
            label: 'Categoría',
            type: 'text',
            placeholder: 'Buscar por categoría'
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

    // Hook para obtener productos con todos los parámetros
    const {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        toggleItemStatus,
        deleteItem
    } = useProductos({
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.filters.search as string,
        categoria: pagination.filters.categoria as string,
        estado: pagination.filters.estado as boolean
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

    // Funciones para el modal de eliminación
    const handleDeleteClick = (producto: Producto) => {
        setDeleteModal({
            isOpen: true,
            producto,
            isLoading: false
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.producto) return;

        setDeleteModal(prev => ({ ...prev, isLoading: true }));

        try {
            await deleteItem(deleteModal.producto.id);
            
            // Cerrar modal
            setDeleteModal({
                isOpen: false,
                producto: null,
                isLoading: false
            });
            
            // Mostrar notificación de éxito
            notifyEntityDeleted('Producto');
            
        } catch (err: any) {
            // Mantener modal abierto y mostrar error
            setDeleteModal(prev => ({ ...prev, isLoading: false }));
            
            // Mostrar notificación de error
            notifyEntityError('eliminar', 'producto', err.message || 'Ocurrió un error inesperado');
        }
    };

    const handleDeleteCancel = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                producto: null,
                isLoading: false
            });
        }
    };

    // Definir las columnas de la tabla
    const columns: TableColumn<Producto>[] = [
        {
            header: 'Código',
            render: (producto) => (
                <span>
                    {producto.codigo}
                </span>
            ),
            sortable: true,
            sortKey: 'codigo',
        },
        {
            header: 'Nombre',
            render: (producto) => (
                <span>
                    {producto.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'nombre',
        },
        {
            header: 'Categoría',
            render: (producto) => (
                <span
                    className="cursor-pointer hover:text-blue"
                    onClick={() => navigate(`/categorias/${producto.categoria.id}`)}
                >
                    {producto.categoria.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'categoria_nombre'
        },
        {
            header: 'Precio',
            render: (producto) => (
                <span>
                    $ {Number(producto.precio_unitario)
                        .toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
            ),
            sortable: true,
            sortKey: 'precio_unitario',
        },
        {
            header: 'Estado',
            render: (producto) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${producto.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {producto.estado ? 'Activo' : 'Inactivo'}
                </span>
            ),
            sortable: true,
            sortKey: 'estado',
        }
    ];

    // Definir las acciones de la tabla
    const actions: TableActions<Producto> = {
        showDetail: showActions.detail,
        showEdit: showActions.edit,
        showToggleActive: showActions.toggleActive,
        showDelete: showActions.delete,

        onDetail: onProductDetail,
        onEdit: onProductEdit,

        onToggleActive: async (producto) => {
            try {
                await toggleItemStatus(producto.id);
                // Notificación de éxito para cambio de estado
                notifySuccess(
                    'Estado actualizado',
                    `El producto ${producto.nombre} ahora está ${producto.estado ? 'inactivo' : 'activo'}`
                );
            } catch (err: any) {
                // Notificación de error para cambio de estado
                notifyError(
                    'Error al cambiar estado',
                    err.message || 'No se pudo cambiar el estado del producto'
                );
            }
        },

        onDelete: handleDeleteClick
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
                        <p className="text-gray-500">Cargando productos...</p>
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
                title="Eliminar Producto"
                message="¿Estás seguro de que quieres eliminar este producto?"
                itemName={deleteModal.producto?.nombre}
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
}