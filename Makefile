all: up

up: build rund

down: stop

build:
	docker build -t blockchain .

runi: # doesn't exit correctly when using CTRL+C
	docker run -it --rm -p 5173:5173 --name blockchain-container blockchain

rund:
	docker run -d -p 5173:5173 --name blockchain-container blockchain		

stop:
	docker stop blockchain-container

exec:
	docker exec -it blockchain-container /bin/bash

prune:
	docker system prune -af

# deletes container instance, freeing up the resources it was consuming, such as disk space and network ports.
remove_container: # only needed when using rund, removed automatically in runi (--rm)
	docker rm blockchain-container

# remove Docker image from your local image registry (free disk space) 
remove_image:
	docker rmi blockchain

logs:
	docker logs blockchain-container

exec:
	docker exec -it blockchain-container /bin/bash

.PHONY: all up down build run runi rund stop remove logs exec