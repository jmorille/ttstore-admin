#!/bin/bash

NGINX_VERSION=1.7.5

function installTools {
  echo "### Install  Base Tools"
  echo "### ########################################################"
  apt-get update
  apt-get -y install curl wget build-essential zlib1g-dev libpcre3 libpcre3-dev openssl libssl-dev libperl-dev zip ca-certificates

}


function setupNgnix {
  echo "### Install Ngnix version : $NGINX_VERSION"
  echo "### ########################################################"
  # Download and build nginx
  # Modules :  http://wiki.nginx.org/Modules
  mkdir -p /data && mkdir -p /var/lib
  cd /tmp && wget -q -O - http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz | tar zxf -
  cd /tmp/nginx-${NGINX_VERSION}
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
          --with-pcre
  make install
  # Cleanup
  rm -Rf /tmp/nginx-${NGINX_VERSION}
}



function cleanBuildInstall {
  echo "### Clean Docker Image"
  echo "### ########################################################"
   apt-get -y autoremove
   apt-get clean
   rm -rf /build
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



function setup {

  # Script Start
  chmod +x /build/*.sh

  # Install Tools packages
  installTools|| exit 1

  # Install Ngnix
  setupNgnix || exit 1

  # Install Jdk
  createTlsCertificate || exit 1

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
  ngnix)
    setupNgnix || exit 1
    ;;
  clean)
    cleanBuildInstall
    ;;
  *)
    echo "Usage: $0 setup|tlscertif|ngnix|clean" >&2
    exit 1
    ;;
esac
exit 0