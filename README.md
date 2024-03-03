# Transcendence

# Project description

Transcendence is the last project of the core curriculum of school 42.
It is a single page web application to play pong. In the website is possible to play pong in local or remote mode, single match or tournaments. the website has a dashboard where statistics are displayed as well. some key feature implemented in the porject are:
* server side rendering and web socket communication
* elk log management system
* containerization with docker
* backend developed in django, frontend with javascript and bootstrap
* results of the tournament are stored in django


## Usage

* clone the repo
* `make` to start docker, before that run `make prune` to be sure there aren't any other container running
* in the broswer, go to the settings (e.g. ```chrome://settings/certificates```) and import the certificates from `certs/127.0.0.1-rootCA.pem` to be able to use https
* connect to https://

## Website


![Alt Text](https://github.com/mvomiero/42_pong/blob/publishing/assets/homepage.png?raw=true)
![Alt Text](https://github.com/mvomiero/42_pong/blob/publishing/assets/game.png?raw=true)

