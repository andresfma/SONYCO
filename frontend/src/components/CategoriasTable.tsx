import { useState, useEffect } from 'react';
import { TableBase } from './Generic/TableBase';
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { ConfirmDeleteModal } from './Auxiliaries/ConfirmDeleteModal';
import { usePagination } from '../hooks/Auxiliaries/usePagination';
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useCategorias } from '../hooks/useCategorias';
import { useNotificationHelpers } from '../hooks/Auxiliaries/useNotificationHelpers';
import type { TableColumn, TableActions } from '../types';
import type { Categoria } from '../types/index';

interface categoriasTableProps {
    onCategoriaDetail?: (categoria: Categoria) => void;
    onCategoriaEdit?: (categoria: Categoria) => void;

    // Personalizar acciones desde componente padre
    showActions?: {
        detail?: boolean;
        edit?: boolean;
        toggleActive?: boolean;
        delete?: boolean;
    };
}

export function CategoriasTable({
    onCategoriaDetail,
    onCategoriaEdit,
    showActions = {
        detail: true,
        edit: true,
        toggleActive: true,
        delete: true
    }
}: categoriasTableProps = {}) {
    const [showLoader, setShowLoader] = useState(false);
    const { notifyEntityDeleted, notifyEntityError, notifySuccess, notifyError } = useNotificationHelpers();

    // Estado para el modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        categoria: Categoria | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        categoria: null,
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

    // Configuración de campos de filtro para categorias
    const filterFields: FilterField[] = [
        {
            key: 'search',
            label: 'Nombre',
            type: 'text',
            placeholder: 'Buscar por nombre'
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

    // Hook para obtener categorias con todos los parámetros
    const {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        toggleItemStatus,
        deleteItem
    } = useCategorias({
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
    const handleDeleteClick = (categoria: Categoria) => {
        setDeleteModal({
            isOpen: true,
            categoria,
            isLoading: false
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.categoria) return;

        setDeleteModal(prev => ({ ...prev, isLoading: true }));

        try {
            await deleteItem(deleteModal.categoria.id);

            // Cerrar modal
            setDeleteModal({
                isOpen: false,
                categoria: null,
                isLoading: false
            });

            // Mostrar notificación de éxito
            notifyEntityDeleted('Categoria');
        } catch (err: any) {
            // Mantener modal abierto y mostrar error
            setDeleteModal(prev => ({ ...prev, isLoading: false }));

            // Mostrar notificación de error
            notifyEntityError('eliminar', 'categoria', err.message || 'Ocurrió un error inesperado');
        }
    };

    const handleDeleteCancel = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                categoria: null,
                isLoading: false
            });
        }
    };

    // Definir las columnas de la tabla
    const columns: TableColumn<Categoria>[] = [
        {
            header: 'Nombre',
            render: (categoria) => (
                <span>
                    {categoria.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'nombre'
        },
        {
            header: 'Descripción',
            render: (categoria) => (
                <span>
                    {categoria.descripcion}
                </span>
            )
        },
        {
            header: 'Estado',
            render: (categoria) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoria.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {categoria.estado ? 'Activo' : 'Inactivo'}
                </span>
            ),
            sortable: true,
            sortKey: 'estado'
        }
    ];

    // Definir las acciones de la tabla
    const actions: TableActions<Categoria> = {
        showDetail: showActions.detail,
        showEdit: showActions.edit,
        showToggleActive: showActions.toggleActive,
        showDelete: showActions.delete,

        onDetail: onCategoriaDetail,
        onEdit: onCategoriaEdit,

        onToggleActive: async (categoria) => {
            try {
                await toggleItemStatus(categoria.id);
                // Notificación de éxito para cambio de estado
                notifySuccess(
                    'Estado actualizado',
                    `La categoria ${categoria.nombre} ahora está ${categoria.estado ? 'inactiva' : 'activa'}`
                );
            } catch (err: any) {
                // Notificación de error para cambio de estado
                notifyError(
                    'Error al cambiar estado',
                    err.message || 'No se pudo cambiar el estado de la categoria'
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
                        <p className='text-gray-500'>Cargando categorias...</p>
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
                title='Eliminar Categoria'
                message='¿Estás seguro de que quieres eliminar esta categoria?'
                itemName={deleteModal.categoria?.nombre}
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
}