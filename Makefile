all: db-migrate
	python3 manage.py runserver 

db-migrate:
	python3 manage.py makemigrations
	python3 manage.py migrate

db-flush:
	python3 manage.py flush
	rm -rf pong/migrations/
	mkdir pong/migrations
	touch pong/migrations/__init__.py

db-admin-setup: # current user/pass is admin/backend
	python3 manage.py createsuperuser

setup:
	pip3 install -r requirements.txt