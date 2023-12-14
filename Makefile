all: local-server chrome-modules

local-server:
	python3 -m http.server

chrome-modules:
	google-chrome "0.0.0.0:8000/importMapExample_modules.html" --allow-insecure-localhost --disable-web-security &

disable-web:
	google-chrome "importMapExample_fontLoader.html" --disable-web-security --user-data-dir=/home/gbooth/Desktop/userData
	
text-example:
	google-chrome "textScene1.html" --disable-web-security --user-data-dir=/home/gbooth/Desktop/userData
