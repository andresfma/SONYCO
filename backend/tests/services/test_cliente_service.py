import pytest
from sqlmodel import Session
from fastapi import HTTPException
from app.services.cliente_service import (
    get_clientes,
    get_cliente_by_id,
    create_cliente,
    update_cliente,
    delete_cliente,
    change_estado_cliente,
    get_clientes_infinito,
)
from app.schemas.cliente import ClienteCreate, ClienteUpdate
from app.models.cliente import Cliente, TipoPersona


def test_create_cliente(session: Session):
    data = ClienteCreate(
        nombre="Nuevo Cliente",
        email="nuevo@example.com",
        telefono="123123123",
        direccion="Calle Nueva 99",
        tipo_persona="natural",
        identificacion="C99999",
    )

    cliente = create_cliente(session, data)

    assert cliente.id is not None
    assert cliente.email == "nuevo@example.com"


def test_create_cliente_duplicate_email(session: Session, cliente_fixture):
    data = ClienteCreate(
        nombre="Otro",
        email=cliente_fixture.email,  # mismo email
        telefono="000",
        direccion="",
        tipo_persona="natural",
        identificacion="Otro123",
    )

    with pytest.raises(HTTPException) as exc:
        create_cliente(session, data)

    assert exc.value.status_code == 409


def test_get_clientes(session: Session, clientes_fixture):
    response = get_clientes(session, page=1, page_size=10)
    assert response.total == 2
    assert len(response.items) == 2
    assert any(c.nombre == "Juan Pérez" for c in response.items)


def test_update_cliente(session: Session, cliente_fixture):
    update_data = ClienteUpdate(nombre="Nombre Actualizado")
    cliente = update_cliente(session, cliente_fixture.id, update_data)
    assert cliente.nombre == "Nombre Actualizado"


def test_delete_cliente(session: Session, cliente_fixture):
    result = delete_cliente(session, cliente_fixture.id)
    assert result is True
    assert get_cliente_by_id(session, cliente_fixture.id) is None


def test_change_estado_cliente(session: Session, cliente_fixture):
    cliente = change_estado_cliente(session, cliente_fixture.id)
    assert cliente.estado is False  # se invierte el valor


def test_get_clientes_infinito(session: Session, clientes_fixture):
    clientes = get_clientes_infinito(session, skip=0, limit=10)
    assert len(clientes) >= 2
    assert clientes[0].nombre in ["Empresa XYZ", "Juan Pérez"]
