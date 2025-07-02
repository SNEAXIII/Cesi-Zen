ifeq ($(OS), Windows_NT)
    VENV_PYTHON := venv/Scripts/python.exe
else
    VENV_PYTHON := venv/bin/python
endif
RUN_MODULE := $(VENV_PYTHON) -m
help:
	@echo "run-dev	-->	run the server in dev mode with auto reload"
	@echo "create-mig	-->	create fresh new migration"
	@echo "migrate	-->	execute pending migrations"
	@echo "fixtures	-->	load all fixtures for one time"
	@echo "cancel-last	-->	cancel last executed migration"
	@echo "test-cov	-->	run the test coverage"
	@echo "create-venv	-->	create the python virtual env"
	@echo "dl_prod_reqs	-->	install prod requirements"
	@echo "dl_dev_reqs	-->	install prod and dev requirements"
	@echo "reset-db	-->	reset the database"

create-venv:
	python -m venv venv

dl_prod_reqs:
	$(RUN_MODULE) pip install -r requirements.txt

dl_dev_reqs:
	$(RUN_MODULE) pip install -r requirements_dev.txt

run-dev:
	$(RUN_MODULE) fastapi dev --reload

create-mig:
	$(RUN_MODULE) alembic revision --autogenerate -m "create my table"

migrate:
	$(RUN_MODULE) alembic upgrade head

fixtures:
	$(RUN_MODULE) src.fixtures.sample_data

reset-db:
	$(RUN_MODULE) src.fixtures.reset_db

cancel-last:
	$(RUN_MODULE) alembic downgrade -1

test-cov:
	$(RUN_MODULE) pytest test --cov --cov-report term-missing -v
