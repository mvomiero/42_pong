up: build rund

down: stop

build:
	docker build -t transcendence .

runi: # doesn't exit correctly when using CTRL+C
	docker run -it --rm -p 8000:8000 --name transcendence-container transcendence

rund:
	docker run -d -p 8000:8000 --name transcendence-container transcendence		

stop:
	docker stop transcendence-container

exec:
	docker exec -it transcendence-container /bin/bash

prune:
	docker system prune -af

# deletes container instance, freeing up the resources it was consuming, such as disk space and network ports.
remove_container: # only needed when using rund, removed automatically in runi (--rm)
	docker rm transcendence-container

# remove Docker image from your local image registry (free disk space) 
remove_image:
	docker rmi -f transcendence

logs:
	docker logs transcendence-container

html-test:
	google-chrome http://127.0.0.1:8000

db-test:
	google-chrome http://127.0.0.1:8000/blockchainTestApp/blockchainTest/graham/1/yy/4/
	
db-admin:
	google-chrome http://127.0.0.1:8000/admin