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
	
su:
	python3 manage.py createsuperuser

test:
	google-chrome http://127.0.0.1:8000/blockchainTestApp/blockchainTest/graham/1/yy/4/
	
admin:
	google-chrome http://127.0.0.1:8000/admin
