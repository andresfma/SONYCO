describe('Gestión de Ventas', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ: RF_25
  it('Debe listar ventas y permitir filtrado', () => {
    cy.crearClienteParaPruebas().then((cliente) => {
        cy.crearVentaParaPruebas(cliente.id, false).then((venta) => {
            cy.abrirEntidad('ventas')  

            // Filtrar por id de la venta recién creada
            cy.get('#filter-search').type(venta.id.toString())
            cy.get('#filter-boton').click()
            cy.contains(cliente.nombre).should('be.visible')

            // Filtrar por cliente de la venta
            cy.typeSafe('#filter-search', cliente.nombre)
            cy.get('#filter-boton').click()
            cy.contains(venta.id).should('be.visible')
            
            // Filtrar por vendedor de la venta (admin en este caso)
            cy.typeSafe('#filter-search', 'Admin')
            cy.get('#filter-boton').click()
            cy.contains(venta.id).should('be.visible')

            //Filtrar por estado
            cy.clearSafe('#filter-search')
            cy.get('#filter-select-estado').select('Inactivo')
            cy.get('#filter-boton').click()
            cy.contains(venta.id).should('be.visible')

            // Limpiar filtros y verificar lista completa
            cy.get('#clear-filters-boton').click()
            cy.get('#filter-search').should('have.value', '')
            cy.contains('Mostrando 1-10').should('be.visible')
        })
    })
    
  })

  // CREATE: RF_22
  it('Debe crear una nueva venta con datos válidos', () => {
    cy.crearClienteParaPruebas().then((cliente) => {
        cy.abrirEntidad('ventas')

        // Acceder a vista de creación
        cy.contains('Nueva Venta').click()

        // Rellenar formulario
        // Seleccionar cliente usando el InfiniteScrollSelect
        cy.get('#infinite-scroll-select-button').click()
        cy.get('#infinite-scroll-search-input').type(cliente.nombre)
        cy.get(`#infinite-scroll-option-${cliente.id}`).click()

        // Estado
        cy.get('#estado').select('Activo')

        // Guardar venta
        cy.get('#crear-boton').click()

        // Verificar redirección al detalle de la venta recién creado
        cy.url().should('match', /\/ventas\/\d+$/)
        cy.contains('Detalle de la Venta').should('be.visible')
    })
  })

  it('No debe crear una nueva venta con datos requeridos faltantes', () => {
    cy.abrirEntidad('ventas')  
    cy.contains('Nueva Venta').click()

    // Formulario sin rellenar

    // Guardar venta
    cy.get('#crear-boton').click()

    // Verificar mensaje de error por datos faltantes
    cy.contains('Cliente es requerido').should('be.visible')

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

                // Interceptar solicitud GET para sincronización
                cy.intercept('GET', `${Cypress.env('apiUrl')}/ventas/**`).as('getVentas')

                // Seleccionar venta recién creada para editar
                cy.seleccionarAccionFila(0,1)
                cy.contains('Editar Venta').should('be.visible')

                // Esperar a la respuesta del backend
                cy.wait('@getVentas')
                
                // Rellenar formulario

                // Seleccionar cliente usando el InfiniteScrollSelect
                cy.get('#infinite-scroll-select-button').click()
                cy.get('#infinite-scroll-search-input').type(cliente_1.nombre)
                cy.get(`#infinite-scroll-option-${cliente_1.id}`).click()

                cy.get('#estado').select('Inactivo')

                cy.get('#editar-boton').click()

                // Verificar redirección al detalle de la venta actualizado
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

  it('No debe eliminar una venta con relaciones activas', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
            cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
                cy.crearClienteParaPruebas().then((cliente) =>{
                    cy.crearVentaParaPruebas(cliente.id).then((venta) => {
                        cy.crearDetalleVentaParaPruebas(venta.id, producto.id).then((detalle) => {
                            cy.abrirEntidad('ventas')
                            
                            // Filtrar por venta existente
                            cy.get('#filter-search').type(venta.id.toString())
                            cy.get('#filter-boton').click()

                            // Intentar eliminar la venta filtrada con relaciones
                            cy.seleccionarAccionFila(0,3)
                            cy.get('#delete-boton').click()

                            // Validar mensaje de error por relaciones activas
                            cy.url().should('include', '/ventas')
                            cy.contains('tiene relaciones activas').should('be.visible')
                            cy.contains('Se recomienda desactivar').should('be.visible')
                        })
                    })
                })
            })
        })
    })
  })

  it('Debe desactivar una venta activa', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
            cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
                cy.crearClienteParaPruebas().then((cliente) =>{
                    cy.crearVentaParaPruebas(cliente.id).then((venta) => {
                        cy.abrirEntidad('ventas')
                        
                        // Filtrar por venta existente
                        cy.get('#filter-search').type(venta.id.toString())
                        cy.get('#filter-boton').click()

                        // Intentar eliminar la venta filtrada con relaciones
                        cy.seleccionarAccionFila(0,2)

                        // Validar mensaje de error por relaciones activas
                        cy.contains('Estado actualizado').should('be.visible')
                        cy.contains('ahora está inactiva').should('be.visible')
                    })
                })
            })
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