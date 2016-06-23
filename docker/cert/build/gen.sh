#!/bin/bash

# Doc : http://www.linux-france.org/prj/edu/archinet/systeme/ch24s03.html
# Apache https://httpd.apache.org/docs/2.4/fr/ssl/ssl_faq.html
CA_PASS=agrica
CERTIFCATE_PASS=acirga
KEYSTORE_PK12_PASS=keystorePKCS12pass
KEYSTORE_JKS_PASS=keystoreJKSPass

function docCertificateSubject {

  echo "###  Create the Server Key and Certificate Signing Request"
  echo "### ########################################################"
  echo "### First parameter :  $KEY_PASS"
  echo "/C  =  Country	                 GB"
  echo "/ST =  State	                 London"
  echo "/L  =  Location	                 London"
  echo "/O  =  Organization	             Global Security"
  echo "/OU =  Organizational Unit       IT Department"
  echo "/CN =  Common Name	             example.com"
}
  
function createCA {
  # Créez une clé privée RSA pour votre serveur (elle sera au format PEM et chiffrée en Triple-DES) :
  openssl  genrsa  -passout pass:$CA_PASS -des3 -out ca.key 4096

  #  Vous pouvez afficher les détails de cette clé privée RSA à l'aide de la commande :
  # openssl rsa -noout -text -in ca.key

  # Si nécessaire, vous pouvez aussi créer une version PEM non chiffrée (non recommandé) de cette clé privée RSA	avec :
  # openssl rsa  -passin pass:$CA_PASS -in ca.key -out ca.key.unsecure

  # Créez un certificat auto-signé (structure X509) à l'aide de la clé RSA que vous venez de générer (la sortie sera au format PEM) :
  openssl req -passin pass:$CA_PASS -new -x509 -nodes -sha1 -days 365 -key ca.key -out ca.crt -extensions usr_cert  -subj "/C=FR/ST=France/L=Paris/O=$CA_PASS/OU=DSI/CN=root"
  # Cette commande signe le certificat du serveur et produit un fichier server.crt. Vous pouvez afficher les détails de ce certificat avec :
  # openssl x509 -passin pass:$CA_PASS -noout -text -in ca.crt
}

function createCertificateTls {
 # Créez une clé privée RSA pour votre serveur Apache (elle sera au format PEM et chiffrée en Triple-DES):
 openssl genrsa -passout pass:$CERTIFCATE_PASS -des3 -out server.key 4096

 # Enregistrez le fichier server.key et le mot de passe éventuellement défini en lieu sûr. 
 # TODO

 # Vous pouvez afficher les détails de cette clé privée RSA à l'aide de la commande :
 # openssl rsa -passin pass:$CERTIFCATE_PASS -noout -text -in server.key
 
 # Créez une Demande de signature de Certificat (CSR) à l'aide de la clé privée précédemment générée (la sortie sera au format PEM):
 openssl req -passin pass:$CERTIFCATE_PASS -new -key server.key -out server.csr  -subj "/C=FR/ST=France/L=Paris/O=$CA_PASS/OU=DITW/CN=localhost"
 # Vous devez entrer le Nom de Domaine Pleinement Qualifié ("Fully Qualified Domain Name" ou FQDN) 
 # de votre serveur lorsqu'OpenSSL vous demande le "CommonName", 
 # c'est à dire que si vous générez une CSR pour un site web auquel on accèdera par l'URL https://www.foo.dom/, le FQDN sera "www.foo.dom". 
 
 #Vous pouvez afficher les détails de ce CSR avec :
 # openssl req -passin pass:$CERTIFCATE_PASS -noout -text -in server.csr

}


function signCertificateTlsWithCa {
  # La commande qui signe la demande de certificat est la suivante : ==>  CRT ( = CSR + CA sign
  openssl x509 -passin pass:$CA_PASS -req -in server.csr -out server.crt -CA ca.crt -CAkey ca.key -CAcreateserial -CAserial ca.srl
  
  # Une fois la CSR signée, vous pouvez afficher les détails du certificat comme suit :
  openssl x509 -noout -text -in server.crt
}

function unpassswdCertificateTlsKey {
 # Supprimer le chiffrement de la clé privée RSA (tout en conservant une copie de sauvegarde du fichier original) :
 openssl rsa  -passin pass:$CERTIFCATE_PASS  -in server.key -out server-nopasswd.key
}

function mergeAllCertificats {
 # -->  allcacerts.crt
 # combines the cacerts file from the openssl distribution and the intermediate.crt file.
 cat server.crt ca.crt > allcacerts.crt
}

function createNewKeystorePKCS12 {
 # -->  server.p12
 # Tomcat currently operates only on JKS, PKCS11 or PKCS12 format keystores.
 openssl pkcs12 -passin pass:$CERTIFCATE_PASS -passout pass:keystorePKCS12pass  -export -in server.crt -inkey server.key -out server.p12 -name tomcat -CAfile allcacerts.crt -caname root -chain
 }

 function createNewKeystoreJKS {
   # Keystore Vide
   #keytool -certreq -keyalg RSA -alias server -file server.csr -keystore server-keystore.jks -storepass $CA_PASS01 -keypass $CA_PASS01
   # keytool -genkey -alias server -keyalg rsa -keysize 1024 -keystore server-keystore.jks -storetype JKS -storepass $CA_PASS01 -keypass $CA_PASS01 -dname "CN=integ2, OU=COM, O=$CA_PASS, L=PARIS, ST=PARIS, C=FR, emailAddress=test@$CA_PASS.fr" 
   keytool -genkey -alias tomcat -keyalg RSA  -keysize 4096 -keypass $CERTIFCATE_PASS -keystore keystore-server.jks -storetype JKS -storepass keystoreJKSPass -dname "CN=integ2, OU=COM, O=$CA_PASS, L=PARIS, ST=PARIS, C=FR, emailAddress=test@$CA_PASS.fr" 
 }

function importKeystoreJKSCertificates { 
 #Import the Chain Certificate into your keystore   
 keytool -import -alias root -keystore keystore-server.jks -storepass keystoreJKSPass -trustcacerts -file  allcacerts.crt
 # TODO auto Yes
}
 
function createTlsCertificateOri {
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

function createDHECertificateOld {
  cd  ssl
  openssl dhparam -out dhparam.pem 4096
}

function setup {

  # Script Start
  chmod +x /build/*.sh

  # Create Ca Certificate ==> ca.crt 
  createCA|| exit 1

  # Create Server Certificate ==>  server.csr 
  createCertificateTls || exit 1

  # Sign Server Certificate With CA  ==> server.crt
  signCertificateTlsWithCa || exit 1

  # Supprimer le chiffrement de la clé privée RSA  : ==> server-nopasswd.key
  unpassswdCertificateTlsKey || exit 1
  
  # Merge All Certificats ==> allcacerts.crt
  mergeAllCertificats || exit 1
  
  # KeyStore PKCS12 ==> server.p12
  createNewKeystorePKCS12 || exit 1
  
  # KeyStore JKS  ==>  keystore-server.jks 
  createNewKeystoreJKS || exit 1
  importKeystoreJKSCertificates || exit 1
  
  # Clean
  # cleanBuildInstall || exit 1
}

case "$1" in
  setup)
    setup $2 || exit 1
    ;;
  createCA)
    createCA $2 || exit 1
    ;;
  createNewKeystoreJKS)
    createNewKeystoreJKS $2 || exit 1
    ;;
  *)
    echo "Usage: $0 setup" >&2
    exit 1
    ;;
esac
exit 0
 
