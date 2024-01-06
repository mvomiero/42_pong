FROM python:3.12.0-bookworm
RUN apt upgrade && update && apt install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*
COPY config/requirements.txt .
COPY config/Makefile .
COPY config/entrypoint.sh .
RUN pip install django-cors-headers
RUN pip install -r requirements.txt
RUN django-admin startproject blockchainTestProject
WORKDIR /blockchainTestProject
#RUN python manage.py collectstatic # CORS related - not quite sure why needed
RUN python manage.py startapp blockchainTestApp
COPY configBlockchainTestProject/settings.py .
COPY configBlockchainTestProject/urls.py .
COPY configBlockchainTestApp/admin.py ./blockchainTestApp
#COPY configBlockchainTestApp/apps.py ./blockchainTestApp
COPY configBlockchainTestApp/models.py ./blockchainTestApp
COPY configBlockchainTestApp/urls.py ./blockchainTestApp
COPY configBlockchainTestApp/views.py ./blockchainTestApp