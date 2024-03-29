FROM debian:latest

RUN apt-get update
RUN apt-get install -y wget
RUN apt-get install -y gpg
RUN apt-get install -y mkcert

RUN wget -qO- https://artifacts.elastic.co/GPG-KEY-elasticsearch | gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg

RUN apt-get install apt-transport-https

RUN echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | tee /etc/apt/sources.list.d/elastic-8.x.list

RUN mkdir -p /usr/share/elasticsearch

RUN apt-get update
RUN apt-get install elasticsearch

WORKDIR /usr/share/elasticsearch/bin

COPY elasticsearch.yml /etc/elasticsearch/elasticsearch.yml
RUN chmod 777 /etc/elasticsearch/elasticsearch.yml

RUN mkdir /etc/elasticsearch/ssl

COPY gen-cert.sh /usr/share/elasticsearch/gen-cert.sh
COPY user-setup.sh /usr/share/elasticsearch/user-setup.sh
RUN chmod 777 /usr/share/elasticsearch/gen-cert.sh
RUN chmod 777 /usr/share/elasticsearch/user-setup.sh
RUN /usr/share/elasticsearch/gen-cert.sh

ENV PATH=/usr/share/elasticsearch/bin:$PATH

CMD ["/usr/share/elasticsearch/user-setup.sh"]
