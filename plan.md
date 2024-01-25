# End goal

We need a Docker-compose.yml, which will have three containers:
1. Django + Blockchain + Nginx (ssh)
2. Postgre
3. ELK

# Steps

1. Make one container based on node.js, with django and sql database
- use the database_test_dockerised as the starting point for the Dockerfile
- it will run a script to do the database migration, for this we also need an .env file in the root containing
```
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=adminpassword
```

Note: `POSTGRES_` entries are for later

2. install three.js library using node package manager
- and maybe other stuff?

3. Add blockchain parts to existing container (YY to do)
- etherium, solidity
4. Add https support
- will require adding nginx or some other https compliant server instead or as well as the existing server
5. Convert database to postgres (requires a separate container image)
- we simply pull the postgres image from dockerhub here

## What is the name of my app and of my project

Project: transcendence
App: pong

## Copy the files that we need to copy into the docker container into a folder called config

The script `make_config.sh` handles this for us

## What items in requirements.txt are really needed

## Do we need a .env file at the moment? Yes, as .entrypoint.sh uses it to setup the database

## Make database persistent?!