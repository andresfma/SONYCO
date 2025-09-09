import React from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';
import type { UseFiltersReturn } from '../../hooks/Auxiliaries/useFilters';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  options?: Array<{ value: string | boolean; label: string }>;
}

interface FilterPanelProps {
  filterHook: UseFiltersReturn;
  filterFields: FilterField[];
  onApplyFilters?: () => void;
}

export function FilterPanel({
  filterHook,
  filterFields,
  onApplyFilters
}: FilterPanelProps) {
  const {
    filters,
    activeFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    applyFilters,
    hasUnappliedChanges
  } = filterHook;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
    onApplyFilters?.();
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyFilters();
      onApplyFilters?.();
    }
  };



  return (
    <div className="bg-white border border-b-0 border-gray-200 rounded-t-app overflow-hidden">
      {/* Filtros Activos */}
      {activeFilters.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filtros Activos:</span>
            {activeFilters.map(filter => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{filter.displayValue}</span>
                <button
                  type="button"
                  onClick={() => clearFilter(filter.key)}
                  className="ml-1 text-blue hover:text-blue_hover transition-colors duration-200"
                >
                  <FiX size={14} />
                </button>
              </span>
            ))}
            {activeFilters.length > 1 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800 underline transition-colors duration-200"
              >
                Limpiar todos
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panel de Filtros */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-4 gap-4 items-end">
          {filterFields.map(field => (
            <div key={field.key} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              
              {field.type === 'text' ? (
                <div className="relative">
                  <input
                    id ={`filter-${field.key}`} 
                    type="text"
                    value={(filters[field.key] as string) || ''}
                    onChange={(e) => updateFilter(field.key, e.target.value)}
                    onKeyDown={handleInputKeyPress}
                    placeholder={field.placeholder || `Buscar por ${field.label.toLowerCase()}`}
                    className="w-full pl-10 pr-3 py-2 placeholder-gray-500 text-gray-950 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              ) : (
                <select
                  id ={`filter-select-${field.key}`} 
                  value={filters[field.key] !== undefined ? String(filters[field.key]) : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      updateFilter(field.key, undefined);
                    } else if (value === 'true' || value === 'false') {
                      updateFilter(field.key, value === 'true');
                    } else {
                      updateFilter(field.key, value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Todos</option>
                  {field.options?.map(option => (
                    <option key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Botón de filtrar */}
          <div className="flex gap-2">
            <button
              id='filter-boton'
              type="submit"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                hasUnappliedChanges
                  ? 'bg-blue hover:bg-blue_hover text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <FiFilter size={16} />
              Filtrar
            </button>
            
            {activeFilters.length > 0 && (
              <button
                id='clear-filters-boton'
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}