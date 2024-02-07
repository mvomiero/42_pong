all: compose

compose:
	docker compose up --remove-orphans --build -d

decompose:
	docker compose down

exec_transcendence:
	docker compose exec transcendence /bin/bash

logs_transcendence:
	docker compose logs transcendence

logs_postgres:
	docker compose logs postgres

copy_CA:
	docker cp transcendence:/ssl-keys-local/rootCA.pem .

install_CA:
	google-chrome chrome://settings/certificates
	
prune:
	docker system prune -af

remove_image:
	docker rmi -f transcendence
	docker rmi -f postgres

https_test:
	google-chrome https://127.0.0.1:4443/admin

https_test_static:
	google-chrome https://127.0.0.1:443/static/admin/css/base.css

html_test:
	google-chrome http://127.0.0.1:8000

db_test:
	google-chrome http://127.0.0.1:8000/blockchainTestApp/blockchainTest/graham/1/yy/4/
	
db_admin:
	google-chrome https://127.0.0.1:4443/admin

game: 
	python3 trans_autotest_game.py

tour:
	python3 trans_autotest_tournament.py

# install_cors_headers:
# 	pip3 install corsheaders

set: all
	sleep 5
	make tour
	sleep 5
	make db_admin
	sleep 3
	clear
	make logs_transcendence

setr: decompose
	make set

check: decompose
	make all
	clear
	make logs_transcendence