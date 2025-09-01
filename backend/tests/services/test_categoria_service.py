import pytest
from fastapi import HTTPException
from sqlmodel import Session

from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate
from app.services.categoria_service import (
    get_categoria_by_id,
    create_categoria,
    update_categoria,
    delete_categoria,
    get_categorias,
    change_estado_categoria,
    get_categorias_infinito,
)


def test_get_categoria_by_id(session: Session, categoria_fixture: Categoria):
    categoria = get_categoria_by_id(session, categoria_fixture.id)
    assert categoria is not None
    assert categoria.nombre == "Herramientas"


def test_get_categoria_by_id_not_found(session: Session):
    categoria = get_categoria_by_id(session, 999)
    assert categoria is None


def test_create_categoria_ok(session: Session):
    data = CategoriaCreate(nombre="Construcción", descripcion="Materiales")
    categoria = create_categoria(session, data)
    assert categoria.id is not None
    assert categoria.nombre == "Construcción"


def test_create_categoria_duplicate(session: Session, categoria_fixture: Categoria):
    data = CategoriaCreate(nombre="Herramientas")
    with pytest.raises(HTTPException) as exc:
        create_categoria(session, data)
    assert exc.value.status_code == 400


def test_update_categoria_ok(session: Session, categoria_fixture: Categoria):
    data = CategoriaUpdate(nombre="Herramientas manuales")
    updated = update_categoria(session, categoria_fixture.id, data)
    assert updated.nombre == "Herramientas manuales"


def test_update_categoria_not_found(session: Session):
    data = CategoriaUpdate(nombre="Nueva")
    with pytest.raises(HTTPException) as exc:
        update_categoria(session, 999, data)
    assert exc.value.status_code == 404


def test_delete_categoria_ok(session: Session, categoria_fixture: Categoria):
    result = delete_categoria(session, categoria_fixture.id)
    assert result is True


def test_delete_categoria_not_found(session: Session):
    with pytest.raises(HTTPException) as exc:
        delete_categoria(session, 999)
    assert exc.value.status_code == 404


def test_get_categorias(session: Session, categorias_fixture):
    response = get_categorias(session, page=1, page_size=10)

    assert response.total == 3
    assert len(response.items) == 3
    assert any(c.nombre == "Materiales" for c in response.items)


def test_change_estado_categoria(session: Session, categoria_fixture: Categoria):
    updated = change_estado_categoria(session, categoria_fixture.id)
    assert updated.estado is False


def test_change_estado_categoria_not_found(session: Session):
    with pytest.raises(HTTPException):
        change_estado_categoria(session, 999)


def test_get_categorias_infinito(session: Session, categorias_fixture):
    items = get_categorias_infinito(session, skip=0, limit=10)
    assert len(items) >= 3
    assert items[0].nombre in ["Herramientas", "Materiales", "EPP"]
