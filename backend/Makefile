APP=app.main:app
UVICORN=uvicorn $(APP) --reload --host ::

.PHONY: dev test prod unit-all init-db-dev init-db-test seed-dev seed-test db-dev db-test locust-sb locust-l locust-m locust-h server-test unit-categoria unit-cliente unit-exportar unit-inventario unit-producto unit-security unit-usuario unit-venta locust-debug locust-intro

# ------------------------------
# Servidores
# ------------------------------
dev test:
	set ENV=$@ && $(UVICORN)


prod:
	set ENV=prod && uvicorn $(APP)

# ------------------------------
# Tests
# ------------------------------

# ------------------------------
# Tests UNITARIOS con PYTEST
# ------------------------------

#Intro
pytest-intro:
	python -m tests.unit.pytest_intro
# Ejecutar todos los unit tests con detalles
unit-all:
	pytest -v tests/unit/services/
# Ejecutar prueba de cobertura con pytest-cov
unit-cov:
	pytest --cov=app.core --cov=app.models --cov=app.schemas --cov=app.services tests/unit/services/
	
# Ejecutar por módulo
unit-categoria:
	pytest -v tests/unit/services/test_categoria_service.py

unit-cliente:
	pytest -v tests/unit/services/test_cliente_service.py

unit-exportar:
	pytest -v tests/unit/services/test_exportar_service.py

unit-inventario:
	pytest -v tests/unit/services/test_inventario_service.py

unit-producto:
	pytest -v tests/unit/services/test_producto_service.py

unit-security:
	pytest -v tests/unit/services/test_security.py

unit-usuario:
	pytest -v tests/unit/services/test_usuario_service.py

unit-venta:
	pytest -v tests/unit/services/test_venta_service.py

# ------------------------------
# Tests de RENDIMIENTO con LOCUST
# ------------------------------

#Intro
locust-intro:
	python -m tests.performance.locust_intro
#Sandbox
locust-interactivo:
	locust -f tests/performance/locustfile.py --host=http://localhost:8000
# Low
locust-low:
	locust -f tests/performance/locustfile.py --host=http://localhost:8000 --users 5 --spawn-rate 1 --run-time 5m --headless --html=report_low.html
# Medium
locust-medium:
	locust -f tests/performance/locustfile.py --host=http://localhost:8000 --users 20 --spawn-rate 2 --run-time 10m --headless --html=report_medium.html
# High
locust-high:
	locust -f tests/performance/locustfile.py --host=http://localhost:8000 --users 50 --spawn-rate 5 --run-time 15m --headless --html=report_high.html

# ------------------------------
# Base de datos
# ------------------------------

# Inicialización
init-db-dev:
	set ENV=dev && python -m app.db.init_db

init-db-test:
	set ENV=test && python -m app.db.init_db

# Seed
seed-dev:
	set ENV=dev && python -m app.db.seed

seed-test:
	set ENV=test  && python -m tests.performance.seed_test

# Atajos: init + seed
db-dev: init-db-dev seed-dev
db-test: init-db-test seed-test

# Levantamiento servidor test + db test
server-test: db-test test

