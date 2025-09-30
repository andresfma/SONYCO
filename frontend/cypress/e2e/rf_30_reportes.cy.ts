describe('Gestión de Detalles de venta', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // Exportación de productos
  it('Debe exportar reporte de productos', () => {
    cy.exportarEntidad('productos')
  })

  // Exportación de movimientos de un producto
  it('Debe exportar reporte de movimientos de un producto en particular', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto) => {
            cy.abrirEntidad('productos')

            // Filtrar por producto recién creado
            cy.get('#filter-search').type(producto.codigo)
            cy.get('#filter-boton').click()
            cy.contains(producto.codigo).should('be.visible')

            // Seleccionar opción de detalle
            cy.seleccionarAccionFila(0,0)
            cy.contains('Detalle del Producto').should('be.visible')

            // Interceptar petición para verificación por codigo de respuesta
            cy.intercept('GET', `${Cypress.env('apiUrl')}/exportar/**`).as('descargaReporte')

            // Seleccionar botón de exportar
            cy.contains('Exportar movimientos').click()

            //Verificar exportación
            cy.contains('El archivo se ha descargado correctamente').should('exist')
            cy.wait('@descargaReporte').its('response.statusCode').should('eq', 200)
        })
    })
  })

  // Exportación de categorías
  it('Debe exportar reporte de categorías', () => {
    cy.exportarEntidad('categorias')
  })

  // Exportación de inventarios
  it('Debe exportar reporte de inventarios', () => {
    cy.exportarEntidad('inventarios')
  })

  // Exportación de movimientos
  it('Debe exportar reporte de movimientos', () => {
    cy.exportarEntidad('movimientos')
  })

  // Exportación de ventas
  it('Debe exportar reporte de ventas', () => {
    cy.exportarEntidad('ventas')
  })

  // Exportación de clientes
  it('Debe exportar reporte de clientes', () => {
    cy.exportarEntidad('clientes')
  })

  // Exportación de usuarios
  it('Debe exportar reporte de usuarios', () => {
    cy.exportarEntidad('usuarios')
  })

  // Exportación de movimientos de un usuario
  it('Debe exportar reporte de movimientos de un usuario en particular', () => {
    cy.crearUsuarioParaPruebas().then((usuario) => {
        cy.abrirEntidad('usuarios')

        // Filtrar por usuario recién creado
        cy.get('#filter-search').type(usuario.nombre)
        cy.get('#filter-boton').click()
        cy.contains(usuario.email).should('be.visible')

        // Seleccionar opción de detalle
        cy.seleccionarAccionFila(0,0)
        cy.contains('Detalle del Usuario').should('be.visible')

        // Interceptar petición para verificación por codigo de respuesta
        cy.intercept('GET', `${Cypress.env('apiUrl')}/exportar/**`).as('descargaReporte')

        // Seleccionar botón de exportar
        cy.contains('Exportar movimientos').click()

        //Verificar exportación
        cy.contains('El archivo se ha descargado correctamente').should('exist')
        cy.wait('@descargaReporte').its('response.statusCode').should('eq', 200)
    })
  })

})