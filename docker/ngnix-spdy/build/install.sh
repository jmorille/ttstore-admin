#!/bin/bash

NGINX_VERSION 1.7.5

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
  cd /tmp
  wget -q -O - http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz | tar zxf -
  cd /tmp/nginx-${NGINX_VERSION}
  ./configure --prefix=/etc/nginx/ --sbin-path=/usr/sbin/nginx --with-http_ssl_module --with-http_spdy_module \
  make install
}

function configProxy {
 if [ -n $HTTP_PROXY ]; then
    echo "### Config Proxy :  $HTTP_PROXY"
    echo "### ########################################################"
 fi
}



function cleanBuildInstall {
  echo "### Clean Docker Image"
  echo "### ########################################################"
   apt-get -y autoremove
   apt-get clean
   rm -rf /build
}

function createTlsCertificate {
  # Doc : https://www.digitalocean.com/community/tutorials/how-to-create-a-ssl-certificate-on-nginx-for-ubuntu-12-04
  # Create a Directory for the Certificate
  # mkdir /etc/nginx/ssl
  # cd /etc/nginx/ssl

  echo "###  Create the Server Key and Certificate Signing Request"
  echo "### ########################################################"

  echo "###  Creating the private server key"
  echo "###  During this process, you will be asked to enter a specific passphrase."
  openssl genrsa -des3 -out server.key 1024

  echo "###  creating a certificate signing request:"
  openssl req -new -key server.key -out server.csr


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
    createTlsCertificate || exit 1
    ;;
  ngnix)
    setupNgnix || exit 1
    ;;
  proxy)
    configProxy
    ;;
  configEs)
    printEs
    ;;
  esplugins)
    installEsPlugins
    ;;
  clean)
    cleanBuildInstall
    ;;
  *)
    echo "Usage: $0 setup|jdk7|es|proxy|configEs|esplugins|clean" >&2
    exit 1
    ;;
esac
exit 0
