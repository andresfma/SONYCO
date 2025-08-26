import { useState, useCallback, useMemo } from 'react';

export interface FilterConfig {
  search?: string;
  estado?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface ActiveFilter {
  key: string;
  value: string | boolean;
  label: string;
  displayValue: string;
}

export interface UseFiltersParams {
  initialFilters?: FilterConfig;
  onFiltersChange?: (filters: FilterConfig) => void;
}

export interface UseFiltersReturn {
  filters: FilterConfig;
  appliedFilters: FilterConfig;
  activeFilters: ActiveFilter[];
  updateFilter: (key: string, value: string | boolean | undefined) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  applyFilters: () => void;
  hasUnappliedChanges: boolean;
}

export function useFilters(params?: UseFiltersParams): UseFiltersReturn {
  const { initialFilters = {}, onFiltersChange } = params || {};

  // Estado para los filtros en edición (antes de aplicar)
  const [filters, setFilters] = useState<FilterConfig>(initialFilters);
  
  // Estado para los filtros aplicados (los que se envían al backend)
  const [appliedFilters, setAppliedFilters] = useState<FilterConfig>(initialFilters);

  // Actualizar un filtro específico
  const updateFilter = useCallback((key: string, value: string | boolean | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Si el valor está vacío o undefined, eliminamos la key
      if (value === '' || value === undefined || value === null) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      
      return newFilters;
    });
  }, []);

  // Limpiar un filtro específico
  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    
    setAppliedFilters(prev => {
      const newApplied = { ...prev };
      delete newApplied[key];
      onFiltersChange?.(newApplied);
      return newApplied;
    });
  }, [onFiltersChange]);

  // Limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setFilters({});
    setAppliedFilters({});
    onFiltersChange?.({});
  }, [onFiltersChange]);

  // Aplicar los filtros actuales
  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  // Verificar si hay cambios sin aplicar
  const hasUnappliedChanges = useMemo(() => {
    const filterKeys = Object.keys(filters);
    const appliedKeys = Object.keys(appliedFilters);
    
    if (filterKeys.length !== appliedKeys.length) {
      return true;
    }
    
    return filterKeys.some(key => filters[key] !== appliedFilters[key]);
  }, [filters, appliedFilters]);

  // Generar la lista de filtros activos para mostrar
  const activeFilters = useMemo(() => {
    return Object.entries(appliedFilters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        let label = key;
        let displayValue = String(value);

        // Personalizar labels y valores para mostrar
        switch (key) {
          case 'search':
            label = 'Búsqueda';
            break;
          case 'estado':
            label = 'Estado';
            displayValue = value ? 'Activo' : 'Inactivo';
            break;
          case 'categoria':
            label = 'Categoría';
            break;
          default:
            // Capitalizar la primera letra
            label = key.charAt(0).toUpperCase() + key.slice(1);
        }

        return {
          key,
          value: value!,  // Ya filtramos que no sea undefined
          label,
          displayValue
        };
      });
  }, [appliedFilters]);

  return {
    filters,
    appliedFilters,
    activeFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    applyFilters,
    hasUnappliedChanges
  };
}