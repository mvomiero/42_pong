FROM python:3.12.0-bookworm
RUN apt upgrade && apt update && apt install -y nano && rm -rf /var/lib/apt/lists/*
COPY config/requirements.txt .
RUN pip install django-cors-headers
RUN pip install -r requirements.txt
RUN django-admin startproject blockchainTestProject
WORKDIR /blockchainTestProject
#RUN python manage.py collectstatic # CORS related - not quite sure why needed
RUN python manage.py startapp blockchainTestApp
COPY configBlockchainTestProject/settings.py ./blockchainTestProject
COPY configBlockchainTestProject/urls.py ./blockchainTestProject
COPY configBlockchainTestApp/admin.py ./blockchainTestApp
COPY configBlockchainTestApp/models.py ./blockchainTestApp
COPY configBlockchainTestApp/urls.py ./blockchainTestApp
COPY configBlockchainTestApp/views.py ./blockchainTestApp
COPY config/.env .
COPY config/entrypoint.sh .
CMD ./entrypoint.sh