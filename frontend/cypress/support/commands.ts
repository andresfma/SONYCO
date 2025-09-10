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

Cypress.Commands.add('crearUsuarioParaPruebas', (rolId = 2, estado = true) => {
  const randomId = Date.now()
  const usuarioPrueba = {
    nombre: `Usuario Test ${randomId}`,
    email: `usuario${randomId}@test.com`,
    rol_id: rolId,
    estado: estado,
    contrasena: 'Aa12345678'
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/usuarios/`,
      headers: {
        Authorization: `Bearer ${token}`, // con token admin
      },
      body: usuarioPrueba,
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body // devolver usuario creado
    })
  })
})

// Crear producto para pruebas

Cypress.Commands.add('crearProductoParaPruebas', (categoriaId, estado = true) => {
  const randomId = Date.now()
  const productoPrueba = {
    codigo: 'Y' + randomId,
    nombre: `Producto Test ${randomId}`,
    descripcion: `Descripción del producto test ${randomId}`,
    precio_unitario: 50000.0,
    unidad_medida: 'Unidad',
    categoria_id: categoriaId,
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

Cypress.Commands.add('crearInventarioParaPruebas', (producto_id, estado = true, ) => {
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

// Crear movimiento de inventario para pruebas

Cypress.Commands.add('crearMovimientoParaPruebas', (producto_id, tipo = 'ENTRADA', cantidad = 20) => {
  const inventarioPrueba = {
    tipo: tipo,
    producto_id: producto_id,
    cantidad: cantidad
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/inventarios/movimientos/${tipo.toLowerCase()}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: inventarioPrueba,
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body // devolver movimiento creado
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

// Crear detalle de venta para pruebas

Cypress.Commands.add('crearDetalleVentaParaPruebas', (ventaId, productoId, cantidad = 10) => {
  const detalleVentaPrueba = {
    producto_id: productoId,
    cantidad: cantidad,
    precio_unitario: 50000.0,
  }

  return cy.login().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/detalle_venta/${ventaId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: detalleVentaPrueba,
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body // devolver detalle de venta creado
    })
  })
})

// Seleccionar acción en fila de tabla (0=primera fila, 1=segunda fila, etc; 0=ver, 1=editar, 2=activar/desactivar, 3=eliminar)

Cypress.Commands.add('seleccionarAccionFila', (filaIndex, actionIndex) => {
  return cy.get('table tbody tr')
    .eq(filaIndex)
    .find('td:last-child button')
    .eq(actionIndex).click()
})

// Navegar a una entidad desde el menú lateral y verificar que se cargó correctamente

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

// Exportar reporte de una entidad

Cypress.Commands.add('exportarEntidad', (entidad: string) => {
  // Abrir la entidad en el sistema
  cy.abrirEntidad(entidad)

  // Interceptar petición de exportación
  cy.intercept('GET', `${Cypress.env('apiUrl')}/exportar/**`).as('descargaReporte')

  // Hacer click en el botón Exportar
  cy.contains('Exportar').click()

  // Verificar notificación de éxito
  cy.contains('El archivo se ha descargado correctamente').should('exist')

  // Validar que la respuesta fue correcta
  cy.wait('@descargaReporte').its('response.statusCode').should('eq', 200)
})





