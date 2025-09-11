describe('Gestión de usuarios y roles', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ
  it('Debe listar usuarios y permitir filtrado', () => {
    cy.crearUsuarioParaPruebas(2, false).then((usuario) => { // usuario no-admin con estado inactivo
      cy.abrirEntidad('usuarios')  

      // Filtrar por nombre de usuario recién creado
      cy.get('#filter-search').type(usuario.nombre)
      cy.get('#filter-boton').click()
      cy.contains(usuario.email).should('be.visible')

      // Filtrar por email de usuario recién creado
      cy.typeSafe('#filter-search', usuario.email)
      cy.get('#filter-boton').click()
      cy.contains(usuario.nombre).should('be.visible')

      //Filtrar por estado
      cy.clearSafe('#filter-search')
      cy.get('#filter-select-estado').select('Inactivo')
      cy.get('#filter-boton').click()
      cy.contains(usuario.nombre).should('be.visible')

      // Limpiar filtros y verificar lista completa
      cy.get('#clear-filters-boton').click()
      cy.get('#filter-search').should('have.value', '')
      cy.contains('Mostrando 1-10').should('be.visible')
      })
  })

  // CREATE
  it('Debe crear un nuevo usuario con datos válidos', () => {
    const randomId = Date.now()
    const nombreUsuario = `Usuario Nuevo CY`
    const emailUsuario = `usuario${randomId}@test.com`

    cy.abrirEntidad('usuarios')  

    cy.contains('Nuevo Usuario').click()
    cy.get('#nombre').type(nombreUsuario)
    cy.get('#email').type(emailUsuario)
    cy.get('#rol_id').select('Usuario')
    cy.get('#contrasena').type('Aa12345678')
    cy.get('#confirmar_contrasena').type('Aa12345678')

    cy.get('#crear-boton').click()

    // Verificar redirección al detalle y visibilidad del usuario
    cy.url().should('match', /\/usuarios\/\d+$/)
    cy.contains('Detalle del Usuario').should('be.visible')
  })

  it('No debe crear un usuario con correo ya existente', () => {
    cy.crearUsuarioParaPruebas().then((usuario) => {
      cy.abrirEntidad('usuarios')  
      cy.contains('Nuevo Usuario').click()

      cy.get('#nombre').type('Usuario con correo duplicado')
      cy.get('#email').type(usuario.email)
      cy.get('#rol_id').select('Usuario')
      cy.get('#contrasena').type('Aa12345678')
      cy.get('#confirmar_contrasena').type('Aa12345678')

      cy.get('#crear-boton').click()

      // Validar mensaje de error por correo duplicado
      cy.contains('Error al crear').should('be.visible')
      cy.contains('ya existe').should('be.visible')
    })
  })

  it('No debe crear un nuevo usuario con datos requeridos faltantes', () => {

    cy.abrirEntidad('usuarios')  
    cy.contains('Nuevo Usuario').click()

    // Formulario sin rellenar

    // Guardar usuario
    cy.get('#crear-boton').click()

    // Verificar mensaje de error por datos faltantes
    cy.contains('Nombre es requerido').should('be.visible')
    cy.contains('Email es requerido').should('be.visible')
    cy.contains('Rol es requerido').should('be.visible')
    cy.contains('Contraseña es requerido').should('be.visible')
    cy.contains('Confirmar Contraseña es requerido').should('be.visible')
  })

  // DELETE
  it('Debe eliminar un usuario sin relaciones activas', () => {
    cy.crearUsuarioParaPruebas().then((usuario) => {
        cy.abrirEntidad('usuarios')  

        // Filtrar por usuario recién creado
        cy.get('#filter-search').type(usuario.email)
        cy.get('#filter-boton').click()

        // Ejecutar acción de eliminar en la primera fila
        cy.seleccionarAccionFila(0,3)
        cy.get('#delete-boton').click()

        // Verificar eliminación exitosa
        cy.url().should('include', '/usuarios')
        cy.contains('eliminado exitosamente').should('be.visible')
    })
  })

  it('No debe eliminar un usuario con relaciones activas', () => { // se usa usuario admin
    cy.abrirEntidad('usuarios') 

    // Filtrar por usuario admin
    cy.get('#filter-search').type('Admin')
    cy.get('#filter-boton').click()
    cy.contains('admin@admin.com').should('be.visible')

    // Intentar eliminar el primer usuario con relaciones
    cy.seleccionarAccionFila(0,3)
    cy.get('#delete-boton').click()

    // Validar mensaje de error por relaciones activas
    cy.url().should('include', '/usuarios')
    cy.contains('tiene relaciones activas').should('be.visible')
  })

  it('Debe desactivar un usuario activo', () => {
    cy.crearUsuarioParaPruebas().then((usuario) => {
        cy.abrirEntidad('usuarios')  

        // Filtrar por usuario recién creado
        cy.get('#filter-search').type(usuario.email)
        cy.get('#filter-boton').click()

        // Opción de desactivar
        cy.seleccionarAccionFila(0,2)

        // Validar desactivación exitosa
        cy.contains('Estado actualizado').should('be.visible')
        cy.contains('ahora está inactivo').should('be.visible')
    })

  })

  // EDIT
  it('Debe editar correctamente un usuario existente', () => {
    cy.crearUsuarioParaPruebas().then((usuario) => {
      const randomId = Date.now()
      const nombreUsuario = `Usuario Editado CY`
      const emailUsuario = `usuario${randomId}@test.com`

      cy.abrirEntidad('usuarios') 

      // Filtrar por usuario recién creado
      cy.get('#filter-search').type(usuario.email)
      cy.get('#filter-boton').click()
      cy.contains(usuario.nombre).should('be.visible')

      // Interceptar solicitud GET para sincronización
      cy.intercept('GET', `${Cypress.env('apiUrl')}/usuarios/**`).as('getUsuario')

      // Seleccionar opción editar para el usuario recién creado
      cy.seleccionarAccionFila(0,1)
      cy.contains('Editar Usuario').should('be.visible')

      // Esperar a la respuesta del backend
      cy.wait('@getUsuario')

      // asegurar que el input ya está presente y estable tras el re-render
      cy.get('#nombre', { timeout: 10000 }).should('be.visible')

      // Rellenar formulario
      cy.typeSafe('#nombre', nombreUsuario)
      cy.typeSafe('#email', emailUsuario)
      cy.get('#estado').select('Inactivo')
      cy.get('#rol_id').select('Usuario')
      cy.typeSafe('#contrasena', '12345678aA')
      cy.typeSafe('#confirmar_contrasena', '12345678aA')

      cy.get('#editar-boton').click()

      // Verificar redirección al detalle del usuario actualizado
      cy.url().should('match', /\/usuarios\/\d+$/)
      cy.contains('Detalle del Usuario').should('be.visible')
    })
  })

  it('No debe permitir editar un usuario con correo ya existente', () => {
    cy.crearUsuarioParaPruebas().then((usuario) => {
      cy.crearUsuarioParaPruebas().then((usuario_editar) => { // usuario con correo ya existente
        const nombreUsuario = `Usuario Editado CY`

        cy.abrirEntidad('usuarios')  

        // Filtrar por usuario recién creado
        cy.get('#filter-search').type(usuario.email)
        cy.get('#filter-boton').click()
        cy.contains(usuario.nombre).should('be.visible')

        // Interceptar solicitud GET para sincronización
        cy.intercept('GET', `${Cypress.env('apiUrl')}/usuarios/**`).as('getUsuario')

        // Seleccionar opción editar del usuario recién creado
        cy.seleccionarAccionFila(0,1)
        cy.contains('Editar Usuario').should('be.visible')

        // Esperar a la respuesta del backend
        cy.wait('@getUsuario')

        // asegurar que el input ya está presente y estable tras el re-render
        cy.get('#nombre', { timeout: 10000 }).should('be.visible')

        // Rellenar formulario
        cy.typeSafe('#nombre', nombreUsuario)
        cy.typeSafe('#email', usuario_editar.email) // correo existente
        cy.get('#estado').select('Inactivo')
        cy.get('#rol_id').select('Usuario')
        cy.typeSafe('#contrasena', '12345678aA')
        cy.typeSafe('#confirmar_contrasena', '12345678aA')

        cy.get('#editar-boton').click()

        // Validar mensaje de error por correo duplicado
        cy.contains('Error al actualizar').should('be.visible')
        cy.contains('ya existe').should('be.visible')
      })
    })
  })

  // Validación de vistas lista, detalle, creación y edición

  it('Debe navegar correctamente entre vistas de usuarios', () => {
    cy.crearUsuarioParaPruebas().then((usuario) => {
      cy.abrirEntidad('usuarios')

      // Vista crear
      cy.contains('Nuevo Usuario').click()
      cy.contains('Crear Nuevo Usuario').should('be.visible')
      cy.url().should('include', '/usuarios/crear')

      // Volver a lista
      cy.abrirEntidad('usuarios')

      // Vista detalles
      
      // Filtrar por usuario recién creado
      cy.get('#filter-search').type(usuario.email)
      cy.get('#filter-boton').click()
      cy.contains(usuario.nombre).should('be.visible')

      // Navegar a detalle del primer usuario
      cy.seleccionarAccionFila(0,0)
      cy.contains('Detalle del Usuario').should('be.visible')
      cy.url().should('match', /\/usuarios\/\d+$/)

      // Volver a lista
      cy.abrirEntidad('usuarios')

      // Vista editar

      // Filtrar por usuario recién creado
      cy.get('#filter-search').type(usuario.nombre)
      cy.get('#filter-boton').click()
      cy.contains(usuario.email).should('be.visible')

      // Navegar a edición del usuario recién creado
      cy.seleccionarAccionFila(0,1)
      cy.contains('Editar Usuario').should('be.visible')
      cy.url().should('match', /\/usuarios\/\d+\/editar$/)
    })
  })
})
