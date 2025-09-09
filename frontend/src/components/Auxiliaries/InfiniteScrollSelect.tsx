import React, { useState, useRef, useEffect } from 'react';
import { useInfiniteScroll } from '../../hooks/Auxiliaries/useInfiniteScroll';
import type { InfiniteScrollItem } from '../../hooks/Auxiliaries/useInfiniteScroll';

interface InfiniteScrollSelectProps {
  endpoint: string;
  value: number | null;
  onChange: (value: number | null, item: InfiniteScrollItem | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  // Para mostrar el valor actual cuando se inicializa
  initialDisplayValue?: string;
}

export function InfiniteScrollSelect({
  endpoint,
  value,
  onChange,
  placeholder = "Seleccionar...",
  label,
  disabled = false,
  required = false,
  initialDisplayValue
}: InfiniteScrollSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InfiniteScrollItem | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error: scrollError,
    loadMore
  } = useInfiniteScroll({
    endpoint,
    searchTerm,
    enabled: true, // siempre habilitado para cargar datos iniciales
    debounceMs: 500
  });

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Encontrar item seleccionado cuando cambia el value o se cargan los items
  useEffect(() => {
    if (value && items.length > 0) {
      const found = items.find(item => item.id === value);
      if (found) {
        setSelectedItem(found);
      }
    } else if (!value) {
      setSelectedItem(null);
    }
  }, [value, items]);

  // Si hay un valor inicial pero no se ha encontrado el item, crear uno temporal
  useEffect(() => {
    if (value && initialDisplayValue && !selectedItem && items.length === 0 && !isLoading) {
      setSelectedItem({
        id: value,
        nombre: initialDisplayValue
      });
    }
  }, [value, initialDisplayValue, selectedItem, items.length, isLoading]);

  // Manejar scroll infinito
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  const handleSelect = (item: InfiniteScrollItem) => {
    setSelectedItem(item);
    onChange(item.id, item);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(null);
    onChange(null, null);
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Input/Button */}
        <button
          id="infinite-scroll-select-button"
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={`relative w-full bg-white border rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue sm:text-sm ${
            disabled 
              ? 'border-gray-200 bg-gray-50' 
              : 'border-gray-300'
          }`}
        >
          <span className={`block truncate ${selectedItem ? 'text-gray-900' : 'text-gray-600'}`}>
            {selectedItem ? selectedItem.nombre : placeholder}
          </span>
          
          {/* Botón de limpiar */}
          {selectedItem && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600"
            >
              <span className="text-lg">×</span>
            </button>
          )}
          
          {/* Flecha */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray_select max-h-60 py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {/* Input de búsqueda */}
            <div className="sticky top-0 bg-white px-3 py-2 border-b">
              <input
                id='infinite-scroll-search-input'
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
                autoFocus
              />
            </div>

            {/* Lista de items */}
            <div ref={listRef} onScroll={handleScroll} className="max-h-40 overflow-y-auto">
              {isLoading && items.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-center">Cargando...</div>
              ) : scrollError ? (
                <div className="px-3 py-2 text-red-500 text-center">{scrollError}</div>
              ) : items.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-center">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <button
                      id={`infinite-scroll-option-${item.id}`}
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-gray_select hover:text-white ${
                        selectedItem?.id === item.id ? 'bg-gray_select text-white' : 'text-gray-900'
                      }`}
                    >
                      {item.nombre}
                    </button>
                  ))}
                  
                  {/* Loading más items */}
                  {isLoadingMore && (
                    <div className="px-3 py-2 text-gray-500 text-center text-sm">
                      Cargando más...
                    </div>
                  )}
                  
                  {/* Indicador de que no hay más */}
                  {!hasMore && items.length > 0 && (
                    <div className="px-3 py-1 text-gray-400 text-center text-xs border-t">
                      No hay más resultados
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
