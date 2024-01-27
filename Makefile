all: compose

compose:
	docker compose up -d

decompose:
	docker compose down

logs_transcendence:
	docker-compose logs transcendence

logs_postgres:
	docker-compose logs postgres

up:  build_postgres runp build rund 

down: stop

build:
	docker build -t transcendence .

build_postgres:
	docker pull postgres

runi: # doesn't exit correctly when using CTRL+C
	docker run -it --rm -p 8000:8000 --name transcendence-container transcendence

rund:
	# docker run -d -p 8000:8000 --name transcendence-container transcendence
	docker run --name transcendence-container -p 8000:8000 -d --network=mynetwork transcendence		

runp:
	docker network create mynetwork
	@sleep 1
	docker run --name pongpostgres -v /tmp/my-pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=backend -p 127.0.0.1:5432:5432 -d --network=mynetwork postgres
	@sleep 1
	# docker run -it --rm postgres psql -h 127.0.0.1 -p 5432 -U postgres -d postgres
	# psql postgresql://postgres:backend@127.0.0.1:5432/po

stop:
	docker stop transcendence-container
	docker stop pongpostgres

exec:
	docker exec -it transcendence-container /bin/bash

execp:
	docker exec -it pongpostgres psql -h localhost -p 5432 -U postgres -d postgres
	# docker exec -it pongpostgres psql postgresql postgresql://postgres:backend@127.0.0.1:5432/postgres

prune:
	docker system prune -af

# deletes container instance, freeing up the resources it was consuming, such as disk space and network ports.
remove_containers: # only needed when using rund, removed automatically in runi (--rm)
	docker rm transcendence-container
	docker rm pongpostgres
	docker network rm mynetwork

# remove Docker image from your local image registry (free disk space) 
remove_image:
	docker rmi -f transcendence


logs:
	docker logs transcendence-container

logsp:
	docker logs pongpostgres

html-test:
	google-chrome http://127.0.0.1:8000

db-test:
	google-chrome http://127.0.0.1:8000/blockchainTestApp/blockchainTest/graham/1/yy/4/
	
db-admin:
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