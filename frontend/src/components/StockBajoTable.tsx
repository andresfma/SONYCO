import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { TableBase } from "./Generic/TableBase";
import { FilterPanel, type FilterField } from './Auxiliaries/FilterPanel';
import { usePagination } from "../hooks/Auxiliaries/usePagination";
import { useFilters } from '../hooks/Auxiliaries/useFilters';
import { useStockBajo } from "../hooks/useStockBajo";
import type { TableColumn } from "../types";
import type { Inventario } from "../types/index";

export function StockBajoTable() {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);

  // Hook de paginación con su respectivo soporte para filtros
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 5,
    initialSortBy: 'codigo',
    pageSizeOptions: [5, 10, 15, 20]
  });

  // Hook de filtros
  const filterHook = useFilters({
    onFiltersChange: pagination.updateFilters
  });

  // Configuración de campos de filtro para stock bajo
  const filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Producto',
      type: 'text',
      placeholder: 'Nombre o código'
    }
  ];

  // Hook para obtener productos con stock bajo
  const {
    items,
    totalItems,
    totalPages,
    isLoading,
    error
  } = useStockBajo({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
    search: pagination.filters.search as string
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
  const columns: TableColumn<Inventario>[] = [
    {
      header: 'Código',
      sortable: true,
      sortKey: 'codigo',
      render: (item) => (
        <span
          className="cursor-pointer hover:text-blue"
          onClick={() => navigate(`/productos/${item.producto.id}`)}
        >
          {item.producto.codigo}
        </span>
      )
    },
    {
      header: 'Producto',
      sortable: true,
      sortKey: 'nombre',
      render: (item) => (
        <span
          className="cursor-pointer hover:text-blue"
          onClick={() => navigate(`/productos/${item.producto.id}`)}
        >
          {item.producto.nombre}
        </span>
      )
    },
    {
      header: 'Stock Actual',
      sortable: true,
      sortKey: 'cantidad',
      render: (item) => (
        <span>
          {item.cantidad.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Stock Mínimo',
      sortable: true,
      sortKey: 'cantidad_minima',
      render: (item) => (
        <span>
          {item.cantidad_minima.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Categoría',
      sortable: true,
      sortKey: 'categoria_nombre',
      render: (item) => (
        <span
          className="cursor-pointer hover:text-blue"
          onClick={() => navigate(`/categorias/${item.producto.categoria.id}`)}
        >
          {item.producto.categoria.nombre}
        </span>
      )
    },
    {
      header: 'Precio',
      sortable: true,
      sortKey: 'precio_unitario',
      render: (item) => (
        <span>
          $ {item.producto.precio_unitario
            .toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
      )
    }
  ];

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
            <p className="text-gray-500">Cargando productos con stock bajo...</p>
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
        />
      </div>
    </div>
  );
}