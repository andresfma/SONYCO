// TableBase y Metadatos de Paginación

export type SortOrder = 'asc' | 'desc';

export interface TableColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortKey?: string;
}

export interface TableActions<T> {
  showDetail?: boolean;
  showEdit?: boolean;
  showToggleActive?: boolean;
  showDelete?: boolean;

  onDetail?: (item: T) => void;
  onEdit?: (item: T) => void;
  onToggleActive?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export interface PagedResponse<T> {
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  items: T[];
}

// Entidades

// Categoría 
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

// Producto
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  unidad_medida: string;
  categoria_id: number;
  estado: boolean;
  categoria: Categoria;
}

// Inventario
export interface Inventario {
  id: number;
  producto_id: number;
  cantidad: number;
  cantidad_minima: number;
  estado: boolean;
  producto: Producto;
}

// Cliente 
export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo_persona: 'natural' | 'juridica';
  identificacion: string;
  estado: boolean;
}

// Usuario
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  contrasena: string;
  rol_id: 1 | 2;
  rol: string;
  estado: boolean;
}

// Ventas
export interface Venta {
  id: number;
  cliente_id: number;
  usuario_id: number;
  fecha: string;
  total: number;
  estado: boolean;

  cliente: Cliente;
  usuario: Usuario;
}

// Movimiento Inventario
export interface MovimientoInventario {
  id: number;
  producto_id: number;
  tipo: string;
  cantidad: number;
  cantidad_inventario: number;
  fecha: string;
  usuario_id: number;
  venta_id: number;

  producto: Producto;
  usuario: Usuario;
}

// Detalle Venta
export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;

  producto: Producto;
}

// Adicionales

// Tipo para items de scroll infinito
export interface InfiniteScrollItem {
  id: number;
  nombre: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // en milisegundos, default 5000
}
