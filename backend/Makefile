APP=app.main:app
UVICORN=uvicorn $(APP) --reload

.PHONY: dev test prod unit-test init-db-dev init-db-test seed-dev seed-test db-dev db-test locust

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
unit-test:
	pytest -v

locust:
	locust -f tests/performance/locustfile.py --host=http://localhost:8000

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
server-test: db-test test

