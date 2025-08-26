import type { TableColumn, TableActions, SortOrder } from '../../types';
import { FiEye, FiEdit, FiToggleRight, FiTrash, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Tooltip } from '../Auxiliaries/Tooltip';
import { useState, useEffect } from 'react';

interface TableBaseProps<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  pageSizeOptions?: number[];

  columns: TableColumn<T>[];

  sortBy?: string;
  sortOrder?: SortOrder;

  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (sortBy: string) => void;

  actions?: TableActions<T>;
}

export function TableBase<T>({
  items,
  totalItems,
  totalPages,
  currentPage,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  columns,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  actions,
}: TableBaseProps<T>) {
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString());
  // Render flecha en header para columna ordenable
  function renderSortIndicator(colSortKey?: string) {
    if (!colSortKey || !sortBy || colSortKey !== sortBy) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  }

  // Manejar click en header de columna sortable
  function handleSortClick(colSortKey?: string) {
    if (!colSortKey) return;
    onSortChange(colSortKey);
  }

  // Manejar cambio en input de página
  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPageInputValue(e.target.value);
  }

  // Manejar envío de página
  function handlePageInputSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(pageInputValue);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        onPageChange(pageNumber);
      } else {
        setPageInputValue(currentPage.toString());
      }
    }
  }

  // Manejar navegación anterior/siguiente
  function handlePreviousPage() {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      setPageInputValue((currentPage - 1).toString());
    }
  }

  function handleNextPage() {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      setPageInputValue((currentPage + 1).toString());
    }
  }

  // Sincronizar input con currentPage cuando cambie
  useEffect(() => {
    setPageInputValue(currentPage.toString());
  }, [currentPage]);

  // Render botones de acciones condicionales
  function renderActions(item: T) {
    if (!actions) return null;

    return (
      <td className="px-4 py-2 border-b border-gray-100 w-32">
        <div className="flex gap-1 justify-center">
          {actions.showDetail && actions.onDetail && (
            <Tooltip text="Ver detalle" position="top">
              <button 
                onClick={() => actions.onDetail!(item)} 
                className="p-2 rounded-lg text-cl_font_top_table hover:text-cl_font_main hover:bg-icon_blue_hover transition-colors duration-200"
              >
                <FiEye size={16} />
              </button>
            </Tooltip>
          )}
          {actions.showEdit && actions.onEdit && (
            <Tooltip text="Editar" position="top">
              <button 
                onClick={() => actions.onEdit!(item)} 
                className="p-2 rounded-lg text-cl_font_top_table hover:text-green-800 hover:bg-icon_green_hover transition-colors duration-200"
              >
                <FiEdit size={16} />
              </button>
            </Tooltip>
          )}
          {actions.showToggleActive && actions.onToggleActive && (
            <Tooltip text="Activar/Desactivar" position="top">
              <button 
                onClick={() => actions.onToggleActive!(item)} 
                className="p-2 rounded-lg text-cl_font_top_table hover:text-amber-800 hover:bg-icon_amber_hover transition-colors duration-200"
              >
                <FiToggleRight size={16} />
              </button>
            </Tooltip>
          )}
          {actions.showDelete && actions.onDelete && (
            <Tooltip text="Eliminar" position="top">
              <button 
                onClick={() => actions.onDelete!(item)} 
                className="p-2 rounded-lg text-cl_font_top_table hover:text-red-800 hover:bg-icon_red_hover transition-colors duration-200"
              >
                <FiTrash size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      </td>
    );
  }

  // Render paginación simple y selector pageSize
  function renderPagination() {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="flex justify-between items-center my-2 px-2">
        {/* Primera sección: Navegación de páginas */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-1 rounded-md transition-colors duration-200 ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <FiChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Página</span>
            <input
              type="number"
              value={pageInputValue}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              onBlur={() => setPageInputValue(currentPage.toString())}
              min={1}
              max={totalPages}
              className="w-12 px-2 py-1 border text-sm border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span>de {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-1 rounded-md transition-colors duration-200 ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Segunda y tercera sección: Total y selector de tamaño */}
        <div className="flex items-center gap-6">
          {/* Segunda sección: Mostrando X de Y */}
          <div className="text-sm text-gray-600">
            Mostrando {startItem}-{endItem} de {totalItems}
          </div>

          {/* Tercera sección: Resultados por página */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 flex items-center gap-2">
              Resultados por página
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-b-app border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-200' : ''
                  }`}
                  onClick={() => col.sortable && handleSortClick(col.sortKey)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && renderSortIndicator(col.sortKey)}
                  </div>
                </th>
              ))}

              {/* Columna acciones opcional */}
              {actions &&
                (actions.showDetail ||
                  actions.showEdit ||
                  actions.showToggleActive ||
                  actions.showDelete) && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-32">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                  {columns.map((col, cidx) => (
                    <td key={cidx} className="px-4 py-3 text-gray-900 border-b border-gray-100">
                      {col.render(item)}
                    </td>
                  ))}
                  {actions && renderActions(item)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}