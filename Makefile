all: compose

compose:
	docker compose up -d

decompose:
	docker compose down

logs_transcendence:
	docker-compose logs transcendence

logs_postgres:
	docker-compose logs postgres

prune:
	docker system prune -af

remove_image:
	docker rmi -f transcendence
	docker rmi -f postgres

html_test:
	google-chrome http://127.0.0.1:8000

db_test:
	google-chrome http://127.0.0.1:8000/blockchainTestApp/blockchainTest/graham/1/yy/4/
	
db_admin:
	google-chrome http://127.0.0.1:8000/admin

game: 
	python3 trans_autotest_game.py

tour:
	python3 trans_autotest_tournament.py

# old stuff

# run:
# 	python3 manage.py runserver

# run_public:
# 	python3 manage.py runserver 10.15.204.1:18000

# migrate:
# 	python3 manage.py makemigrations
# 	python3 manage.py migrate

# clean:
# 	rm -f db.sqlite3
# 	make migrate
# 	make su
	
# su:d
# 	python3 manage.py createsuperuser

# install_cors_headers:
# 	pip3 install corsheaders