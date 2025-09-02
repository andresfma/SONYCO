import pytest
from sqlmodel import Session
from fastapi import HTTPException
from typing import Optional

from app.models.categoria import Categoria
from app.models.producto import Producto, UnidadMedida
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate
from app.services.categoria_service import (
    get_categoria_by_id,
    create_categoria,
    update_categoria,
    delete_categoria,
    get_categorias,
    change_estado_categoria,
    get_categorias_infinito
)


class TestGetCategoriaById:
    """Tests para la función get_categoria_by_id."""
    
    def test_get_categoria_by_id_existente(self, session: Session, categoria_fixture):
        """Debe devolver la categoría cuando existe."""
        result = get_categoria_by_id(session, categoria_fixture.id)
        
        assert result is not None
        assert result.id == categoria_fixture.id
        assert result.nombre == "Herramientas"
        assert result.descripcion == "Para el hogar"
    
    def test_get_categoria_by_id_no_existente(self, session: Session):
        """Debe devolver None cuando la categoría no existe."""
        result = get_categoria_by_id(session, 99999)
        
        assert result is None


class TestCreateCategoria:
    """Tests para la función create_categoria."""
    
    def test_create_categoria_exitosa(self, session: Session):
        """Debe crear una categoría correctamente."""
        categoria_data = CategoriaCreate(
            nombre="Electrónicos",
            descripcion="Productos electrónicos",
            estado=True
        )
        
        result = create_categoria(session, categoria_data)
        
        assert result.id is not None
        assert result.nombre == "Electrónicos"
        assert result.descripcion == "Productos electrónicos"
        assert result.estado == True
        
        # Verificar que se guardó en la base de datos
        categoria_db = session.get(Categoria, result.id)
        assert categoria_db is not None
        assert categoria_db.nombre == "Electrónicos"
    
    def test_create_categoria_sin_descripcion(self, session: Session):
        """Debe crear una categoría sin descripción."""
        categoria_data = CategoriaCreate(nombre="Sin Descripción")
        
        result = create_categoria(session, categoria_data)
        
        assert result.nombre == "Sin Descripción"
        assert result.descripcion is None
        assert result.estado == True
    
    def test_create_categoria_nombre_duplicado(self, session: Session, categoria_fixture):
        """Debe lanzar excepción cuando el nombre ya existe."""
        categoria_data = CategoriaCreate(
            nombre="Herramientas",  # Nombre que ya existe
            descripcion="Otra descripción"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            create_categoria(session, categoria_data)
        
        assert exc_info.value.status_code == 400
        assert "Ya existe una categoría" in exc_info.value.detail
        assert "Herramientas" in exc_info.value.detail
    
    def test_create_categoria_nombre_case_sensitive(self, session: Session, categoria_fixture):
        """Debe permitir nombres con diferente capitalización."""
        categoria_data = CategoriaCreate(nombre="HERRAMIENTAS")
        
        result = create_categoria(session, categoria_data)
        assert result.nombre == "HERRAMIENTAS"


class TestUpdateCategoria:
    """Tests para la función update_categoria."""
    
    def test_update_categoria_exitosa(self, session: Session, categoria_fixture):
        """Debe actualizar una categoría correctamente."""
        update_data = CategoriaUpdate(
            nombre="Herramientas Modificado",
            descripcion="Descripción actualizada"
        )
        
        result = update_categoria(session, categoria_fixture.id, update_data)
        
        assert result.nombre == "Herramientas Modificado"
        assert result.descripcion == "Descripción actualizada"
        assert result.id == categoria_fixture.id
    
    def test_update_categoria_solo_nombre(self, session: Session, categoria_fixture):
        """Debe actualizar solo el nombre cuando se proporciona."""
        update_data = CategoriaUpdate(nombre="Solo Nombre")
        
        result = update_categoria(session, categoria_fixture.id, update_data)
        
        assert result.nombre == "Solo Nombre"
        assert result.descripcion == "Para el hogar"  # No debe cambiar
    
    def test_update_categoria_solo_descripcion(self, session: Session, categoria_fixture):
        """Debe actualizar solo la descripción cuando se proporciona."""
        update_data = CategoriaUpdate(descripcion="Nueva descripción")
        
        result = update_categoria(session, categoria_fixture.id, update_data)
        
        assert result.nombre == "Herramientas"  # No debe cambiar
        assert result.descripcion == "Nueva descripción"
    
    def test_update_categoria_cambiar_estado(self, session: Session, categoria_fixture):
        """Debe actualizar el estado de la categoría."""
        update_data = CategoriaUpdate(estado=False)
        
        result = update_categoria(session, categoria_fixture.id, update_data)
        
        assert result.estado == False
    
    def test_update_categoria_no_existente(self, session: Session):
        """Debe lanzar excepción cuando la categoría no existe."""
        update_data = CategoriaUpdate(nombre="No Existe")
        
        with pytest.raises(HTTPException) as exc_info:
            update_categoria(session, 99999, update_data)
        
        assert exc_info.value.status_code == 404
        assert "no encontrada" in exc_info.value.detail
    
    def test_update_categoria_nombre_duplicado(self, session: Session):
        """Debe lanzar excepción cuando se intenta usar un nombre existente."""
        # Crear dos categorías
        categoria1 = Categoria(nombre="Categoria 1", descripcion="Desc 1")
        categoria2 = Categoria(nombre="Categoria 2", descripcion="Desc 2")
        session.add_all([categoria1, categoria2])
        session.commit()
        
        # Intentar actualizar categoria2 con el nombre de categoria1
        update_data = CategoriaUpdate(nombre="Categoria 1")
        
        with pytest.raises(HTTPException) as exc_info:
            update_categoria(session, categoria2.id, update_data)
        
        assert exc_info.value.status_code == 400
        assert "Ya existe una categoría" in exc_info.value.detail
    
    def test_update_categoria_mismo_nombre(self, session: Session, categoria_fixture):
        """Debe permitir actualizar con el mismo nombre actual."""
        update_data = CategoriaUpdate(
            nombre="Herramientas",  # Mismo nombre actual
            descripcion="Nueva descripción"
        )
        
        result = update_categoria(session, categoria_fixture.id, update_data)
        
        assert result.nombre == "Herramientas"
        assert result.descripcion == "Nueva descripción"


class TestDeleteCategoria:
    """Tests para la función delete_categoria."""
    
    def test_delete_categoria_exitosa(self, session: Session):
        """Debe eliminar una categoría sin relaciones."""
        categoria = Categoria(nombre="Para Eliminar", descripcion="Test")
        session.add(categoria)
        session.commit()
        categoria_id = categoria.id
        
        result = delete_categoria(session, categoria_id)
        
        assert result == True
        
        # Verificar que se eliminó de la base de datos
        categoria_db = session.get(Categoria, categoria_id)
        assert categoria_db is None
    
    def test_delete_categoria_no_existente(self, session: Session):
        """Debe lanzar excepción cuando la categoría no existe."""
        with pytest.raises(HTTPException) as exc_info:
            delete_categoria(session, 99999)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado" in exc_info.value.detail
    
    def test_delete_categoria_con_productos(self, session: Session, categoria_fixture):
        """Debe lanzar excepción cuando la categoría tiene productos asociados."""
        # Crear un producto asociado a la categoría
        producto = Producto(
            codigo="P001",
            nombre="Producto Test",
            precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD,
            categoria_id=categoria_fixture.id
        )
        session.add(producto)
        session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            delete_categoria(session, categoria_fixture.id)
        
        assert exc_info.value.status_code == 400
        assert "relaciones activas" in exc_info.value.detail


class TestGetCategorias:
    """Tests para la función get_categorias."""
    
    def test_get_categorias_sin_filtros(self, session: Session, categoria_fixture):
        """Debe devolver todas las categorías sin filtros aplicados."""
        result = get_categorias(session)
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.current_page == 1
        assert result.total_pages == 1
        assert result.items[0].nombre == "Herramientas"
    
    def test_get_categorias_con_multiples_categorias(self, session: Session, categorias_fixture):
        """Debe devolver múltiples categorías correctamente."""
        result = get_categorias(session)
        
        assert result.total == 3
        assert len(result.items) == 3
        
        nombres = [cat.nombre for cat in result.items]
        assert "Herramientas" in nombres
        assert "Materiales" in nombres
        assert "EPP" in nombres
    
    def test_get_categorias_busqueda_por_nombre(self, session: Session, categorias_fixture):
        """Debe filtrar categorías por nombre."""
        result = get_categorias(session, search="Herram")
        
        assert result.total == 1
        assert result.items[0].nombre == "Herramientas"
    
    def test_get_categorias_busqueda_case_insensitive(self, session: Session, categorias_fixture):
        """Debe buscar sin considerar mayúsculas/minúsculas."""
        result = get_categorias(session, search="epp")
        
        assert result.total == 1
        assert result.items[0].nombre == "EPP"
    
    def test_get_categorias_filtro_por_estado_activo(self, session: Session):
        """Debe filtrar categorías por estado activo."""
        # Crear categorías con diferentes estados
        categorias = [
            Categoria(nombre="Activa", estado=True),
            Categoria(nombre="Inactiva", estado=False)
        ]
        session.add_all(categorias)
        session.commit()
        
        result = get_categorias(session, estado=True)
        
        assert result.total == 1
        assert all(cat.estado == True for cat in result.items)
        assert result.items[0].nombre == "Activa"
    
    def test_get_categorias_filtro_por_estado_inactivo(self, session: Session):
        """Debe filtrar categorías por estado inactivo."""
        # Crear categorías con diferentes estados
        categorias = [
            Categoria(nombre="Activa", estado=True),
            Categoria(nombre="Inactiva", estado=False)
        ]
        session.add_all(categorias)
        session.commit()
        
        result = get_categorias(session, estado=False)
        
        assert result.total == 1
        assert all(cat.estado == False for cat in result.items)
        assert result.items[0].nombre == "Inactiva"
    
    def test_get_categorias_ordenamiento_asc(self, session: Session, categorias_fixture):
        """Debe ordenar categorías ascendentemente."""
        result = get_categorias(session, sort_by="nombre", sort_order="asc")
        
        nombres = [cat.nombre for cat in result.items]
        assert nombres == sorted(nombres)
        assert nombres[0] == "EPP"
        assert nombres[-1] == "Materiales"
    
    def test_get_categorias_ordenamiento_desc(self, session: Session, categorias_fixture):
        """Debe ordenar categorías descendentemente."""
        result = get_categorias(session, sort_by="nombre", sort_order="desc")
        
        nombres = [cat.nombre for cat in result.items]
        assert nombres == sorted(nombres, reverse=True)
        assert nombres[0] == "Materiales"
        assert nombres[-1] == "EPP"
    
    def test_get_categorias_paginacion(self, session: Session, categorias_fixture):
        """Debe paginar correctamente."""
        result = get_categorias(session, page=1, page_size=2)
        
        assert result.total == 3
        assert len(result.items) == 2
        assert result.current_page == 1
        assert result.total_pages == 2
    
    def test_get_categorias_segunda_pagina(self, session: Session, categorias_fixture):
        """Debe devolver la segunda página correctamente."""
        result = get_categorias(session, page=2, page_size=2)
        
        assert result.total == 3
        assert len(result.items) == 1  # Solo queda 1 elemento en la segunda página
        assert result.current_page == 2
        assert result.total_pages == 2
    
    def test_get_categorias_orden_por_defecto(self, session: Session, categorias_fixture):
        """Debe aplicar orden alfabético por defecto."""
        result = get_categorias(session)
        
        nombres = [cat.nombre for cat in result.items]
        assert nombres == sorted(nombres)
    
    def test_get_categorias_filtros_combinados(self, session: Session):
        """Debe aplicar múltiples filtros simultáneamente."""
        # Crear categorías para el test
        categorias = [
            Categoria(nombre="Herramientas Activas", estado=True),
            Categoria(nombre="Herramientas Inactivas", estado=False),
            Categoria(nombre="Materiales Activos", estado=True)
        ]
        session.add_all(categorias)
        session.commit()
        
        result = get_categorias(session, search="Herramientas", estado=True)
        
        assert result.total == 1
        assert result.items[0].nombre == "Herramientas Activas"


class TestChangeEstadoCategoria:
    """Tests para la función change_estado_categoria."""
    
    def test_change_estado_categoria_desactivar(self, session: Session, categoria_fixture):
        """Debe cambiar el estado de activo a inactivo."""
        result = change_estado_categoria(session, categoria_fixture.id)
        
        assert result.estado == False
        assert result.id == categoria_fixture.id
    
    def test_change_estado_categoria_activar(self, session: Session):
        """Debe cambiar el estado de inactivo a activo."""
        categoria = Categoria(nombre="Inactiva", estado=False)
        session.add(categoria)
        session.commit()
        
        result = change_estado_categoria(session, categoria.id)
        
        assert result.estado == True
    
    def test_change_estado_categoria_no_existente(self, session: Session):
        """Debe lanzar excepción cuando la categoría no existe."""
        with pytest.raises(HTTPException) as exc_info:
            change_estado_categoria(session, 99999)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado" in exc_info.value.detail


class TestGetCategoriasInfinito:
    """Tests para la función get_categorias_infinito."""
    
    def test_get_categorias_infinito_basico(self, session: Session, categoria_fixture):
        """Debe devolver categorías activas para infinite scroll."""
        result = get_categorias_infinito(session)
        
        assert len(result) == 1
        assert result[0].id == categoria_fixture.id
        assert result[0].nombre == "Herramientas"
        assert hasattr(result[0], 'id')
        assert hasattr(result[0], 'nombre')
    
    def test_get_categorias_infinito_solo_activas(self, session: Session):
        """Debe devolver solo categorías activas."""
        categorias = [
            Categoria(nombre="Activa", estado=True),
            Categoria(nombre="Inactiva", estado=False)
        ]
        session.add_all(categorias)
        session.commit()
        
        result = get_categorias_infinito(session)
        
        assert len(result) == 1
        assert result[0].nombre == "Activa"
    
    def test_get_categorias_infinito_busqueda(self, session: Session, categorias_fixture):
        """Debe filtrar categorías por búsqueda."""
        result = get_categorias_infinito(session, search="Herram")
        
        assert len(result) == 1
        assert result[0].nombre == "Herramientas"
    
    def test_get_categorias_infinito_busqueda_case_insensitive(self, session: Session, categorias_fixture):
        """Debe buscar sin considerar mayúsculas/minúsculas."""
        result = get_categorias_infinito(session, search="epp")
        
        assert len(result) == 1
        assert result[0].nombre == "EPP"
    
    def test_get_categorias_infinito_orden_alfabetico(self, session: Session, categorias_fixture):
        """Debe devolver categorías en orden alfabético."""
        result = get_categorias_infinito(session)
        
        nombres = [cat.nombre for cat in result]
        assert nombres == sorted(nombres)
        assert nombres[0] == "EPP"
        assert nombres[-1] == "Materiales"
    
    def test_get_categorias_infinito_paginacion(self, session: Session, categorias_fixture):
        """Debe paginar correctamente con skip y limit."""
        result = get_categorias_infinito(session, skip=1, limit=2)
        
        assert len(result) == 2
        # Como están ordenadas alfabéticamente: EPP, Herramientas, Materiales
        # Con skip=1, debería obtener: Herramientas, Materiales
        nombres = [cat.nombre for cat in result]
        assert "Herramientas" in nombres
        assert "Materiales" in nombres
        assert "EPP" not in nombres
    
    def test_get_categorias_infinito_limite(self, session: Session, categorias_fixture):
        """Debe respetar el límite establecido."""
        result = get_categorias_infinito(session, limit=1)
        
        assert len(result) == 1
        # Primera en orden alfabético
        assert result[0].nombre == "EPP"
    
    def test_get_categorias_infinito_skip_mayor_que_total(self, session: Session, categoria_fixture):
        """Debe devolver lista vacía cuando skip es mayor que el total."""
        result = get_categorias_infinito(session, skip=10)
        
        assert len(result) == 0
    
    def test_get_categorias_infinito_sin_categorias_activas(self, session: Session):
        """Debe devolver lista vacía cuando no hay categorías activas."""
        categoria_inactiva = Categoria(nombre="Inactiva", estado=False)
        session.add(categoria_inactiva)
        session.commit()
        
        result = get_categorias_infinito(session)
        
        assert len(result) == 0