# Usage:
### running the server

* first change in the website folder, then run the servers
```bash
python3 manage.py runserver
```
* to run tests
```bash
python3 manage.py test polls
```

# Installation

### Virtual environments in python
* create a venv called "venv"
```bash
python3 -m venv --without-pip venv
```
* activate the venv
```bash
source venv/bin/activate
```
* deactivate the venv
```bash
deactivate
```
* get pip in the venv
```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
```
* install the requirements
```bash
pip3 install -r requirements.txt
```

# PROCESS

## Creating and configuring the project

* to start a new project
```bash
django-admin startproject transcendence
```
* to start the polls app
```bash
python3 manage.py startapp pong
```
* Add "channels" and "pong" to the installed apps in *settings.py*

* run migrate to apply migrations
```python
python3 manage.py migrate
```
* add  “STATICFILES_DIRS” to *settings.py*
```python
# settings.py
import os
STATICFILES_DIRS = [
os.path.join(BASE_DIR, "static"),
]
```
## Integrating and configuring Channels library

* modify the `asgi.py` file:
```python
# mysite/asgi.py
import os

from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        # Just HTTP for now. (We can add other protocols later.)
    }
)
```
* add `daphne` to the installed apps in `settings.py`

* point to `daphne` for the routing configuration:
```python
# mysite/settings.py
# Daphne
ASGI_APPLICATION = "mysite.asgi.application"
```
* add the `CHANNEL_LAYERS` setting in `settings.py` (it is the layer that handle the backend... could be for example redis as well --- To be continued...)
```python
CHANNEL_LAYERS = {
    'default': {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    },
}
```
## Designing the index page

* create the folder templates and the files `pong/templates/base.html` and `pong/templates/pong/index.html`

* create the corresponding view in `pong/views.py`

* create the routes to redirect in `pong/urls.py` (creating the file as well) and include it in `transcendence/urls`

## Designing the game page

* setting the route for `play/<room_code>` *(room code will be passed as a parameter to the view function)*

* implementing the `pong` view

* creating `templates/pong/pong.html`

## Creating and setting the consumer

Consumer and routing -> like Views and Urls

* add the file `pong/routing.py` to route the web socket connection to be handled by the consumer

```python
websocket_urlpatterns = [
    url(r'^ws/play/(?P<room_code>\w+)/$', PongConsumer.as_asgi()),
]
```
(explanation of the string parsing commented out on the code)

* in `asgi.py` add the following key `"websocket"`. ProtocolTypeRouter will analze the connection type and redirect it to the web socket if it's starting with ws// or wss//

```python
        "websocket": AuthMiddlewareStack(
            URLRouter(pong.routing.websocket_urlpatterns))
```

* develop the consumer `PongConsumer`. More info on commented out on the code.





