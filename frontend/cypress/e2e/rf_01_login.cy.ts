describe('Login', () => {
  it('Permite al usuario iniciar sesión', () => {
    cy.visit('/login')

    // interactúa con el formulario
    cy.get('#email').type('admin@admin.com')
    cy.get('#password').type('admin')
    cy.contains('Siguiente').click()

    // validaciones de que el backend respondió bien
    cy.url().should('include', '/dashboard')
    cy.contains('Bienvenido')
  })


  it('Muestra error con credenciales inválidas', () => {
    cy.visit('/login')
    cy.get('#email').type('incorrecto@incorrecto.com')
    cy.get('#password').type('incorrecta')
    cy.contains('Siguiente').click()

    // Validación del mensaje de error
    cy.contains('Credenciales incorrectas').should('be.visible')
  })


  it('No permite login con campos vacíos', () => {
    cy.visit('/login')
    cy.contains('Siguiente').click()

    // Validación de mensajes de error de validación
    cy.get('#email:invalid').should('exist')
    cy.get('#password:invalid').should('exist')
  })


  it('No permite login de usuarios inactivos', () => {
    cy.visit('/login')
    cy.get('#email').type('inactivo@inactivo.com')
    cy.get('#password').type('inactivo')
    cy.contains('Siguiente').click()

    // Validación del mensaje de usuario inactivo
    cy.contains('contacte al administrador').should('be.visible')
  })
})
