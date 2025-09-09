describe('Gestión de Productos', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ: RF_13
  it('Debe listar productos y permitir filtrado', () => {
    cy.crearProductoParaPruebas(false).then((producto) => {
        cy.abrirEntidad('productos')  

        // Filtrar por nombre producto recién creado
        cy.get('#filter-search').type(producto.nombre)
        cy.get('#filter-boton').click()
        cy.contains(producto.codigo).should('be.visible')

        // Filtrar por código producto recién creado
        cy.get('#filter-search').clear().type(producto.codigo)
        cy.get('#filter-boton').click()
        cy.contains(producto.nombre).should('be.visible')

        //Filtrar por categoría
        cy.get('#filter-search').clear()
        cy.get('#filter-categoria').type(producto.categoria.nombre)
        cy.get('#filter-boton').click()
        cy.contains(producto.categoria.nombre).should('be.visible')

        //Filtrar por estado
        cy.get('#filter-categoria').clear()
        cy.get('#filter-select-estado').select('Inactivo')
        cy.get('#filter-boton').click()
        cy.contains(producto.nombre).should('be.visible')

        // Limpiar filtros y verificar lista completa
        cy.get('#clear-filters-boton').click()
        cy.get('#filter-search').should('have.value', '')
        cy.get('#filter-categoria').should('have.value', '')
        cy.contains('Mostrando 1-10').should('be.visible')
    })
    
  })

  // CREATE: RF_10
  it('Debe crear un nuevo producto con datos válidos', () => {

    const randomId = Date.now()
    const codigo = `Z${randomId}`
    const nombre = `Producto Test ${randomId}`
    const descripcion = `Descripción del producto test ${randomId}`

    cy.abrirEntidad('productos')  
    cy.contains('Nuevo Producto').click()

    // Rellenar formulario
    cy.get('#codigo').type(codigo)
    cy.get('#nombre').type(nombre)
    cy.get('#precio_unitario').type('10000')
    cy.get('#unidad_medida').select('Unidad')

    // Seleccionar categoría usando el InfiniteScrollSelect
    cy.get('#infinite-scroll-select-button').click()
    cy.get('#infinite-scroll-option-1').click()
    
    cy.get('#estado').select('Activo')
    cy.get('#descripcion').type(descripcion)


    // Guardar producto
    cy.get('#crear-boton').click()

    // Verificar redirección al detalle y visibilidad del usuario
    cy.url().should('match', /\/productos\/\d+$/)
    cy.contains('Detalle del Producto').should('be.visible')
  })

  it('No debe crear un producto con código ya existente', () => {
    cy.crearProductoParaPruebas().then((producto) => {
        cy.abrirEntidad('productos')  

        // Acceder a vista de creación
        cy.contains('Nuevo Producto').click()

        // Rellenar formulario
        cy.get('#codigo').type(producto.codigo)
        cy.get('#nombre').type('Otro Producto')
        cy.get('#precio_unitario').type('10000')
        cy.get('#unidad_medida').select('Unidad')

        // Seleccionar categoría usando el InfiniteScrollSelect
        cy.get('#infinite-scroll-select-button').click()
        cy.get('#infinite-scroll-option-1').click()

        cy.get('#estado').select('Activo')
        cy.get('#descripcion').type('Descripción del otro producto')

        // Guardar producto
        cy.get('#crear-boton').click()

        // Validar mensaje de error por código duplicado
        cy.contains('Error al crear').should('be.visible')
        cy.contains('ya existe').should('be.visible')

    })
  })

  it('No debe crear un nuevo producto con datos requeridos faltantes', () => {

    cy.abrirEntidad('productos')  
    cy.contains('Nuevo Producto').click()

    // Formulario sin rellenar

    // Guardar producto
    cy.get('#crear-boton').click()

    // Verificar mensaje de error por datos faltantes
    cy.contains('Código es requerido').should('be.visible')
    cy.contains('Nombre es requerido').should('be.visible')
    cy.contains('Precio Unitario es requerido').should('be.visible')
    cy.contains('Unidad de Medida es requerido').should('be.visible')
    cy.contains('Categoría es requerido').should('be.visible')
  })

  // EDIT: RF_11
  it('Debe editar correctamente un producto existente', () => {
    cy.crearProductoParaPruebas().then((producto) => {
      const randomId = Date.now()
      const codigo = `X${randomId}`

      cy.abrirEntidad('productos')

      // Filtrar por producto recién creado
      cy.get('#filter-search').type(producto.codigo)
      cy.get('#filter-boton').click()
      cy.contains(producto.codigo).should('be.visible')

      // Seleccionar tercer producto para editar
      cy.seleccionarAccionFila(0,1)
      cy.contains('Editar Producto').should('be.visible')
      
      // Rellenar formulario
      cy.get('#codigo').clear().type(codigo)
      cy.get('#nombre').clear().type('Producto Editado CY')
      cy.get('#precio_unitario').clear().type('80000')
      cy.get('#unidad_medida').select('Caja')

      // Seleccionar categoría usando el InfiniteScrollSelect
      cy.get('#infinite-scroll-select-button').click()
      cy.get('#infinite-scroll-option-4').click()

      cy.get('#estado').select('Inactivo')
      cy.get('#descripcion').clear().type('Descripción editada del producto')

      cy.get('#editar-boton').click()

      // Verificar redirección al detalle del usuario actualizado
      cy.url().should('match', /\/productos\/\d+$/)
      cy.contains('Detalle del Producto').should('be.visible')
    })
  })

  it('No debe permitir editar un producto con código ya existente', () => {
    cy.crearProductoParaPruebas().then((producto) => {
        cy.abrirEntidad('productos')

        // Filtrar por producto recién creado
        cy.get('#filter-search').type('P001')
        cy.get('#filter-boton').click()

        // Seleccionar tercer producto para editar
        cy.seleccionarAccionFila(2,1)
        cy.contains('Editar Producto').should('be.visible')

        // Rellenar formulario
        cy.get('#codigo').clear().type(producto.codigo)
        cy.get('#nombre').clear().type('Producto con Código Duplicado')
        cy.get('#precio_unitario').clear().type('80000')
        cy.get('#unidad_medida').select('Paquete')

        // Seleccionar categoría usando el InfiniteScrollSelect
        cy.get('#infinite-scroll-select-button').click()
        cy.get('#infinite-scroll-option-4').click()

        cy.get('#estado').select('Inactivo')
        cy.get('#descripcion').clear().type('Descripción del producto con código duplicado')

        // Guardar producto
        cy.get('#editar-boton').click()

        // Validar mensaje de error por código duplicado
        cy.contains('Error al actualizar').should('be.visible')
        cy.contains('ya existe').should('be.visible')

    })
  })

  // DELETE: RF_12
  it('Debe eliminar un producto sin relaciones activas', () => {

    cy.crearProductoParaPruebas().then((producto) => {
        cy.abrirEntidad('productos')  

        // Filtrar por producto recién creado
        cy.get('#filter-search').type(producto.codigo)
        cy.get('#filter-boton').click()

        // Ejecutar acción de eliminar en la primera fila
        cy.seleccionarAccionFila(0,3)
        cy.get('#delete-boton').click()

        // Verificar eliminación exitosa
        cy.url().should('include', '/productos')
        cy.contains('eliminado exitosamente').should('be.visible')
    })
  })

  it('No debe eliminar un producto con relaciones activas', () => {
    cy.abrirEntidad('productos')
    
    // Filtrar por producto existente
    cy.get('#filter-search').type('P001')
    cy.get('#filter-boton').click()

    // Intentar eliminar el prodcuto filtrado con relaciones
    cy.seleccionarAccionFila(0,3)
    cy.get('#delete-boton').click()

    // Validar mensaje de error por relaciones activas
    cy.url().should('include', '/productos')
    cy.contains('tiene relaciones activas').should('be.visible')
    cy.contains('Se recomienda desactivar').should('be.visible')

  })

  it('Debe desactivar un producto activo', () => {
    cy.crearProductoParaPruebas().then((producto) => {
        cy.abrirEntidad('productos')  

        // Filtrar por producto recién creado
        cy.get('#filter-search').type(producto.codigo)
        cy.get('#filter-boton').click()

        // Opción de desactivar
        cy.seleccionarAccionFila(0,2)

        // Validar desactivación exitosa
        cy.contains('Estado actualizado').should('be.visible')
        cy.contains('ahora está inactivo').should('be.visible')
    })

  })

  // Validación de vistas lista, detalle, creación y edición

  it('Debe navegar correctamente entre vistas de productos', () => {
    cy.abrirEntidad('productos')

    // Navegar a creación
    cy.contains('Nuevo Producto').click()
    cy.contains('Crear Nuevo Producto').should('be.visible')
    cy.url().should('include', '/productos/crear')

    // Volver a lista
    cy.abrirEntidad('productos')

    // Navegar a detalle del primer producto
    cy.seleccionarAccionFila(0,0)
    cy.contains('Detalle del Producto').should('be.visible')
    cy.url().should('match', /\/productos\/\d+$/)

    // Volver a lista
    cy.abrirEntidad('productos')

    // Navegar a edición del primer producto
    cy.seleccionarAccionFila(0,1)
    cy.contains('Editar Producto').should('be.visible')
    cy.url().should('match', /\/productos\/\d+\/editar$/)

  })
})