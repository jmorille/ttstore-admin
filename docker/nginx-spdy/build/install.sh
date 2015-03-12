#!/bin/bash

NGINX_VERSION=1.7.9
NGINX_BUILD_DIR=/tmp/nginx-${NGINX_VERSION}


function installTools {
  echo "### Install  Base Tools"
  echo "### ########################################################"
  apt-get update
  apt-get -y install curl wget build-essential zlib1g-dev libpcre3 libpcre3-dev openssl libssl-dev libperl-dev zip ca-certificates
}

function secureNgnix {
  echo "### Secure Ngnix version : $NGINX_VERSION"
  echo "### ########################################################"
  sed -i'' 's/static char ngx_http_server_string[] = "Server: nginx" CRLF;/static char ngx_http_server_string[] = "Server: Microsoft-IIS/7.5." CRLF;/' src/http/ngx_http_header_filter_module.c
  sed -i'' 's/static char ngx_http_server_full_string[] = "Server: " NGINX_VER CRLF;/static char ngx_http_server_full_string[] = "Server: Microsoft-IIS/7.5." CRLF;/' src/http/ngx_http_header_filter_module.c
  echo "### ########################################################"
  grep 'static char ngx_http_server'  src/http/ngx_http_header_filter_module.c
  echo "### ########################################################"
}

function setupNgnix {
  echo "### Install Ngnix version : $NGINX_VERSION"
  echo "### ########################################################"
  # Download and build nginx
  # Modules :  http://wiki.nginx.org/Modules
  mkdir -p /data && mkdir -p /var/lib
  cd /tmp && wget -q -O - http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz | tar zxf -
  cd /tmp/nginx-${NGINX_VERSION}
  # secureNgnix
  ./configure --prefix=/etc/nginx/ --sbin-path=/usr/sbin/nginx \
	  --http-client-body-temp-path=/var/lib/nginx/body_temp \
      --http-proxy-temp-path=/var/lib/nginx/proxy_temp \
      --http-fastcgi-temp-path=/var/lib/nginx/fastcgi_temp  \
      --http-scgi-temp-path=/var/lib/nginx/scgi_temp  \
      --http-uwsgi-temp-path=/var/lib/nginx/uwsgi_temp \
      --user=www-data \
      --group=www-data \
      --with-http_ssl_module \
      --with-http_stub_status_module \
      --with-http_realip_module \
      --with-http_spdy_module \
      --with-http_gzip_static_module \
      --with-http_gunzip_module \
      --with-ipv6 \
      --with-pcre
  make install
  # Cleanup
  rm -Rf /tmp/nginx-${NGINX_VERSION}
}



function configureNgnix {
  # TLS Certificat
  # #######################
  cp -r /build/ssl /etc/nginx/ssl
  # Configure nginx
  # #######################
  cp /build/nginx.conf /etc/nginx/conf/nginx.conf
  cp /build/sites-enabled/* /etc/nginx/sites-enabled/*
}


function cleanBuildInstall {
  echo "### Clean Docker Image"
  echo "### ########################################################"
   apt-get -y autoremove
   apt-get clean
   rm -rf /build
   # Cleanup
   rm -Rf /tmp/nginx-${NGINX_VERSION}
}

function createTlsCertificate {
   KEY_PASS=$1
   if [ -z $KEY_PASS ]; then
      echo "First parameter : Password needed"
      exit 1
   else
      echo "### First parameter :  $KEY_PASS"
   fi
  # Doc : https://www.digitalocean.com/community/tutorials/how-to-create-a-ssl-certificate-on-nginx-for-ubuntu-12-04
  # Create a Directory for the Certificate
  mkdir ssl
  cd ssl

  echo "###  Create the Server Key and Certificate Signing Request"
  echo "### ########################################################"
  echo "### First parameter :  $KEY_PASS"
  echo "/C  =  Country	                 GB"
  echo "/ST =  State	                 London"
  echo "/L  =  Location	                 London"
  echo "/O  =  Organization	             Global Security"
  echo "/OU =  Organizational Unit       IT Department"
  echo "/CN =  Common Name	             example.com"

  echo "###  Creating the private server key"
  echo "###  During this process, you will be asked to enter a specific passphrase."
  openssl genrsa  -des3 -out server.key.pass 4096  -subj "/C=FR/ST=France/L=Paris/O=TTBOX/CN=localhost"

  echo ""
  echo "### Creating a certificate signing request"
  openssl req  -passin pass:$KEY_PASS -passout pass:$KEY_PASS -new -key server.key.pass -out server.csr  -subj "/C=FR/ST=France/L=Paris/O=TTBOX/CN=localhost"

  echo ""
  echo "### Remove The password"
  openssl rsa  -passin pass:$KEY_PASS -passout pass:$KEY_PASS  -in server.key.pass -out server.key

  echo ""
  echo "### Sign your SSL Certificate"
  openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

}

function createDHECertificate {
  cd  ssl
  openssl dhparam -out dhparam.pem 4096
}

function setup {

  # Script Start
  chmod +x /build/*.sh

  # Install Tools packages
  installTools|| exit 1

  # Install Ngnix
  setupNgnix || exit 1

  # createTlsCertificate || exit 1
  configureNgnix || exit 1

  # Clean
  cleanBuildInstall || exit 1
}

case "$1" in
  setup)
    setup
    ;;
  tlscertif)
    createTlsCertificate $2 || exit 1
    ;;
  installTools)
    installTools || exit 1
    ;;
  ngnixInstall)
    setupNgnix || exit 1
    ;;
  ngnixConfig)
    configureNgnix || exit 1
    ;;
  clean)
    cleanBuildInstall
    ;;
  *)
    echo "Usage: $0 setup|tlscertif|ngnixInstall|configureNgnix|clean" >&2
    exit 1
    ;;
esac
exit 0
