#!/bin/bash


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
  tlscertif)
    createTlsCertificate $2 || exit 1
    ;;
  *)
    echo "Usage: $0 tlscertif" >&2
    exit 1
    ;;
esac
exit 0
