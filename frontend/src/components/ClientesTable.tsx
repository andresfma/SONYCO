import { useState, useEffect } from 'react';
import { TableBase } from './Generic/TableBase';
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { ConfirmDeleteModal } from './Auxiliaries/ConfirmDeleteModal';
import { usePagination } from '../hooks/Auxiliaries/usePagination';
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useClientes } from '../hooks/useClientes';
import { useNotificationHelpers } from '../hooks/Auxiliaries/useNotificationHelpers';
import type { TableColumn, TableActions } from '../types';
import type { Cliente } from '../types/index';

interface clientesTableProps {
    onClientDetail?: (cliente: Cliente) => void;
    onClientEdit?: (cliente: Cliente) => void;

    // Personalizar acciones desde componente padre
    showActions?: {
        detail?: boolean;
        edit?: boolean;
        toggleActive?: boolean;
        delete?: boolean;
    };
}

export function ClientesTable({
    onClientDetail,
    onClientEdit,
    showActions = {
        detail: true,
        edit: true,
        toggleActive: true,
        delete: true
    }
}: clientesTableProps = {}) {
    const [showLoader, setShowLoader] = useState(false);
    const { notifyEntityDeleted, notifyEntityError, notifySuccess, notifyError } = useNotificationHelpers();

    // Estado para el modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        cliente: Cliente | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        cliente: null,
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

    // Configuración de campos de filtro para clientes
    const filterFields: FilterField[] = [
        {
            key: 'search',
            label: 'Búsqueda',
            type: 'text',
            placeholder: 'Nombre, email o identificación'
        },
        {
            key: 'tipo_persona',
            label: 'Tipo de persona',
            type: 'select',
            options: [
                { value: 'natural', label: 'Natural' },
                { value: 'juridica', label: 'Jurídica' }
            ]
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

    // Hook para obtener clientes con todos los parámetros
    const {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        toggleItemStatus,
        deleteItem
    } = useClientes({
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.filters.search as string,
        tipoPersona: pagination.filters.tipo_persona as string,
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
    const handleDeleteClick = (cliente: Cliente) => {
        setDeleteModal({
            isOpen: true,
            cliente,
            isLoading: false
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.cliente) return;

        setDeleteModal(prev => ({ ...prev, isLoading: true }));

        try {
            await deleteItem(deleteModal.cliente.id);

            // Cerrar modal
            setDeleteModal({
                isOpen: false,
                cliente: null,
                isLoading: false
            });

            // Mostrar notificación de éxito
            notifyEntityDeleted('Cliente');
        } catch (err: any) {
            // Mantener modal abierto y mostrar error
            setDeleteModal(prev => ({ ...prev, isLoading: false }));

            // Mostrar notificación de error
            notifyEntityError('eliminar', 'cliente', err.message || 'Ocurrió un error inesperado');
        }
    };

    const handleDeleteCancel = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                cliente: null,
                isLoading: false
            });
        }
    };

    // Definir las columnas de la tabla
    const columns: TableColumn<Cliente>[] = [
        {
            header: 'Nombre',
            render: (cliente) => (
                <span>
                    {cliente.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'nombre'
        },
        {
            header: 'Email',
            render: (cliente) => (
                <span>
                    {cliente.email}
                </span>
            ),
            sortable: true,
            sortKey: 'email'
        },
        {
            header: 'Identificación',
            render: (cliente) => (
                <span>
                    {cliente.identificacion}
                </span>
            ),
            sortable: true,
            sortKey: 'identificacion'
        },
        {
            header: 'Tipo',
            render: (cliente) => {
                const tipos = {
                    natural: 'Natural',
                    juridica: 'Jurídica'
                };

                return <span>{tipos[cliente.tipo_persona] || cliente.tipo_persona}</span>;
            },
            sortable: true,
            sortKey: 'tipo_persona'
        },
        {
            header: 'Estado',
            render: (cliente) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cliente.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {cliente.estado ? 'Activo' : 'Inactivo'}
                </span>
            ),
            sortable: true,
            sortKey: 'estado'
        }
    ];

    // Definir las acciones de la tabla
    const actions: TableActions<Cliente> = {
        showDetail: showActions.detail,
        showEdit: showActions.edit,
        showToggleActive: showActions.toggleActive,
        showDelete: showActions.delete,

        onDetail: onClientDetail,
        onEdit: onClientEdit,

        onToggleActive: async (cliente) => {
            try {
                await toggleItemStatus(cliente.id);
                // Notificación de éxito para cambio de estado
                notifySuccess(
                    'Estado actualizado',
                    `El cliente ${cliente.nombre} ahora está ${cliente.estado ? 'inactivo' : 'activo'}`
                );
            } catch (err: any) {
                // Notificación de error para cambio de estado
                notifyError(
                    'Error al cambiar estado',
                    err.message || 'No se pudo cambiar el estado del cliente'
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
                        <p className='text-gray-500'>Cargando clientes...</p>
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
                title='Eliminar Cliente'
                message='¿Estás seguro de que quieres eliminar este cliente?'
                itemName={deleteModal.cliente?.nombre}
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
}