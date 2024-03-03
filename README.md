# Transcendence

## Overview

Transcendence is the culminating project of the core curriculum at School 42. It is a single-page web application designed for playing Pong. This application offers local and remote multiplayer modes, single matches, and tournaments. Additionally, it includes a dashboard that displays various statistics. Some key features implemented in the project include:

* Server-side rendering and WebSocket communication
* ELK log management system integration
* Containerization using Docker
* Backend developed in Django, with frontend using JavaScript and Bootstrap
* Tournament results stored in Django


## Usage

1. Clone the repository to your local machine.
2. Run `make` to start Docker. Prior to this, execute `make prune` to ensure no other containers are running.
3. In your browser, navigate to the settings (e.g., `chrome://settings/certificates`) and import the certificates from `certs/127.0.0.1-rootCA.pem` to enable HTTPS.
4. Connect to https://127.0.0.1:4443 to access the application.

## Website


![Alt Text](https://github.com/mvomiero/42_pong/blob/main/assets/homepage.png?raw=true)
![Alt Text](https://github.com/mvomiero/42_pong/blob/main/assets/game.png?raw=true)

