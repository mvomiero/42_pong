all: run

run:
	python3 manage.py runserver

run_public:
	python3 manage.py runserver 10.15.204.1:18000

migrate:
	python3 manage.py makemigrations
	python3 manage.py migrate

clean:
	rm -f db.sqlite3
	make migrate
	make su
	
su:
	python3 manage.py createsuperuser

install_cors_headers:
	pip3 install corsheaders