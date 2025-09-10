describe('Gestión de Detalles de venta', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ: RF_29
  it('Debe listar detalles de ventas y permitir filtrado', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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
                        
                        // Verificar mensaje de error por datos faltantes
                        cy.contains('Producto es requerido').should('be.visible')
                        cy.contains('Cantidad es requerido').should('be.visible')

                    })
                })
            })
        })
    })
  })

  it('No debe crear un detalle de venta con cantidad mayor a stock disponible', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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

                        cy.get('#cantidad').type('10000000000') // Valor muy grande
                        cy.get('#precio_unitario').type('1000') // subtotal de 10000

                        // Guardar detalle de venta
                        cy.get('#crear-boton').click()
                        
                        // Verificar mensake de error
                        cy.contains('Stock insuficiente para producto').should('be.visible')

                    })
                })
            })
        })
    })
  })

  // EDIT: RF_27
  it('Debe editar correctamente una venta existente', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
            cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
                cy.crearProductoParaPruebas(categoria.id).then((producto_editar) => { // Producto adicional para la edición
                    cy.crearInventarioParaPruebas(producto_editar.id).then((inventario_editar) => { // Inventario del producto para la edición
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

                                    // Filtrar por ID de detalle
                                    cy.get('#filter-search').clear().type(detalleId.toString())
                                    cy.get('#filter-boton').click()
                                    
                                    // Validar existencia
                                    cy.contains(producto.nombre).should('be.visible')

                                    // Seleccionar opción editar
                                    cy.seleccionarAccionFila(0,0)
                                    cy.contains('Editar la sub-venta').should('be.visible')
                                    cy.contains(detalleId).should('be.visible')
                                    
                                    // Rellenar formulario
                                    // Seleccionar producto usando el InfiniteScrollSelect
                                    cy.get('#infinite-scroll-select-button').click()
                                    cy.get('#infinite-scroll-search-input').type(producto_editar.nombre)
                                    cy.get(`#infinite-scroll-option-${producto_editar.id}`).click()

                                    // Editar cantidad y precio unitario
                                    cy.get('#cantidad').clear().type('20')
                                    cy.get('#precio_unitario').clear().type('10000')  // Subtotal 20*10000 = 200000

                                    // Editar boton
                                    cy.get('#editar-boton').click()

                                    // Verificar redirección al detalle del usuario actualizado
                                    cy.url().should('match', /\/ventas\/\d+$/)
                                    cy.contains('Detalle de la Venta').should('be.visible')
                                    cy.contains('200.000')
                                })
                            })
                        })
                    })
                })
            })
        })
    })
  })

  it('No debe editar una venta existente cuando cantidad supera a stock disponible', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
            cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
                cy.crearProductoParaPruebas(categoria.id).then((producto_editar) => { // Producto adicional para la edición
                    cy.crearInventarioParaPruebas(producto_editar.id).then((inventario_editar) => { // Inventario del producto para la edición
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

                                    // Filtrar por ID de detalle
                                    cy.get('#filter-search').clear().type(detalleId.toString())
                                    cy.get('#filter-boton').click()
                                    
                                    // Validar existencia
                                    cy.contains(producto.nombre).should('be.visible')

                                    // Seleccionar opción editar
                                    cy.seleccionarAccionFila(0,0)
                                    cy.contains('Editar la sub-venta').should('be.visible')
                                    cy.contains(detalleId).should('be.visible')
                                    
                                    // Rellenar formulario
                                    // Seleccionar producto usando el InfiniteScrollSelect
                                    cy.get('#infinite-scroll-select-button').click()
                                    cy.get('#infinite-scroll-search-input').type(producto_editar.nombre)
                                    cy.get(`#infinite-scroll-option-${producto_editar.id}`).click()

                                    // Editar cantidad y precio unitario
                                    cy.get('#cantidad').clear().type('10000000000') // valor muy grande
                                    cy.get('#precio_unitario').clear().type('10000')

                                    // Editar boton
                                    cy.get('#editar-boton').click()

                                    // Verificar mensake de error
                                    cy.contains('Stock insuficiente para el nuevo producto').should('be.visible')
                                })
                            })
                        })
                    })
                })
            })
        })
    })
  })

  // DELETE: RF_28
  it('Debe eliminar un detalle venta correctamente', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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

                            // Filtrar por ID de detalle
                            cy.get('#filter-search').clear().type(detalleId.toString())
                            cy.get('#filter-boton').click()
                            
                            // Validar existencia
                            cy.contains(producto.nombre).should('be.visible')

                            // Seleccionar de una opción eliminar
                            cy.seleccionarAccionFila(0,1)
                            cy.get('#delete-boton').click()

                            // Verificar eliminación
                            cy.contains('eliminado exitosamente').should('be.visible')
                            cy.url().should('match', /\/ventas\/\d+$/)
                        })
                    })
                })
            })
        })
    })
  })

  // Validación de vistas de creación y edición

  it('Debe navegar correctamente entre vistas de ventas', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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

                            // Filtrar por ID de detalle
                            cy.get('#filter-search').clear().type(detalleId.toString())
                            cy.get('#filter-boton').click()
                            
                            // Validar existencia
                            cy.contains(producto.nombre).should('be.visible')

                            // Vista editar
                            cy.seleccionarAccionFila(0,0)

                            // Verificar vista editar
                            cy.contains('Editar la sub-venta').should('be.visible')
                            cy.url().should('match', /\/detalle_venta\/\d+\/editar$/)

                            cy.get('#volver-boton').click()

                            //  Vista crear
                            cy.contains('Agregar Producto').click()

                            // Verificar vista crear
                            cy.contains('Agregar Producto a la Venta').should('be.visible')
                            cy.url().should('include', 'agregar-producto')

                        })
                    })
                })
            })
        })
    })
  })

})