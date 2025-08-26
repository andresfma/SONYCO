import { useState, useMemo, useCallback } from 'react';
import type { SortOrder } from '../../types';
import type { FilterConfig } from './useFilters';

export interface UsePaginationParams {
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: SortOrder;
  pageSizeOptions?: number[];
  initialFilters?: FilterConfig;
}

export function usePagination(params?: UsePaginationParams) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialSortBy = '',
    initialSortOrder = 'asc',
    pageSizeOptions = [5, 10, 20, 50],
    initialFilters = {},
  } = params || {};

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [filters, setFilters] = useState<FilterConfig>(initialFilters);

  // Cambiar página y resetear si es necesario
  function changePage(newPage: number) {
    setPage(newPage);
  }

  // Cambiar pageSize y resetear página a 1
  function changePageSize(newSize: number) {
    setPageSize(newSize);
    setPage(1);
  }

  // Cambiar orden de columna (toggle asc/desc si mismo)
  function changeSort(newSortBy: string) {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setPage(1);
  }

  // Actualizar filtros y resetear página a 1
  const updateFilters = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
    setPage(1); // Resetear a primera página cuando cambian los filtros
  }, []);

  // Resetear todo a valores iniciales
  function reset() {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
    setFilters(initialFilters);
  }

  // Generar parámetros de consulta para el API
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
    };

    // Solo incluir sort_by y sort_order si hay un campo seleccionado
    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }

    // Incluir todos los filtros activos
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params[key] = value;
      }
    });

    return params;
  }, [page, pageSize, sortBy, sortOrder, filters]);

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    filters,
    pageSizeOptions,
    queryParams,
    changePage,
    changePageSize,
    changeSort,
    updateFilters,
    reset,
  };
}