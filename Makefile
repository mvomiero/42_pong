all: run

run:
	python3 manage.py runserver

migrate:
	python3 manage.py makemigrations
	python3 manage.py migrate

clean:
	rm -f db.sqlite3
	make migrate
	make su

chrome:
	google-chrome --disable-web-security --disable-application-cache --user-data-dir=/home/gbooth/Desktop/userData

su:
	python3 manage.py createsuperuser