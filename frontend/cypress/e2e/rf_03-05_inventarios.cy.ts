describe('Gestión de Inventarios', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ: RF_05
  it('Debe listar inventarios y permitir filtrado', () => {
    cy.crearProductoParaPruebas().then((producto) => {
        cy.crearInventarioParaPruebas(false, producto.id).then((inventario) => {
            cy.abrirEntidad('inventarios')  

            // Filtrar por nombre del producto del inventario recién creado
            cy.get('#filter-search').type(producto.nombre)
            cy.get('#filter-boton').click()
            cy.contains(producto.codigo).should('be.visible')

            // Filtrar por código del producto del inventario recién creado
            cy.get('#filter-search').clear().type(producto.codigo)
            cy.get('#filter-boton').click()
            cy.contains(producto.nombre).should('be.visible')

            // Filtrar por estado
            cy.get('#filter-search').clear()
            cy.get('#filter-select-estado').select('Inactivo')
            cy.get('#filter-boton').click()
            cy.contains(producto.codigo).should('be.visible')

            // Limpiar filtros y verificar lista completa
            cy.get('#clear-filters-boton').click()
            cy.get('#filter-search').should('have.value', '')
            cy.contains('Mostrando 1-10').should('be.visible')
        })
    })
    
  })

  // CREATE: RF_03
  it('Debe crear una nuevo inventario con datos válidos', () => {
    cy.crearProductoParaPruebas().then((producto) => {
        cy.abrirEntidad('inventarios') 
        cy.contains('Nuevo Inventario').click()

        // Rellenar formulario

        // Seleccionar producto usando el InfiniteScrollSelect
        cy.get('#infinite-scroll-select-button').click()
        cy.get(`#infinite-scroll-option-${producto.id}`).click()

        cy.get('#cantidad').type('100')
        cy.get('#cantidad_minima').type('10')
        cy.get('#estado').select('Activo')
        
        // Guardar inventario
        cy.get('#crear-boton').click()

        // Verificar redirección al detalle y visibilidad del usuario
        cy.url().should('match', /\/inventarios\/\d+$/)
        cy.contains('Detalle del Inventario').should('be.visible')

    })

  })

  it('No debe crear una nuevo inventario con datos requeridos faltantes', () => {

    cy.abrirEntidad('inventarios')  
    cy.contains('Nuevo Inventario').click()

    // Formulario sin rellenar

    // Guardar inventario
    cy.get('#crear-boton').click()

    // Verificar mensaje de error por datos faltantes
    cy.contains('Producto es requerido').should('be.visible')
    cy.contains('Cantidad es requerido').should('be.visible')
    cy.contains('Cantidad mínima es requerido').should('be.visible')
  })

  // EDIT: RF_04
  it('Debe editar correctamente una inventario existente', () => {
    cy.crearProductoParaPruebas().then((producto) => {
        cy.crearInventarioParaPruebas(true, producto.id).then((inventario) => {

            cy.abrirEntidad('inventarios')

            // Filtrar por nombre del producto del inventario recién creado
            cy.get('#filter-search').type(producto.nombre)
            cy.get('#filter-boton').click()
            cy.contains(producto.codigo).should('be.visible')

            // Seleccionar tercer inventario para editar
            cy.seleccionarAccionFila(0,1)
            cy.contains('Editar Inventario').should('be.visible')
            
            // Rellenar formulario
            cy.get('#cantidad').clear().type('150')
            cy.get('#cantidad_minima').clear().type('15')
            cy.get('#estado').select('Inactivo')

            cy.get('#editar-boton').click()

            // Verificar redirección al detalle del inventario actualizado
            cy.url().should('match', /\/inventarios\/\d+$/)
            cy.contains('Detalle del Inventario').should('be.visible')
        })
    })

  })

  it('No debe editar un inventario con datos requeridos faltantes', () => {
    cy.crearProductoParaPruebas().then((producto) => {
        cy.crearInventarioParaPruebas(true, producto.id).then((inventario) => {

            cy.abrirEntidad('inventarios')

            // Filtrar por nombre del producto del inventario recién creado
            cy.get('#filter-search').type(producto.nombre)
            cy.get('#filter-boton').click()
            cy.contains(producto.codigo).should('be.visible')

            // Seleccionar tercer inventario para editar
            cy.seleccionarAccionFila(0,1)
            cy.contains('Editar Inventario').should('be.visible')
            
            // Rellenar formulario
            cy.get('#cantidad').clear()
            cy.get('#cantidad_minima').clear()

            cy.get('#editar-boton').click()

            // Verificar mensaje de error por datos faltantes
            cy.contains('Cantidad es requerido').should('be.visible')
            cy.contains('Cantidad mínima es requerido').should('be.visible')
        })
    })
  })

  // Validación de vistas lista, detalle, creación y edición

  it('Debe navegar correctamente entre vistas de inventarios', () => {
    cy.abrirEntidad('inventarios')

    // Navegar a creación
    cy.contains('Nuevo Inventario').click()
    cy.contains('Crear Nuevo Inventario').should('be.visible')
    cy.url().should('include', '/inventarios/crear')

    // Volver a lista
    cy.abrirEntidad('inventarios')

    // Navegar a detalle de la primera inventario
    cy.seleccionarAccionFila(0,0)
    cy.contains('Detalle del Inventario').should('be.visible')
    cy.url().should('match', /\/inventarios\/\d+$/)

    // Volver a lista
    cy.abrirEntidad('inventarios')

    // Navegar a edición del primer inventario
    cy.seleccionarAccionFila(0,1)
    cy.contains('Editar Inventario').should('be.visible')
    cy.url().should('match', /\/inventarios\/\d+\/editar$/)

  })
})