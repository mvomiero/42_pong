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

### Starting the Django project and creating an app

* to start a new project
```bash
django-admin startproject transcendence
```
* to start the polls app
```bash
python3 manage.py startapp pong
```

### running the server

* first change in the website folder, then run the servers
```bash
python3 manage.py runserver
```
* to run tests
```bash
python3 manage.py test polls
```