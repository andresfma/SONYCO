describe('Gestión de Clientes', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ: RF_17
  it('Debe listar clientes y permitir filtrado', () => {
    cy.crearClienteParaPruebas(false).then((cliente) => {
        cy.abrirEntidad('clientes')  

        // Filtrar por nombre cliente recién creado
        cy.get('#filter-search').type(cliente.nombre)
        cy.get('#filter-boton').click()
        cy.contains(cliente.identificacion).should('be.visible')

        // Filtrar por email del cliente recién creado
        cy.get('#filter-search').clear().type(cliente.email)
        cy.get('#filter-boton').click()
        cy.contains(cliente.identificacion).should('be.visible')

        // Filtrar por identificación del cliente recién creado
        cy.get('#filter-search').clear().type(cliente.identificacion)
        cy.get('#filter-boton').click()
        cy.contains(cliente.email).should('be.visible')

        //Filtrar por tipo de persona
        cy.get('#filter-search').clear()
        cy.get('#filter-select-tipo_persona').select('Natural')
        cy.get('#filter-boton').click()
        cy.get('table tbody tr').eq(0).find('td').eq(3).should('contain.text', 'Natural')

        // Filtrar por estado
        cy.get('#filter-select-tipo_persona').select('Todos')
        cy.get('#filter-select-estado').select('Inactivo')
        cy.get('#filter-boton').click()
        cy.contains(cliente.nombre).should('be.visible')

        // Limpiar filtros y verificar lista completa
        cy.get('#clear-filters-boton').click()
        cy.get('#filter-search').should('have.value', '')
        cy.get('#filter-select-tipo_persona').should('have.value', '')
        cy.contains('Mostrando 1-10').should('be.visible')
    })
    
  })

  // CREATE: RF_14
  it('Debe crear un nuevo cliente con datos válidos', () => {

    const randomId = Date.now()
    const identificacion = `Z-${randomId}`
    const nombre = `Cliente Test CY`
    const email = `cliente${randomId}@test.com`

    cy.abrirEntidad('clientes')  
    cy.contains('Nuevo Cliente').click()

    // Rellenar formulario
    cy.get('#nombre').type(nombre)
    cy.get('#email').type(email)
    cy.get('#telefono').type('1234567890')
    cy.get('#direccion').type('Calle Falsa 123')
    cy.get('#tipo_persona').select('Natural')
    cy.get('#estado').select('Activo')
    cy.get('#identificacion').type(identificacion)
    
    // Guardar cliente
    cy.get('#crear-boton').click()

    // Verificar redirección al detalle y visibilidad del usuario
    cy.url().should('match', /\/clientes\/\d+$/)
    cy.contains('Detalle del Cliente').should('be.visible')
  })

  it('No debe crear un cliente con email ya existente', () => {
    cy.crearClienteParaPruebas().then((cliente) => {
        const randomId = Date.now()
        const identificacion = `Z-${randomId}`

        cy.abrirEntidad('clientes')  

        // Acceder a vista de creación
        cy.contains('Nuevo Cliente').click()

        // Rellenar formulario
        cy.get('#nombre').type('Otro Cliente')
        cy.get('#email').type(cliente.email)
        cy.get('#telefono').type('0987654321')
        cy.get('#direccion').type('Calle Falsa 123')
        cy.get('#tipo_persona').select('Jurídica')
        cy.get('#estado').select('Activo')
        cy.get('#identificacion').type(identificacion)

        // Guardar cliente
        cy.get('#crear-boton').click()

        // Validar mensaje de error por código duplicado
        cy.contains('Error al crear').should('be.visible')
        cy.contains('ya existe').should('be.visible')

    })
  })

  it('No debe crear un cliente con identificación ya existente', () => {
    cy.crearClienteParaPruebas().then((cliente) => {
        const randomId = Date.now()
        const email = `cliente${randomId}@test.com`

        cy.abrirEntidad('clientes')  

        // Acceder a vista de creación
        cy.contains('Nuevo Cliente').click()

        // Rellenar formulario
        cy.get('#nombre').type('Otro Cliente')
        cy.get('#email').type(email)
        cy.get('#telefono').type('0987654321')
        cy.get('#direccion').type('Calle Falsa 123')
        cy.get('#tipo_persona').select('Jurídica')
        cy.get('#estado').select('Activo')
        cy.get('#identificacion').type(cliente.identificacion)

        // Guardar cliente
        cy.get('#crear-boton').click()

        // Validar mensaje de error por código duplicado
        cy.contains('Error al crear').should('be.visible')
        cy.contains('ya existe').should('be.visible')

    })
  })

  it('No debe crear un nuevo cliente con datos requeridos faltantes', () => {

    cy.abrirEntidad('clientes')  
    cy.contains('Nuevo Cliente').click()

    // Formulario sin rellenar

    // Guardar cliente
    cy.get('#crear-boton').click()

    // Verificar mensaje de error por datos faltantes
    cy.contains('Nombre es requerido').should('be.visible')
    cy.contains('Email es requerido').should('be.visible')
    cy.contains('Teléfono es requerido').should('be.visible')
    cy.contains('Tipo de persona es requerido').should('be.visible')
    cy.contains('Identificación es requerido').should('be.visible')
  })

  // EDIT: RF_15
  it('Debe editar correctamente un cliente existente', () => {
    const randomId = Date.now()
    const email = `cliente${randomId}@test.com`
    const identificacion = `E-${randomId}`

    cy.abrirEntidad('clientes')

    // Seleccionar tercer cliente para editar
    cy.seleccionarAccionFila(2,1)
    cy.contains('Editar Cliente').should('be.visible')
    
    // Rellenar formulario
    cy.get('#nombre').clear().type('Cliente Editado CY')
    cy.get('#email').clear().type(email)
    cy.get('#telefono').clear().type('1122334455')
    cy.get('#direccion').clear().type('Avenida 123')
    cy.get('#tipo_persona').select('Jurídica')
    cy.get('#estado').select('Activo')
    cy.get('#identificacion').clear().type(identificacion)

    cy.get('#editar-boton').click()

    // Verificar redirección al detalle del usuario actualizado
    cy.url().should('match', /\/clientes\/\d+$/)
    cy.contains('Detalle del Cliente').should('be.visible')
  })

  it('No debe permitir editar un cliente con email ya existente', () => {
    cy.crearClienteParaPruebas().then((cliente) => {
        const randomId = Date.now()
        const identificacion = `E-${randomId}`
        cy.abrirEntidad('clientes')

        // Seleccionar tercer cliente para editar
        cy.seleccionarAccionFila(2,1)
        cy.contains('Editar Cliente').should('be.visible')

        // Rellenar formulario
        cy.get('#nombre').clear().type('Cliente Editado CY')
        cy.get('#email').clear().type(cliente.email) // Email duplicado
        cy.get('#telefono').clear().type('1122334455')
        cy.get('#direccion').clear().type('Avenida 123')
        cy.get('#tipo_persona').select('Jurídica')
        cy.get('#estado').select('Activo')
        cy.get('#identificacion').clear().type(identificacion)

        // Guardar cliente
        cy.get('#editar-boton').click()

        // Validar mensaje de error por código duplicado
        cy.contains('Error al actualizar').should('be.visible')
        cy.contains('Ya existe').should('be.visible')

    })
  })

  it('No debe permitir editar un cliente con identificación ya existente', () => {
    cy.crearClienteParaPruebas().then((cliente) => {
        const randomId = Date.now()
        const email = `cliente${randomId}@test.com`
        cy.abrirEntidad('clientes')

        // Seleccionar tercer cliente para editar
        cy.seleccionarAccionFila(2,1)
        cy.contains('Editar Cliente').should('be.visible')

        // Rellenar formulario
        cy.get('#nombre').clear().type('Cliente Editado CY')
        cy.get('#email').clear().type(email)
        cy.get('#telefono').clear().type('1122334455')
        cy.get('#direccion').clear().type('Avenida 123')
        cy.get('#tipo_persona').select('Jurídica')
        cy.get('#estado').select('Activo')
        cy.get('#identificacion').clear().type(cliente.identificacion) // Identificación duplicada

        // Guardar cliente
        cy.get('#editar-boton').click()

        // Validar mensaje de error por código duplicado
        cy.contains('Error al actualizar').should('be.visible')
        cy.contains('Ya existe').should('be.visible')

    })
  })

  // DELETE: RF_16
  it('Debe eliminar un cliente sin relaciones activas', () => {

    cy.crearClienteParaPruebas().then((cliente) => {
        cy.abrirEntidad('clientes')  

        // Filtrar por cliente recién creado
        cy.get('#filter-search').type(cliente.identificacion)
        cy.get('#filter-boton').click()

        // Ejecutar acción de eliminar en la primera fila
        cy.seleccionarAccionFila(0,3)
        cy.get('#delete-boton').click()

        // Verificar eliminación exitosa
        cy.url().should('include', '/clientes')
        cy.contains('eliminado exitosamente').should('be.visible')
    })
  })

  it('No debe eliminar un cliente con relaciones activas', () => {
    cy.crearClienteParaPruebas().then((cliente) => {
        cy.crearVentaParaPruebas(cliente.id).then(() => {
        cy.abrirEntidad('clientes')

        // Filtrar por cliente recién creado
        cy.get('#filter-search').type(cliente.identificacion)
        cy.get('#filter-boton').click()

        // Intentar eliminar el cliente con relaciones
        cy.seleccionarAccionFila(0, 3)
        cy.get('#delete-boton').click()

        // Validar mensaje de error por relaciones activas
        cy.url().should('include', '/clientes')
        cy.contains('tiene relaciones activas').should('be.visible')
        cy.contains('Se recomienda desactivar').should('be.visible')
    })
  })
  })

  it('Debe desactivar un cliente activo', () => {
    cy.crearClienteParaPruebas().then((cliente) => {
        cy.abrirEntidad('clientes')  

        // Filtrar por cliente recién creado
        cy.get('#filter-search').type(cliente.identificacion)
        cy.get('#filter-boton').click()

        // Opción de desactivar
        cy.seleccionarAccionFila(0,2)

        // Validar desactivación exitosa
        cy.contains('Estado actualizado').should('be.visible')
        cy.contains('ahora está inactivo').should('be.visible')
    })

  })

  // Validación de vistas lista, detalle, creación y edición

  it('Debe navegar correctamente entre vistas de clientes', () => {
    cy.abrirEntidad('clientes')

    // Navegar a creación
    cy.contains('Nuevo Cliente').click()
    cy.contains('Crear Nuevo Cliente').should('be.visible')
    cy.url().should('include', '/clientes/crear')

    // Volver a lista
    cy.abrirEntidad('clientes')

    // Navegar a detalle del primer cliente
    cy.seleccionarAccionFila(0,0)
    cy.contains('Detalle del Cliente').should('be.visible')
    cy.url().should('match', /\/clientes\/\d+$/)

    // Volver a lista
    cy.abrirEntidad('clientes')

    // Navegar a edición del primer cliente
    cy.seleccionarAccionFila(0,1)
    cy.contains('Editar Cliente').should('be.visible')
    cy.url().should('match', /\/clientes\/\d+\/editar$/)

  })
})