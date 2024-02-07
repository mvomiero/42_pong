#!/bin/bash

SSL_PATH="/etc/elasticsearch/ssl"

#localhost CA
#mkcert -install
#mkcert -key-file $SSL_PATH/localhost_key.pem -cert-file $SSL_PATH/localhost_cert.crt 10.15.203.1
#chmod 644 $SSL_PATH/localhost_key.pem
#cp /root/.local/share/mkcert/rootCA.pem $SSL_PATH

#CA
openssl genpkey -algorithm RSA -out $SSL_PATH/ca_private_key.pem
openssl req -x509 -new -key $SSL_PATH/ca_private_key.pem -days 365 -out $SSL_PATH/ca_cert.crt -subj "/C=DE/L=Berlin/O=42School/CN=elasticsearch"

#elastic
openssl genpkey -algorithm RSA -out $SSL_PATH/elastic_key.pem
chmod 777 $SSL_PATH/elastic_key.pem
openssl req -new -key $SSL_PATH/elastic_key.pem -out $SSL_PATH/elastic_csr.crt -subj "/C=DE/L=Berlin/O=42School/CN=elasticsearch"
openssl x509 -req -in $SSL_PATH/elastic_csr.crt -CA $SSL_PATH/ca_cert.crt -CAkey $SSL_PATH/ca_private_key.pem -days 365 -out $SSL_PATH/elastic_cert_signed.crt

#logstash
openssl genpkey -algorithm RSA -out $SSL_PATH/logstash_key.pem
chmod 777 $SSL_PATH/logstash_key.pem
openssl req -new -key $SSL_PATH/logstash_key.pem -out $SSL_PATH/logstash_csr.crt -subj "/C=DE/L=Berlin/O=42School/CN=elasticsearch"
openssl x509 -req -in $SSL_PATH/logstash_csr.crt -CA $SSL_PATH/ca_cert.crt -CAkey $SSL_PATH/ca_private_key.pem -days 365 -out $SSL_PATH/logstash_cert_signed.crt

#kibana
openssl genpkey -algorithm RSA -out $SSL_PATH/kibana_key.pem
chmod 777 $SSL_PATH/kibana_key.pem
openssl req -new -key $SSL_PATH/kibana_key.pem -out $SSL_PATH/kibana_csr.crt -subj "/C=DE/L=Berlin/O=42School/CN=elasticsearch"
openssl x509 -req -in $SSL_PATH/kibana_csr.crt -CA $SSL_PATH/ca_cert.crt -CAkey $SSL_PATH/ca_private_key.pem -days 365 -out $SSL_PATH/kibana_cert_signed.crt

#filebeat
openssl genpkey -algorithm RSA -out $SSL_PATH/filebeat_key.pem
chmod 777 $SSL_PATH/filebeat_key.pem
openssl req -new -key $SSL_PATH/filebeat_key.pem -out $SSL_PATH/filebeat_csr.crt -subj "/C=DE/L=Berlin/O=42School/CN=elasticsearch"
openssl x509 -req -in $SSL_PATH/filebeat_csr.crt -CA $SSL_PATH/ca_cert.crt -CAkey $SSL_PATH/ca_private_key.pem -days 365 -out $SSL_PATH/filebeat_cert_signed.crt