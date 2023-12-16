all: local-server chrome-modules

local-server:
	python3 -m http.server

chrome-modules:
	google-chrome "0.0.0.0:8000/importMapExample_modules.html" --allow-insecure-localhost --disable-web-security &

disable-web:
	google-chrome "importMapExample_fontLoader.html" --disable-web-security --user-data-dir=/home/gbooth/Desktop/userData
	
text-scene1-example:
	google-chrome "textScene1.html" --disable-web-security --user-data-dir=/home/gbooth/Desktop/userData
	
text-scene2-example:
	google-chrome "textScene2.html" --disable-web-security --user-data-dir=/home/gbooth/Desktop/userData
	
text-scene3-example:
	google-chrome "textScene3.html" --disable-web-security --user-data-dir=/home/gbooth/Desktop/userData
	
text-scenes-combined:
	google-chrome "textScenesCombined.html" --disable-web-security --user-data-dir=/home/gbooth/Desktop/userData
	
scores:
	google-chrome "batVelocity3Scores.html" --disable-web-security --user-data-dir=/home/gbooth/Desktop/userData
