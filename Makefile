# keys are in /goinfre/docker/volumes

all: up_only

up_only:
	docker compose up

eval:
	docker compose up --build

compose: 
	docker compose up --remove-orphans --build -d

decompose:
	docker compose down

recompose: decompose all

exec_transcendence:
	docker compose exec transcendence /bin/bash

logs_transcendence:
	docker compose logs transcendence

logs_postgres:
	docker compose logs postgres

install_CA:
	google-chrome chrome://settings/certificates

make_certs: # run with sudo on non-cluster pc
#	rm -rf certs
#	mkdir certs
	apt install mkcert
	mkcert -install
	mkcert -cert-file ./certs/$(IP)-cert.pem -key-file ./certs/$(IP)-key.pem $(IP)
	cp /root/.local/share/mkcert/rootCA.pem ./certs/$(IP)-rootCA.pem
	chmod 644 ./certs/$(IP)-key.pem

copy_cert:
	cp certs/* ~/goinfre/docker/volumes/42_pong_ssl_keys_local   

clean_certs:
	rm -f ssl_data/*
	rm -f ssl_keys_local/*

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