describe('Gestión de Clientes', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // CREATE: RF_06 
  it('Debe crear un nuevo movimiento de entrada', () => {
    // Creación de producto e inventario para el movimiento con cantidad inicial 100
    cy.crearProductoParaPruebas().then((producto) => {
        cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
            cy.abrirEntidad('movimientos')
            cy.contains('Nueva Entrada').click()
            
            // Rellenar formulario

            // Seleccionar producto usando el InfiniteScrollSelect
            cy.get('#infinite-scroll-select-button').click()
            cy.get('#infinite-scroll-search-input').type(producto.nombre)
            cy.get(`#infinite-scroll-option-${producto.id}`).click()
            
            cy.get('#cantidad').type('150') // Entrada de 150 unidades

            cy.get('#crear-boton').click()

            // Verificar redirección al detalle del inventario actualizado
            cy.url().should('match', /\/movimientos\/\d+$/)
            cy.contains('Detalle del Movimiento').should('be.visible')
        })
    })
    
  })

  it('Debe crear un nuevo movimiento de salida', () => {
    // Creación de producto e inventario para el movimiento con cantidad inicial 100
    cy.crearProductoParaPruebas().then((producto) => {
        cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
            cy.abrirEntidad('movimientos')
            cy.contains('Nueva Salida').click()
            
            // Rellenar formulario

            // Seleccionar producto usando el InfiniteScrollSelect
            cy.get('#infinite-scroll-select-button').click()
            cy.get('#infinite-scroll-search-input').type(producto.nombre)
            cy.get(`#infinite-scroll-option-${producto.id}`).click()
            
            cy.get('#cantidad').type('20') // Salida de 20 unidades

            cy.get('#crear-boton').click()

            // Verificar redirección al detalle del inventario actualizado
            cy.url().should('match', /\/movimientos\/\d+$/)
            cy.contains('Detalle del Movimiento').should('be.visible')
        })
    })
    
  })

  it('No debe crear un nuevo movimiento de entrada/salida con datos requeridos faltantes', () => {
    // Creación de producto e inventario para el movimiento con cantidad inicial 100

    // ENTRADA
    cy.abrirEntidad('movimientos')
    cy.contains('Nueva Entrada').click()
    
    // Formulario sin datos

    cy.get('#crear-boton').click()

    // Verificar mensaje de error por datos faltantes
    cy.contains('Producto es requerido').should('be.visible')
    cy.contains('Cantidad del movimiento es requerido').should('be.visible')

    // SALIDA
    cy.abrirEntidad('movimientos')
    cy.contains('Nueva Salida').click()

    // Formulario sin datos
    cy.get('#crear-boton').click()

    // Verificar mensaje de error por datos faltantes
    cy.contains('Producto es requerido').should('be.visible')
    cy.contains('Cantidad del movimiento es requerido').should('be.visible')

  })

  // RF_07: Actualización automática de inventario y movimientos históricos

  it('Debe actualizar inventario y generar historial del movimiento luego de una entrada', () => {
    // Creación de producto e inventario para el movimiento con cantidad inicial 100
    cy.crearProductoParaPruebas().then((producto) => {
        cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
            cy.abrirEntidad('movimientos')
            cy.contains('Nueva Entrada').click()
            
            // Rellenar formulario

            // Seleccionar producto usando el InfiniteScrollSelect
            cy.get('#infinite-scroll-select-button').click()
            cy.get('#infinite-scroll-search-input').type(producto.nombre)
            cy.get(`#infinite-scroll-option-${producto.id}`).click()
            
            cy.get('#cantidad').type('20') // Salida de 20 unidades

            cy.get('#crear-boton').click()

            // Verificar redirección al detalle del inventario actualizado
            cy.url().should('match', /\/movimientos\/\d+$/)
            cy.contains('Detalle del Movimiento').should('be.visible')

            // Obtener el ID del movimiento desde la URL y guardarlo como alias
            cy.url().then((url) => {
            const match = url.match(/\/movimientos\/(\d+)$/)
            if (match) {
                const movimientoId = match[1]
                cy.wrap(movimientoId).as('movimientoId')
            }
            })

            // Volver a la página principal de movimientos
            cy.abrirEntidad('movimientos')

            // Filtrar por ID del movimiento recién creado
            cy.get('@movimientoId').then((movimientoId) => {
                // Asegurar que movimientoId es un string
                const id = Array.isArray(movimientoId) ? movimientoId[0] : movimientoId
                cy.get('#filter-search').type(String(id))
                cy.get('#filter-boton').click()
                cy.contains(producto.nombre).should('be.visible')
                cy.contains('ENTRADA').should('be.visible')
            })

            // Verificar que el inventario se haya actualizado correctamente
            cy.abrirEntidad('inventarios')
            cy.get('#filter-search').type(producto.nombre)
            cy.get('#filter-boton').click()
            cy.contains(producto.codigo).should('be.visible')
            cy.contains('120.00').should('be.visible') // Cantidad inicial 100 + 20 de entrada

        })
    })
    
  })

  it('Debe actualizar inventario y generar historial del movimiento luego de una salida', () => {
    // Creación de producto e inventario para el movimiento con cantidad inicial 100
    cy.crearProductoParaPruebas().then((producto) => {
        cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
            cy.abrirEntidad('movimientos')
            cy.contains('Nueva Salida').click()
            
            // Rellenar formulario

            // Seleccionar producto usando el InfiniteScrollSelect
            cy.get('#infinite-scroll-select-button').click()
            cy.get('#infinite-scroll-search-input').type(producto.nombre)
            cy.get(`#infinite-scroll-option-${producto.id}`).click()
            
            cy.get('#cantidad').type('20') // Salida de 20 unidades

            cy.get('#crear-boton').click()

            // Verificar redirección al detalle del inventario actualizado
            cy.url().should('match', /\/movimientos\/\d+$/)
            cy.contains('Detalle del Movimiento').should('be.visible')

            // Obtener el ID del movimiento desde la URL y guardarlo como alias
            cy.url().then((url) => {
            const match = url.match(/\/movimientos\/(\d+)$/)
            if (match) {
                const movimientoId = match[1]
                cy.wrap(movimientoId).as('movimientoId')
            }
            })

            // Volver a la página principal de movimientos
            cy.abrirEntidad('movimientos')

            // Filtrar por ID del movimiento recién creado
            cy.get('@movimientoId').then((movimientoId) => {
                // Asegurar que movimientoId es un string
                const id = Array.isArray(movimientoId) ? movimientoId[0] : movimientoId
                cy.get('#filter-search').type(String(id))
                cy.get('#filter-boton').click()
                cy.contains(producto.nombre).should('be.visible')
                cy.contains('SALIDA').should('be.visible')
            })

            // Verificar que el inventario se haya actualizado correctamente
            cy.abrirEntidad('inventarios')
            cy.get('#filter-search').type(producto.nombre)
            cy.get('#filter-boton').click()
            cy.contains(producto.codigo).should('be.visible')
            cy.contains('80.00').should('be.visible') // Cantidad inicial 100 - 20 de salida

        })
    })
    
  })

  // RF_08: Alertas de stock mínimo
  it('Debe mostrar los productos con stock bajo en el tablero de inicio', () => {
    // Creación de producto e inventario para el movimiento con cantidad inicial 100
    cy.crearProductoParaPruebas().then((producto) => {
        cy.abrirEntidad('inventarios') 
        cy.contains('Nuevo Inventario').click()

        // Rellenar formulario

        // Seleccionar producto usando el InfiniteScrollSelect
        cy.get('#infinite-scroll-select-button').click()
        cy.get('#infinite-scroll-search-input').type(producto.nombre)
        cy.get(`#infinite-scroll-option-${producto.id}`).click()

        cy.get('#cantidad').type('10')
        cy.get('#cantidad_minima').type('20') // Stock mínimo mayor a la cantidad inicial
        cy.get('#estado').select('Activo')
        
        // Guardar inventario
        cy.get('#crear-boton').click()

        // Verificar redirección al detalle y visibilidad del usuario
        cy.url().should('match', /\/inventarios\/\d+$/)
        cy.contains('Detalle del Inventario').should('be.visible')

        // Volver al dashboard y verificar alerta de stock bajo
        cy.visit('/dashboard')
        cy.contains('Stock Bajo').should('be.visible')

        // Filtrar por el producto creado en la alerta
        cy.get('#filter-search').type(producto.codigo)
        cy.get('#filter-boton').click()
        cy.contains(producto.nombre).should('be.visible')

    })
    
  })

  // READ: RF_09
  it('Debe listar movimientos y permitir filtrado', () => {
    cy.crearProductoParaPruebas().then((producto) => {
        cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
            // Crear varios movimientos para el producto
            cy.crearMovimientoParaPruebas(producto.id, 'ENTRADA', 50).then((entrada) => {
                cy.crearMovimientoParaPruebas(producto.id, 'SALIDA', 20).then((salida) => {
                    
                    cy.abrirEntidad('movimientos')

                    // Filtrar por id de movimiento de entrada
                    cy.get('#filter-search').type(String(entrada.id))
                    cy.get('#filter-boton').click()
                    cy.contains(producto.nombre).should('be.visible')
                    cy.contains('ENTRADA').should('be.visible')

                    // Limpiar filtro y filtrar por id de movimiento de salida
                    cy.get('#clear-filters-boton').click()
                    cy.get('#filter-search').clear().type(String(salida.id))
                    cy.get('#filter-boton').click()
                    cy.contains(producto.nombre).should('be.visible')
                    cy.contains('SALIDA').should('be.visible')

                    // Limpiar filtros
                    cy.get('#clear-filters-boton').click()

                    // Filtrar por tipo de movimiento
                    cy.get('#filter-select-tipo').select('Entrada')
                    cy.get('#filter-boton').click()
                    cy.contains(producto.nombre).should('be.visible')

                    // Limpiar filtros
                    cy.get('#clear-filters-boton').click()
                    cy.get('#filter-select-tipo').select('Salida')
                    cy.get('#filter-boton').click()
                    cy.contains(producto.nombre).should('be.visible')
                })
            }) 
        })
    })
  })

})
