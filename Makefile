all: up

up: build rund

down: stop

build:
	docker build -t database .

runi: # doesn't exit correctly when using CTRL+C
	docker run -it --rm -p 8000:8000 --name database-container database

rund:
	docker run -d -p 8000:8000 --name database-container database		

stop:
	docker stop database-container

exec:
	docker exec -it database-container /bin/bash

prune:
	docker system prune -af

# deletes container instance, freeing up the resources it was consuming, such as disk space and network ports.
remove_container: # only needed when using rund, removed automatically in runi (--rm)
	docker rm database-container

# remove Docker image from your local image registry (free disk space) 
remove_image:
	docker rmi database

logs:
	docker logs database-container

exec:
	docker exec -it database-container /bin/bash

.PHONY: all up down build run runi rund stop remove logs exec