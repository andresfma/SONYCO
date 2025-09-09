/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Login
Cypress.Commands.add('login', () => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, {
    email: 'admin@admin.com',
    password: 'admin', // usa un usuario de pruebas
  }).then((resp) => {
    const token = resp.body.access_token
    window.localStorage.setItem('token', token)
    return token
  })
})

// Crear usuario para pruebas

Cypress.Commands.add('crearUsuarioParaPruebas', () => {
  const randomId = Date.now()
  const usuarioPrueba = {
    nombre: `Usuario Test ${randomId}`,
    email: `usuario${randomId}@test.com`,
    rol_id: 2,
    estado: true,
    contrasena: 'Aa12345678'
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/usuarios/`,
      headers: {
        Authorization: `Bearer ${token}`, // ahora con token admin
      },
      body: usuarioPrueba,
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body // devolver usuario creado
    })
  })
})

// Crear producto para pruebas

Cypress.Commands.add('crearProductoParaPruebas', (estado = true, categoria_id=1) => {
  const randomId = Date.now()
  const productoPrueba = {
    codigo: 'Y' + randomId,
    nombre: `Producto Test ${randomId}`,
    descripcion: `Descripción del producto test ${randomId}`,
    precio_unitario: 50000.0,
    unidad_medida: 'Unidad',
    categoria_id: categoria_id,
    estado: estado
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/productos/`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productoPrueba,
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body // devolver producto creado
    })
  })
})

// Crear inventario para pruebas

Cypress.Commands.add('crearInventarioParaPruebas', (estado = true, producto_id) => {
  const randomId = Date.now()
  const inventarioPrueba = {
    producto_id: producto_id,
    cantidad: 100,
    cantidad_minima: 10,
    estado: estado
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/inventarios/`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: inventarioPrueba,
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body // devolver inventario creado
    })
  })
})


// Crear cliente para pruebas

Cypress.Commands.add('crearClienteParaPruebas', (estado = true) => {
  const randomId = Date.now()
  const clientePrueba = {
    nombre: `Cliente Test ${randomId}`,
    email: `cliente${randomId}@test.com`,
    telefono: '1234567890',
    direccion: 'Calle Falsa 123',
    tipo_persona: 'natural',
    identificacion: randomId.toString(),
    estado: estado
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/clientes/`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: clientePrueba,
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body // devolver cliente creado
    })
  })
})

// Crear categoría para pruebas

Cypress.Commands.add('crearCategoriaParaPruebas', (estado = true) => {
  const randomId = Date.now()
  const categoriaPrueba = {
    nombre: `Categoría test ${randomId}`,
    descripcion: `Descripción de la categoría test`,
    estado: estado
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/categorias/`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: categoriaPrueba,
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body // devolver cliente creado
    })
  })
})

// Crear venta para pruebas

Cypress.Commands.add('crearVentaParaPruebas', (clienteId, estado = true) => {
  const ventaPrueba = {
    cliente_id: clienteId,
    estado: estado
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/ventas/`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: ventaPrueba,
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body // devolver venta creada
    })
  })
})


Cypress.Commands.add('seleccionarAccionFila', (filaIndex, actionIndex) => {
  return cy.get('table tbody tr')
    .eq(filaIndex)
    .find('td:last-child button')
    .eq(actionIndex).click()
})


Cypress.Commands.add('abrirEntidad', (entidad) => {
  cy.get(`[href="/${entidad}"]`).click()
  cy.url().should('include', `/${entidad}`)

  let textoEsperado
  if (entidad === 'categorias') {
    textoEsperado = 'Lista de Categorías'
  } else {
    textoEsperado = `Lista de ${entidad.charAt(0).toUpperCase() + entidad.slice(1)}`
  }

  cy.contains(textoEsperado).should('be.visible')
})





