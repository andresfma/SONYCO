describe('My First Test', () => {
  it('Gets, types and asserts', () => {
    cy.visit('http://localhost:5173/login')

    // cy.contains('type').click()

    // // Should be on a new URL wich includes '/commands/actions"
    // cy.url().should('include', '/commands/actions')

    // // Get an input, type into it
    // cy.get('.action-email').type('fake@email.com')

    // // Verify that the value has been updated
    // cy.get('.action-email').should('have.value', 'fake@email.com')

  })
})