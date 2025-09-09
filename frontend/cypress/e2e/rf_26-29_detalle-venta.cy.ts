describe('Gestión de Detalles de venta', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ: RF_29
  it('Debe listar detalles de ventas y permitir filtrado', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(true, categoria.id).then((producto) => {
            cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
                cy.crearClienteParaPruebas().then((cliente) =>{
                    cy.crearVentaParaPruebas(cliente.id).then((venta) => {
                        cy.crearDetalleVentaParaPruebas(venta.id, producto.id).then((ventaConDetalle) => {
                            cy.abrirEntidad('ventas')
                            
                            // Filtrar por venta existente
                            cy.get('#filter-search').type(venta.id.toString())
                            cy.get('#filter-boton').click()

                            // Ir vista de detalle
                            cy.seleccionarAccionFila(0,0)

                            // Validar vista de detalle de venta y existencia de detalle de venta
                            cy.url().should('match', /\/ventas\/\d+$/)
                            cy.contains(cliente.nombre).should('be.visible')
                            cy.contains('Productos Vendidos').should('be.visible')

                            // Validar existencia del ID del detalle recién creado
                            const detalleId = ventaConDetalle.detalle_ventas[0].id
                            cy.contains(detalleId).should('be.visible')

                            // Filtrar por nombre de producto
                            cy.get('#filter-search').type(producto.nombre)
                            cy.get('#filter-boton').click()
                            
                            // Validar existencia
                            cy.contains(detalleId).should('be.visible')

                            // Filtrar por código de producto
                            cy.get('#filter-search').clear().type(producto.codigo)
                            cy.get('#filter-boton').click()
                            
                            // Validar existencia
                            cy.contains(detalleId).should('be.visible')

                            // Filtrar por ID de detalle
                            cy.get('#filter-search').clear().type(detalleId.toString())
                            cy.get('#filter-boton').click()
                            
                            // Validar existencia
                            cy.contains(producto.nombre).should('be.visible')

                        })
                    })
                })
            })
        })
    })
  })

  // CREATE: RF_26
  it('Debe crear un detalle de venta con datos válidos', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(true, categoria.id).then((producto) => {
            cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
                cy.crearClienteParaPruebas().then((cliente) =>{
                    cy.crearVentaParaPruebas(cliente.id).then((venta) => {
                        cy.abrirEntidad('ventas')
                        
                        // Filtrar por venta existente
                        cy.get('#filter-search').type(venta.id.toString())
                        cy.get('#filter-boton').click()

                        // Ir vista de detalle
                        cy.seleccionarAccionFila(0,0)

                        // Validar vista de detalle de venta y existencia de detalle de venta
                        cy.url().should('match', /\/ventas\/\d+$/)
                        cy.contains(cliente.nombre).should('be.visible')
                        cy.contains('Productos Vendidos').should('be.visible')

                        // Crear detalle
                        cy.contains('Agregar Producto').click()

                        // Rellenar formulario
                        // Seleccionar producto usando el InfiniteScrollSelect
                        cy.get('#infinite-scroll-select-button').click()
                        cy.get('#infinite-scroll-search-input').type(producto.nombre)
                        cy.get(`#infinite-scroll-option-${producto.id}`).click()

                        cy.get('#cantidad').type('10')
                        cy.get('#precio_unitario').type('1000') // subtotal de 10000

                        // Guardar detalle de venta
                        cy.get('#crear-boton').click()
                        
                        // Validar detalle creado
                        cy.url().should('match', /\/ventas\/\d+$/)
                        cy.contains(producto.nombre).should('be.visible')
                        cy.contains('El detalle de venta se ha creado exitosamente').should('be.visible')

                    })
                })
            })
        })
    })
  })

  it('No debe crear un detalle de venta con datos requeridos faltantes', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(true, categoria.id).then((producto) => {
            cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
                cy.crearClienteParaPruebas().then((cliente) =>{
                    cy.crearVentaParaPruebas(cliente.id).then((venta) => {
                        cy.abrirEntidad('ventas')
                        
                        // Filtrar por venta existente
                        cy.get('#filter-search').type(venta.id.toString())
                        cy.get('#filter-boton').click()

                        // Ir vista de detalle
                        cy.seleccionarAccionFila(0,0)

                        // Validar vista de detalle de venta y existencia de detalle de venta
                        cy.url().should('match', /\/ventas\/\d+$/)
                        cy.contains(cliente.nombre).should('be.visible')
                        cy.contains('Productos Vendidos').should('be.visible')

                        // Crear detalle
                        cy.contains('Agregar Producto').click()

                        // Formulario vacío

                        // Guardar detalle de venta
                        cy.get('#crear-boton').click()
                        
                        // Validar detalle creado
                        cy.url().should('match', /\/ventas\/\d+$/)
                        cy.contains(producto.nombre).should('be.visible')
                        cy.contains('El detalle de venta se ha creado exitosamente').should('be.visible')

                    })
                })
            })
        })
    })
  })

  // EDIT: RF_23
  it('Debe editar correctamente una venta existente', () => {
    cy.crearClienteParaPruebas().then((cliente_1) => {  // Cliente para editar
        cy.crearClienteParaPruebas().then((cliente_2) => { // Cliente para crear
            cy.crearVentaParaPruebas(cliente_2.id, true).then((venta) => {
                cy.abrirEntidad('ventas')

                // Filtrar por venta recién creado
                cy.get('#filter-search').type(venta.id.toString())
                cy.get('#filter-boton').click()
                cy.contains(cliente_2.nombre).should('be.visible')

                // Seleccionar tercer venta para editar
                cy.seleccionarAccionFila(0,1)
                cy.contains('Editar Venta').should('be.visible')
                
                // Rellenar formulario

                // Seleccionar producto usando el InfiniteScrollSelect
                cy.get('#infinite-scroll-select-button').click()
                cy.get('#infinite-scroll-search-input').type(cliente_1.nombre)
                cy.get(`#infinite-scroll-option-${cliente_1.id}`).click()

                cy.get('#estado').select('Inactivo')

                cy.get('#editar-boton').click()

                // Verificar redirección al detalle del usuario actualizado
                cy.url().should('match', /\/ventas\/\d+$/)
                cy.contains('Detalle de la Venta').should('be.visible')
            })
        })
    })
  })

  // DELETE: RF_24
  it('Debe eliminar una venta sin relaciones activas', () => {
    cy.crearClienteParaPruebas().then((cliente) => { // Cliente para crear
        cy.crearVentaParaPruebas(cliente.id, true).then((venta) => {
            cy.abrirEntidad('ventas')

            // Filtrar por venta recién creado
            cy.get('#filter-search').type(venta.id.toString())
            cy.get('#filter-boton').click()

            // Ejecutar acción de eliminar en la primera fila
            cy.seleccionarAccionFila(0,3)
            cy.get('#delete-boton').click()

            // Verificar eliminación exitosa
            cy.url().should('include', '/ventas')
            cy.contains('eliminado exitosamente').should('be.visible')
            
        })
    })      
  })

  // Validación de vistas lista, detalle, creación y edición

  it('Debe navegar correctamente entre vistas de ventas', () => {
    cy.crearClienteParaPruebas().then((cliente) =>{
        cy.crearVentaParaPruebas(cliente.id).then((venta) => {
            cy.abrirEntidad('ventas')

            // Navegar a creación
            cy.contains('Nueva Venta').click()
            cy.contains('Crear Nueva Venta').should('be.visible')
            cy.url().should('include', '/ventas/crear')

            // Volver a lista
            cy.abrirEntidad('ventas')

            // Filtrar por venta recién creada
            cy.get('#filter-search').type(venta.id.toString())
            cy.get('#filter-boton').click()
            cy.contains(cliente.nombre).should('be.visible')
            

            // Navegar a detalle de la venta
            cy.seleccionarAccionFila(0,0)
            cy.contains('Detalle de la Venta').should('be.visible')
            cy.url().should('match', /\/ventas\/\d+$/)

            // Volver a lista
            cy.abrirEntidad('ventas')
            
            // Filtrar por venta recién creada
            cy.get('#filter-search').type(venta.id.toString())
            cy.get('#filter-boton').click()
            cy.contains(cliente.nombre).should('be.visible')

            // Navegar a la edición de la primera venta
            cy.seleccionarAccionFila(0,1)
            cy.contains('Editar Venta').should('be.visible')
            cy.url().should('match', /\/ventas\/\d+\/editar$/)
        })
    })
  })
})