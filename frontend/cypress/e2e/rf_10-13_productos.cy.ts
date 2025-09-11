describe('Gestión de Productos', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ: RF_13
  it('Debe listar productos y permitir filtrado', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
      cy.crearProductoParaPruebas(categoria.id, false).then((producto) => {
          cy.abrirEntidad('productos')  

          // Filtrar por nombre producto recién creado
          cy.get('#filter-search').type(producto.nombre)
          cy.get('#filter-boton').click()
          cy.contains(producto.codigo).should('be.visible')

          // Filtrar por código producto recién creado
          cy.typeSafe('#filter-search', producto.codigo)
          cy.get('#filter-boton').click()
          cy.contains(producto.nombre).should('be.visible')

          //Filtrar por categoría
          cy.clearSafe('#filter-search')
          cy.get('#filter-categoria').type(producto.categoria.nombre)
          cy.get('#filter-boton').click()
          cy.contains(producto.categoria.nombre).should('be.visible')

          //Filtrar por estado
          cy.clearSafe('#filter-categoria')
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
  })

  // CREATE: RF_10
  it('Debe crear un nuevo producto con datos válidos', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
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
      cy.get('#infinite-scroll-search-input').type(categoria.nombre)
      cy.get(`#infinite-scroll-option-${categoria.id}`).click()
      
      cy.get('#estado').select('Activo')
      cy.get('#descripcion').type(descripcion)

      // Guardar producto
      cy.get('#crear-boton').click()

      // Verificar redirección al detalle y visibilidad del usuario
      cy.url().should('match', /\/productos\/\d+$/)
      cy.contains('Detalle del Producto').should('be.visible')
    })
  })

  it('No debe crear un producto con código ya existente', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
      cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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
          cy.get('#infinite-scroll-search-input').type(categoria.nombre)
          cy.get(`#infinite-scroll-option-${categoria.id}`).click()

          cy.get('#estado').select('Activo')
          cy.get('#descripcion').type('Descripción del otro producto')

          // Guardar producto
          cy.get('#crear-boton').click()

          // Validar mensaje de error por código duplicado
          cy.contains('Error al crear').should('be.visible')
          cy.contains('ya existe').should('be.visible')
      })
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
    cy.crearCategoriaParaPruebas().then((categoria) => {
      cy.crearProductoParaPruebas(categoria.id).then((producto) => {
        const randomId = Date.now()
        const codigo = `X${randomId}`

        cy.abrirEntidad('productos')

        // Filtrar por producto recién creado
        cy.get('#filter-search').type(producto.codigo)
        cy.get('#filter-boton').click()
        cy.contains(producto.nombre).should('be.visible')

        // Interceptar solicitud GET para sincronización
        cy.intercept('GET', `${Cypress.env('apiUrl')}/productos/**`).as('getProducto')

        // Seleccionar tercer producto para editar
        cy.seleccionarAccionFila(0,1)
        cy.contains('Editar Producto').should('be.visible')

        // Esperar a la respuesta del backend
        cy.wait('@getProducto')

        // asegurar que el input ya está presente y estable tras el re-render
        cy.get('#codigo', { timeout: 10000 }).should('be.visible')
        
        // Rellenar formulario
        cy.typeSafe('#codigo', codigo)
        cy.typeSafe('#nombre', 'Producto Editado CY')
        cy.typeSafe('#precio_unitario', '80000')
        cy.get('#unidad_medida').select('Caja')

        // Seleccionar categoría usando el InfiniteScrollSelect
        cy.get('#infinite-scroll-select-button').click()
        cy.get('#infinite-scroll-search-input').type(categoria.nombre)
        cy.get(`#infinite-scroll-option-${categoria.id}`).click()

        cy.get('#estado').select('Inactivo')
        cy.typeSafe('#descripcion', 'Descripción editada del producto')

        cy.get('#editar-boton').click()

        // Verificar redirección al detalle del usuario actualizado
        cy.url().should('match', /\/productos\/\d+$/)
        cy.contains('Detalle del Producto').should('be.visible')
      })
    })
  })

  it('No debe permitir editar un producto con código ya existente', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
      cy.crearProductoParaPruebas(categoria.id).then((producto) => {
        cy.crearProductoParaPruebas(categoria.id).then((producto_editar) => { // producto con codigo ya existente
          cy.abrirEntidad('productos')

          // Filtrar por producto recién creado
          cy.get('#filter-search').type(producto.codigo)
          cy.get('#filter-boton').click()

          // Interceptar solicitud GET para sincronización
          cy.intercept('GET', `${Cypress.env('apiUrl')}/productos/**`).as('getProducto')

          // Seleccionar tercer producto para editar
          cy.seleccionarAccionFila(0,1)
          cy.contains('Editar Producto').should('be.visible')

          // Esperar a la respuesta del backend
          cy.wait('@getProducto')

          // asegurar que el input ya está presente y estable tras el re-render
          cy.get('#codigo', { timeout: 10000 }).should('be.visible')

          // Rellenar formulario
          cy.typeSafe('#codigo', producto_editar.codigo) // codigo existente
          cy.typeSafe('#nombre', 'Producto con Código Duplicado')
          cy.typeSafe('#precio_unitario', '80000')
          cy.get('#unidad_medida').select('Paquete')

          // Seleccionar categoría usando el InfiniteScrollSelect
          cy.get('#infinite-scroll-select-button').click()
          cy.get('#infinite-scroll-search-input').type(categoria.nombre)
          cy.get(`#infinite-scroll-option-${categoria.id}`).click()

          cy.get('#estado').select('Inactivo')
          cy.typeSafe('#descripcion', 'Descripción del producto con código duplicado')

          // Guardar producto
          cy.get('#editar-boton').click()

          // Validar mensaje de error por código duplicado
          cy.contains('Error al actualizar').should('be.visible')
          cy.contains('ya existe').should('be.visible')
        })
      })
    })

  })

  // DELETE: RF_12
  it('Debe eliminar un producto sin relaciones activas', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
      cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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
  })

  it('No debe eliminar un producto con relaciones activas', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
      cy.crearProductoParaPruebas(categoria.id).then((producto) => {
        cy.crearInventarioParaPruebas(producto.id).then((inventario) => {
          cy.abrirEntidad('productos')
    
          // Filtrar por producto existente
          cy.get('#filter-search').type(producto.codigo)
          cy.get('#filter-boton').click()

          // Intentar eliminar el prodcuto filtrado con relaciones
          cy.seleccionarAccionFila(0,3)
          cy.get('#delete-boton').click()

          // Validar mensaje de error por relaciones activas
          cy.url().should('include', '/productos')
          cy.contains('tiene relaciones activas').should('be.visible')
          cy.contains('Se recomienda desactivar').should('be.visible')
        })
      })
    })
  })

  it('Debe desactivar un producto activo', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
      cy.crearProductoParaPruebas(categoria.id).then((producto) => {
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
  })

  // Validación de vistas lista, detalle, creación y edición

  it('Debe navegar correctamente entre vistas de productos', () => {
    cy.crearCategoriaParaPruebas().then((categoria) => {
      cy.crearProductoParaPruebas(categoria.id).then((producto) => {
        cy.abrirEntidad('productos')

        // Navegar a creación
        cy.contains('Nuevo Producto').click()
        cy.contains('Crear Nuevo Producto').should('be.visible')
        cy.url().should('include', '/productos/crear')

        // Volver a lista
        cy.abrirEntidad('productos')

        // Filtrar por producto recién creado
        cy.get('#filter-search').type(producto.codigo)
        cy.get('#filter-boton').click()

        // Vista detalle

        cy.seleccionarAccionFila(0,0)
        cy.contains('Detalle del Producto').should('be.visible')
        cy.url().should('match', /\/productos\/\d+$/)

        // Volver a lista
        cy.abrirEntidad('productos')

        // Filtrar por producto recién creado
        cy.get('#filter-search').type(producto.codigo)
        cy.get('#filter-boton').click()

        // Vista Editar

        // Navegar a edición del primer producto
        cy.seleccionarAccionFila(0,1)
        cy.contains('Editar Producto').should('be.visible')
        cy.url().should('match', /\/productos\/\d+\/editar$/)
      })
    })
  })
})