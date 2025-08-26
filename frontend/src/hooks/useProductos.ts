import { useState, useEffect, useCallback } from 'react';
import {
  getProductos,
  toggleEstadoProducto,
  deleteProducto,
  type GetProductosParams,
} from '../api/productos';
import type { Producto } from '../types';

interface UseProductosParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Filtros
  search?: string;
  categoria?: string;
  estado?: boolean;
}

interface UseProductosReturn {
  items: Producto[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleItemStatus: (id: number) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

export const useProductos = ({
  page,
  pageSize,
  sortBy,
  sortOrder,
  search,
  categoria,
  estado
}: UseProductosParams): UseProductosReturn => {
  const [items, setItems] = useState<Producto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch productos con paginación, orden y filtros
  const fetchProductos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: GetProductosParams = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        search,
        categoria,
        estado
      };

      const response = await getProductos(params);

      setItems(response.items);
      setTotalItems(response.total);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError('Error cargando productos');
      console.error('Error:', err);
      // Resetear valores en caso de error
      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, search, categoria, estado]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Toggle estado del producto
  const toggleItemStatus = async (id: number) => {
    try {
      await toggleEstadoProducto(id);
      await fetchProductos(); // Refetch para obtener datos actualizados
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      throw new Error('Error al cambiar estado del producto');
    }
  };

  // Eliminar producto
  const deleteItem = async (id: number) => {
    try {
      await deleteProducto(id);
      await fetchProductos(); // Refetch para obtener datos actualizados
    } catch (err: any) {
      console.error('Error al eliminar producto:', err);
      if (err.response?.status === 400) {
        throw new Error('No se puede eliminar: tiene relaciones activas.\n Se recomienda desactivar el ítem.');
      } else {
        throw new Error('Error al eliminar producto');
      }
    }
  };

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    error,
    refetch: fetchProductos,
    toggleItemStatus,
    deleteItem
  };
};