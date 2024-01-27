FROM python:3.12.0-bookworm
RUN apt upgrade && apt update && apt install -y nano \
    && apt install -y software-properties-common python3 python3-pip python3-launchpadlib \
    && pip3 install web3 python-dotenv --break-system-packages \
    && apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
    && pip3 install django-cors-headers --break-system-packages \
    && rm -rf /var/lib/apt/lists/*
COPY config/django/requirements.txt .
RUN pip3 install -r requirements.txt --break-system-packages \
    && apt-get update && apt-get install -y postgresql \
    && apt-get install postgresql-client \
    && pip install psycopg2
RUN pip install django-cors-headers pytz -r requirements.txt
RUN django-admin startproject transcendence
WORKDIR /transcendence
#RUN python manage.py collectstatic # CORS related - not quite sure why needed
RUN python manage.py startapp pong

# would be nice to do this in a less verbose way, but merging using * didn't work with subfolders

COPY ./config/django/pong/admin.py ./pong/
COPY ./config/django/pong/routing.py ./pong/
COPY ./config/django/pong/templates/pong/index.html ./pong/templates/pong/
COPY ./config/django/pong/apps.py ./pong/
COPY ./config/django/pong/models.py ./pong/
COPY ./config/django/pong/signals.py ./pong/
COPY ./config/django/pong/urls.py ./pong/
COPY ./config/django/pong/views.py ./pong/
COPY ./config/django/pong/webSocket_msg_create.py ./pong/
COPY ./config/django/pong/consumers.py ./pong/
COPY ./config/django/requirements.txt ./
COPY ./config/django/transcendence/asgi.py ./transcendence/
COPY ./config/django/transcendence/urls.py ./transcendence/
COPY ./config/django/transcendence/wsgi.py ./transcendence/
COPY ./config/django/transcendence/settings.py ./transcendence/
COPY ./config/django/static/assets/favicon.ico ./static/assets/
COPY ./config/django/static/assets/icon.svg ./static/assets/
COPY ./config/django/static/assets/img/42_Logo.svg ./static/assets/img/
COPY ./config/django/static/assets/img/galaxy.jpg ./static/assets/img/
COPY ./config/django/static/assets/img/landscape.png ./static/assets/img/
COPY ./config/django/static/assets/img/landscape_pool.png ./static/assets/img/
COPY ./config/django/static/assets/img/team/flo1.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/flo2.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/gb1.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/gb2.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/mv1.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/mv2.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/pa1.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/pa2.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/yy1.png ./static/assets/img/team/
COPY ./config/django/static/assets/img/team/yy2.png ./static/assets/img/team/
COPY ./config/django/static/assets/title.svg ./static/assets/
COPY ./config/django/static/css/styles.css ./static/css/
COPY ./config/django/static/css/styles_vaporwave.css ./static/css/
COPY ./config/django/static/js_dashboard/dashboard.js ./static/js_dashboard/
COPY ./config/django/static/js_dashboard/drawCharts.js ./static/js_dashboard/
COPY ./config/django/static/js_dashboard/pagination.js ./static/js_dashboard/
COPY ./config/django/static/js_dashboard/playerDaschboard.js ./static/js_dashboard/
COPY ./config/django/static/js_dashboard/updateCards.js ./static/js_dashboard/
COPY ./config/django/static/js_dashboard/fetchData.js ./static/js_dashboard/
COPY ./config/django/static/3d_pong/main.js ./static/3d_pong/
COPY ./config/django/entrypoint.sh .
COPY ./config/blockchain/trans.sol ./pong/
COPY ./config/blockchain/trans.abi ./pong/
COPY ./config/blockchain/trans.bin ./pong/
COPY ./config/blockchain/deploy_sepo.py ./pong/
CMD ./entrypoint.sh