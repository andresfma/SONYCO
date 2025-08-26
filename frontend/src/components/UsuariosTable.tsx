import { useState, useEffect } from 'react';
import { TableBase } from './Generic/TableBase';
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { ConfirmDeleteModal } from './Auxiliaries/ConfirmDeleteModal';
import { usePagination } from '../hooks/Auxiliaries/usePagination';
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useUsuarios } from '../hooks/useUsuarios';
import { useNotificationHelpers } from '../hooks/Auxiliaries/useNotificationHelpers';
import type { TableColumn, TableActions } from '../types';
import type { Usuario } from '../types/index';

interface usuariosTableProps {
    onUserDetail?: (usuario: Usuario) => void;
    onUserEdit?: (usuario: Usuario) => void;

    // Personalizar acciones desde componente padre
    showActions?: {
        detail?: boolean;
        edit?: boolean;
        toggleActive?: boolean;
        delete?: boolean;
    };
}

export function UsuariosTable({
    onUserDetail,
    onUserEdit,
    showActions = {
        detail: true,
        edit: true,
        toggleActive: true,
        delete: true
    }
}: usuariosTableProps = {}) {
    const [showLoader, setShowLoader] = useState(false);
    const { notifyEntityDeleted, notifyEntityError, notifySuccess, notifyError } = useNotificationHelpers();

    // Estado para el modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        usuario: Usuario | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        usuario: null,
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

    // Configuración de campos de filtro para usuarios
    const filterFields: FilterField[] = [
        {
            key: 'search',
            label: 'Búsqueda',
            type: 'text',
            placeholder: 'Buscar por nombre o email'
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

    // Hook para obtener usuarios con todos los parámetros
    const {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        toggleItemStatus,
        deleteItem
    } = useUsuarios({
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
    const handleDeleteClick = (usuario: Usuario) => {
        setDeleteModal({
            isOpen: true,
            usuario,
            isLoading: false
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.usuario) return;

        setDeleteModal(prev => ({ ...prev, isLoading: true }));

        try {
            await deleteItem(deleteModal.usuario.id);

            // Cerrar modal
            setDeleteModal({
                isOpen: false,
                usuario: null,
                isLoading: false
            });

            // Mostrar notificación de éxito
            notifyEntityDeleted('Usuario');
        } catch (err: any) {
            // Mantener modal abierto y mostrar error
            setDeleteModal(prev => ({ ...prev, isLoading: false }));

            // Mostrar notificación de error
            notifyEntityError('eliminar', 'usuario', err.message || 'Ocurrió un error inesperado');
        }
    };

    const handleDeleteCancel = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                usuario: null,
                isLoading: false
            });
        }
    };

    // Definir las columnas de la tabla
    const columns: TableColumn<Usuario>[] = [
        {
            header: 'Nombre',
            render: (usuario) => (
                <span>
                    {usuario.nombre}
                </span>
            ),
            sortable: true,
            sortKey: 'nombre'
        },
        {
            header: 'Email',
            render: (usuario) => (
                <span>
                    {usuario.email}
                </span>
            ),
            sortable: true,
            sortKey: 'email'
        },
        {
            header: 'Rol',
            render: (usuario) => {
                const tipos = {
                    1: 'Admin',
                    2: 'Usuario'
                };

                return <span>{tipos[usuario.rol_id] || usuario.rol_id}</span>;
            },
            sortable: true,
            sortKey: 'rol_id'
        },
        {
            header: 'Estado',
            render: (usuario) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${usuario.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {usuario.estado ? 'Activo' : 'Inactivo'}
                </span>
            ),
            sortable: true,
            sortKey: 'estado'
        }
    ];

    // Definir las acciones de la tabla
    const actions: TableActions<Usuario> = {
        showDetail: showActions.detail,
        showEdit: showActions.edit,
        showToggleActive: showActions.toggleActive,
        showDelete: showActions.delete,

        onDetail: onUserDetail,
        onEdit: onUserEdit,

        onToggleActive: async (usuario) => {
            try {
                await toggleItemStatus(usuario.id);
                // Notificación de éxito para cambio de estado
                notifySuccess(
                    'Estado actualizado',
                    `El usuario ${usuario.nombre} ahora está ${usuario.estado ? 'inactivo' : 'activo'}`
                );
            } catch (err: any) {
                // Notificación de error para cambio de estado
                notifyError(
                    'Error al cambiar estado',
                    err.message || 'No se pudo cambiar el estado del usuario'
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
                        <p className='text-gray-500'>Cargando usuarios...</p>
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
                title='Eliminar Usuario'
                message='¿Estás seguro de que quieres eliminar este usuario?'
                itemName={deleteModal.usuario?.nombre}
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
}