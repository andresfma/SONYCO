describe('Gestión de Categorías', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ: RF_21
  it('Debe listar categorias y permitir filtrado', () => {
    cy.crearCategoriaParaPruebas(false).then((categoria) => {
        cy.abrirEntidad('categorias')  

        // Filtrar por nombre categoria recién creado
        cy.get('#filter-search').type(categoria.nombre)
        cy.get('#filter-boton').click()
        cy.contains(categoria.descripcion).should('be.visible')

        // Filtrar por estado
        cy.get('#filter-search').clear()
        cy.get('#filter-select-estado').select('Inactivo')
        cy.get('#filter-boton').click()
        cy.contains(categoria.nombre).should('be.visible')

        // Limpiar filtros y verificar lista completa
        cy.get('#clear-filters-boton').click()
        cy.get('#filter-search').should('have.value', '')
        cy.contains('Mostrando 1-10').should('be.visible')
    })
    
  })

  // CREATE: RF_18
  it('Debe crear una nueva categoria con datos válidos', () => {

    const randomId = Date.now()
    const nombre = `Categoria Test CY ${randomId}`

    cy.abrirEntidad('categorias')  
    cy.contains('Nueva Categoría').click()

    // Rellenar formulario
    cy.get('#nombre').type(nombre)
    cy.get('#estado').select('Activo')
    cy.get('#descripcion').type('Descripción de la categoría nueva')
    
    // Guardar categoria
    cy.get('#crear-boton').click()

    // Verificar redirección al detalle y visibilidad del usuario
    cy.url().should('match', /\/categorias\/\d+$/)
    cy.contains('Detalle de la Categoría').should('be.visible')
  })

  it('No debe crear una categoria con nombre ya existente', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.abrirEntidad('categorias')  

        // Acceder a vista de creación
        cy.contains('Nueva Categoría').click()

        // Rellenar formulario
        cy.get('#nombre').type(categoria.nombre)
        cy.get('#estado').select('Activo')
        cy.get('#descripcion').type('Descripción de la categoría nueva')

        // Guardar categoria
        cy.get('#crear-boton').click()

        // Validar mensaje de error por código duplicado
        cy.contains('Error al crear').should('be.visible')
        cy.contains('Ya existe una categoría con el nombre').should('be.visible')

    })
  })

  it('No debe crear una nueva categoria con datos requeridos faltantes', () => {

    cy.abrirEntidad('categorias')  
    cy.contains('Nueva Categoría').click()

    // Formulario sin rellenar

    // Guardar categoria
    cy.get('#crear-boton').click()

    // Verificar mensaje de error por datos faltantes
    cy.contains('Nombre es requerido').should('be.visible')
  })

  // EDIT: RF_19
  it('Debe editar correctamente una categoria existente', () => {
    const randomId = Date.now()
    const nombre = `Categoria Editada CY ${randomId}`

    cy.abrirEntidad('categorias')

    // Seleccionar tercer categoria para editar
    cy.seleccionarAccionFila(2,1)
    cy.contains('Editar Categoría').should('be.visible')
    
    // Rellenar formulario
    cy.get('#nombre').clear().type(nombre)
    cy.get('#estado').select('Activo')
    cy.get('#descripcion').clear().type('Descripción de la categoría editada')

    cy.get('#editar-boton').click()

    // Verificar redirección al detalle del usuario actualizado
    cy.url().should('match', /\/categorias\/\d+$/)
    cy.contains('Detalle de la Categoría').should('be.visible')
  })

  it('No debe permitir editar una categoria con nombre ya existente', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.abrirEntidad('categorias')

        // Seleccionar tercer categoria para editar
        cy.seleccionarAccionFila(2,1)
        cy.contains('Editar Categoría').should('be.visible')

        // Rellenar formulario
        cy.get('#nombre').clear().type(categoria.nombre) // Nombre duplicado
        cy.get('#estado').select('Activo')
        cy.get('#descripcion').clear().type('Descripción de la categoría editada')
        
        // Guardar categoria
        cy.get('#editar-boton').click()

        // Validar mensaje de error por código duplicado
        cy.contains('Error al actualizar').should('be.visible')
        cy.contains('Ya existe una categoría con ese nombre').should('be.visible')

    })
  })

  // DELETE: RF_20
  it('Debe eliminar una categoria sin relaciones activas', () => {

    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.abrirEntidad('categorias')  

        // Filtrar por categoria recién creado
        cy.get('#filter-search').type(categoria.nombre)
        cy.get('#filter-boton').click()

        // Ejecutar acción de eliminar en la primera fila
        cy.seleccionarAccionFila(0,3)
        cy.get('#delete-boton').click()

        // Verificar eliminación exitosa
        cy.url().should('include', '/categorias')
        cy.contains('eliminado exitosamente').should('be.visible')
    })
  })

  it('No debe eliminar una categoria con relaciones activas', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.crearProductoParaPruebas(true, categoria.id).then(() => {
        cy.abrirEntidad('categorias')

        // Filtrar por categoria recién creado
        cy.get('#filter-search').type(categoria.nombre)
        cy.get('#filter-boton').click()

        // Intentar eliminar el categoria con relaciones
        cy.seleccionarAccionFila(0, 3)
        cy.get('#delete-boton').click()

        // Validar mensaje de error por relaciones activas
        cy.url().should('include', '/categorias')
        cy.contains('tiene relaciones activas').should('be.visible')
        cy.contains('Se recomienda desactivar').should('be.visible')
    })
  })
  })

  it('Debe desactivar un categoria activa', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
        cy.abrirEntidad('categorias')  

        // Filtrar por categoria recién creado
        cy.get('#filter-search').type(categoria.nombre)
        cy.get('#filter-boton').click()

        // Opción de desactivar
        cy.seleccionarAccionFila(0,2)

        // Validar desactivación exitosa
        cy.contains('Estado actualizado').should('be.visible')
        cy.contains('ahora está inactiva').should('be.visible')
    })

  })

  // Validación de vistas lista, detalle, creación y edición

  it('Debe navegar correctamente entre vistas de categorias', () => {
    cy.abrirEntidad('categorias')

    // Navegar a creación
    cy.contains('Nueva Categoría').click()
    cy.contains('Crear Nueva Categoría').should('be.visible')
    cy.url().should('include', '/categorias/crear')

    // Volver a lista
    cy.abrirEntidad('categorias')

    // Navegar a detalle de la primera categoria
    cy.seleccionarAccionFila(0,0)
    cy.contains('Detalle de la Categoría').should('be.visible')
    cy.url().should('match', /\/categorias\/\d+$/)

    // Volver a lista
    cy.abrirEntidad('categorias')

    // Navegar a edición del primer categoria
    cy.seleccionarAccionFila(0,1)
    cy.contains('Editar Categoría').should('be.visible')
    cy.url().should('match', /\/categorias\/\d+\/editar$/)

  })
})