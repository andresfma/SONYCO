describe('Gestión de usuarios y roles', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/dashboard')
  })

  // READ
  it.only('Debe listar usuarios y permitir filtrado', () => {
    cy.abrirEntidad('usuarios')  

    // Filtrar por nombre de usuario "Admin"
    cy.get('#filter-search').type('Admin')
    cy.get('#filter-boton').click()
    cy.contains('admin@admin.com').should('be.visible')

    // Filtrar por email de usuario "Admin"
    cy.get('#filter-search').clear().type('admin@admin.com')
    cy.get('#filter-boton').click()
    cy.contains('admin@admin.com').should('be.visible')
    cy.contains('Mostrando 1-1').should('be.visible')

    //Filtrar por estado
    cy.get('#filter-search').clear()
    cy.get('#filter-select-estado').select('Inactivo')
    cy.get('#filter-boton').click()
    cy.contains('Inactivo').should('be.visible')

    // Limpiar filtros y verificar lista completa
    cy.get('#clear-filters-boton').click()
    cy.get('#filter-search').should('have.value', '')
    cy.contains('Mostrando 1-10').should('be.visible')
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
    const nombreUsuario = `Usuario Nuevo CY`

    cy.abrirEntidad('usuarios')  
    cy.contains('Nuevo Usuario').click()

    cy.get('#nombre').type(nombreUsuario)
    cy.get('#email').type('admin@admin.com')
    cy.get('#rol_id').select('Usuario')
    cy.get('#contrasena').type('Aa12345678')
    cy.get('#confirmar_contrasena').type('Aa12345678')

    cy.get('#crear-boton').click()

    // Validar mensaje de error por correo duplicado
    cy.contains('Error al crear').should('be.visible')
    cy.contains('ya existe').should('be.visible')
  })

  it('No debe crear un nuevo usuario con datos requeridos faltantes', () => {

    cy.abrirEntidad('usuarios')  
    cy.contains('Nuevo Usuario').click()

    // Formulario sin rellenar

    // Guardar producto
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
        cy.get('#filter-search').type(usuario.nombre)
        cy.get('#filter-boton').click()

        // Ejecutar acción de eliminar en la primera fila
        cy.seleccionarAccionFila(0,3)
        cy.get('#delete-boton').click()

        // Verificar eliminación exitosa
        cy.url().should('include', '/usuarios')
        cy.contains('eliminado exitosamente').should('be.visible')
    })
  })

  it('No debe eliminar un usuario con relaciones activas', () => {
    cy.abrirEntidad('usuarios')  

    // Intentar eliminar el primer usuario con relaciones
    cy.seleccionarAccionFila(0,3)
    cy.get('#delete-boton').click()

    // Validar mensaje de error por relaciones activas
    cy.url().should('include', '/usuarios')
    cy.contains('tiene relaciones activas').should('be.visible')
  })

  // EDIT
  it('Debe editar correctamente un usuario existente', () => {
    const randomId = Date.now()
    const nombreUsuario = `Usuario Editado CY`
    const emailUsuario = `usuario${randomId}@test.com`

    cy.abrirEntidad('usuarios')  

    // Seleccionar tercer usuario para editar
    cy.seleccionarAccionFila(2,1)

    cy.contains('Editar Usuario').should('be.visible')
    cy.get('#nombre').clear().type(nombreUsuario)
    cy.get('#email').clear().type(emailUsuario)
    cy.get('#estado').select('Inactivo')
    cy.get('#rol_id').select('Admin')
    cy.get('#contrasena').clear().type('12345678aA')
    cy.get('#confirmar_contrasena').clear().type('12345678aA')

    cy.get('#editar-boton').click()

    // Verificar redirección al detalle del usuario actualizado
    cy.url().should('match', /\/usuarios\/\d+$/)
    cy.contains('Detalle del Usuario').should('be.visible')
  })

  it('No debe permitir editar un usuario con correo ya existente', () => {
    const nombreUsuario = `Usuario Editado CY`
    const emailUsuario = `admin@admin.com`

    cy.abrirEntidad('usuarios')  

    // Seleccionar tercer usuario para editar
    cy.seleccionarAccionFila(2,1)

    cy.get('#nombre').clear().type(nombreUsuario)
    cy.get('#email').clear().type(emailUsuario)
    cy.get('#estado').select('Inactivo')
    cy.get('#rol_id').select('Admin')
    cy.get('#contrasena').clear().type('12345678aA')
    cy.get('#confirmar_contrasena').clear().type('12345678aA')

    cy.get('#editar-boton').click()

    // Validar mensaje de error por correo duplicado
    cy.contains('Error al actualizar').should('be.visible')
    cy.contains('ya existe').should('be.visible')
  })
})
