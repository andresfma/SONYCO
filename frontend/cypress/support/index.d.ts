/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Realiza login en la aplicación
     */
    login(): Chainable<void>

    /**
     * Abre la página de listado de una entidad (usuarios, productos, inventarios, etc.)
     * @param entidad Nombre de la entidad en plural
     */
    abrirEntidad(entidad: string): Chainable<void>

    /**
     * Selecciona un botón de acción dentro de una fila de tabla
     * @param filaIndex Índice de la fila (0 = primera)
     * @param actionIndex Índice del botón de acción dentro de la última columna
     */
    seleccionarAccionFila(filaIndex: number, actionIndex: number): Chainable<JQuery<HTMLElement>>

    /**
     * Crea un usuario de prueba directamente vía API.
     * Devuelve el objeto usuario creado (incluyendo id, nombre, email, etc.)+
     * @param estado Estado del usuario (activo/inactivo), por defecto true (activo)
     * @param rolId  ID del rol (1: admin/ 2: no-admin), por defecto 2 (no-admin)
     */
    crearUsuarioParaPruebas(rolId?: number, estado?: boolean): Chainable<{
      id: number
      nombre: string
      email: string
      rol_id: number
      estado: boolean
    }>

    /**
     * Crea un producto de prueba directamente vía API.
     * Devuelve el objeto producto creado (incluyendo id, nombre, email, etc.)
     * @param estado Estado del producto (activo/inactivo), por defecto true (activo)
     * @param categoriaId ID de la categoría a la que pertenece el producto
     */
    crearProductoParaPruebas( categoriaId: number, estado?: boolean): Chainable<{
      id: number
      codigo: string
      nombre: string
      descripcion: string
      precio_unitario: number
      unidad_medida: string
      categoria_id: number
      estado: boolean
      categoria: { id: number; nombre: string}
    }>

    /**
     * Crea un cliente de prueba directamente vía API.
     * Devuelve el objeto cliente creado (incluyendo id, nombre, email, etc.)
     * @param estado Estado del cliente (activo/inactivo), por defecto true (activo)
     */
    crearClienteParaPruebas(estado?: boolean): Chainable<{
      id: number
      nombre: string
      email: string
      telefono: string
      direccion: string
      tipo_persona: string
      identificacion: string
      estado: boolean
    }>

    /**
     * Crea una venta de prueba directamente vía API.
     * Devuelve el objeto venta creado (incluyendo id, cliente_id, total, etc.)
     * @param estado Estado de la venta (activo/inactivo), por defecto true (activo)
     * @param clienteId ID del cliente asociado a la venta
     */
    crearVentaParaPruebas(clienteId: number, estado?: boolean): Chainable<{
      id: number
      cliente: { id: number; nombre: string}
      usuario: { id: number; nombre: string}
      total: number
      estado: boolean
      detalle_ventas: Array<{
        id: number
        producto: { id: number; nombre: string; codigo: string}
        cantidad: number
        precio_unitario: number
      }>
    }>

    /**
     * Crea un detalle de venta de prueba directamente vía API.
     * Devuelve el objeto venta, asociado al detalle creado (incluyendo id, producto_id, cantidad, etc.)
     * @param ventaId ID de la venta a la que pertenece el detalle
     * @param productoId ID del producto asociado al detalle
     * @param cantidad Cantidad del producto en el detalle, por defecto tiene un valor de 10
     */
    crearDetalleVentaParaPruebas(ventaId: number, productoId: number, cantidad?: number): Chainable<{
      id: number
      cliente: { id: number; nombre: string}
      usuario: { id: number; nombre: string}
      total: number
      estado: boolean
      detalle_ventas: Array<{
        id: number
        cantidad: number
        precio_unitario: string
        venta_id: number
        producto: { id: number; nombre: string; codigo: string}
      }>
    }>

    /**
     * Crea una categoría de prueba directamente vía API.
     * Devuelve el objeto categoría creado (incluyendo id, nombre, etc.)
     * @param estado Estado de la categoría (activo/inactivo), por defecto true (activo)
     */
    crearCategoriaParaPruebas(estado?: boolean): Chainable<{
      id: number
      nombre: string
      descripcion: string
      estado: boolean
    }>


    /** * Crea un inventario de prueba directamente vía API.
     * Devuelve el objeto inventario creado (incluyendo id, nombre, etc.)
     * @param estado Estado del inventario (activo/inactivo), por defecto true (activo)
     * @param producto_id ID del producto asociado al inventario
     */
    crearInventarioParaPruebas(producto_id: number, estado?: boolean): Chainable<{
      id: number
      producto_id: number
      cantidad: number
      cantidad_minima: number
      producto: { id: number; nombre: string; codigo: string}
      estado: boolean
    }>

    /**
     * Crea un movimiento de inventario de prueba directamente vía API.
     * Devuelve el objeto movimiento creado (incluyendo id, tipo, cantidad, etc.)
     * @param tipo Tipo de movimiento ('entrada' o 'salida')
     * @param cantidad Cantidad del movimiento
     * @param producto_id ID del producto asociado al movimiento
     */
    crearMovimientoParaPruebas(producto_id: number, tipo?: 'ENTRADA' | 'SALIDA', cantidad?: number, ): Chainable<{
      id: number
      tipo: string
      producto_id: number
      cantidad: number
      fecha: string
    }>

    /**
     * Exporta una entidad y valida que la descarga sea exitosa.
     * @param entidad Nombre de la entidad (ej: 'clientes', 'productos')
     */
    exportarEntidad(entidad: string): Chainable<void>

    /**
     * Aplica clear() de manera segura a un input.
     * Espera visibilidad y que no esté deshabilitado.
     * @param selector Selector del input (ej: '#cantidad')
     */
    clearSafe(selector: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Limpia y escribe texto en un input de forma segura.
     * Re-evalúa el DOM entre clear() y type() para evitar problemas
     * de re-renderizado en frameworks como React o Vue.
     * @param selector Selector del input (ej: '#cantidad')
     * @param text Texto a escribir
     */
    typeSafe(selector: string, text: string): Chainable<JQuery<HTMLElement>>;

  }
}

