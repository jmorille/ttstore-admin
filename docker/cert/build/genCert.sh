#!/bin/bash

# Doc : http://www.linux-france.org/prj/edu/archinet/systeme/ch24s03.html
# Apache https://httpd.apache.org/docs/2.4/fr/ssl/ssl_faq.html

# Certificate
export CA_PASS=agrica
export CERTIFCATE_PASS=acirga

export CA_SUBJ="/C=FR/ST=France/L=Paris/O=Organisation/OU=DSI/CN=root" 
export CERT_SUBJ="/C=FR/ST=France/L=Paris/O=Organisation/OU=DITW/CN=localhost"

# KeyStore
export FILE_KEYSTORE_JKS="keystore-server.jks"
export FILE_KEYSTORE_PKCS12="server.p12"

export KEYSTORE_PK12_PASS=keystorePKCS12pass
export KEYSTORE_JKS_PASS=keystoreJKSPass


function docCertificateSubject {

  echo "###  Create the Server Key and Certificate Signing Request"
  echo "### ########################################################"
  echo "### First parameter :  $CERTIFCATE_PASS"
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
  openssl req -passin pass:$CA_PASS -new -x509 -nodes -sha1 -days 365 -key ca.key -out ca.crt -extensions usr_cert  -subj $CA_SUBJ

  # printCA
}

function printCA {
   # Vous pouvez afficher les détails de ce certificat avec :
   openssl x509 -passin pass:$CA_PASS -noout -text -in ca.crt
}

function createCertificateTls {
 # Créez une clé privée RSA pour votre serveur Apache (elle sera au format PEM et chiffrée en Triple-DES):
 openssl genrsa -passout pass:$CERTIFCATE_PASS -des3 -out server.key 4096

 # Enregistrez le fichier server.key et le mot de passe éventuellement défini en lieu sûr. 
 # TODO

 # Vous pouvez afficher les détails de cette clé privée RSA à l'aide de la commande :
 # openssl rsa -passin pass:$CERTIFCATE_PASS -noout -text -in server.key
 
 # Créez une Demande de signature de Certificat (CSR) à l'aide de la clé privée précédemment générée (la sortie sera au format PEM):
 openssl req -passin pass:$CERTIFCATE_PASS -new -key server.key -out server.csr  -subj $CERT_SUBJ

 # Vous devez entrer le Nom de Domaine Pleinement Qualifié ("Fully Qualified Domain Name" ou FQDN) 
 # de votre serveur lorsqu'OpenSSL vous demande le "CommonName", 
 # c'est à dire que si vous générez une CSR pour un site web auquel on accèdera par l'URL https://www.foo.dom/, le FQDN sera "www.foo.dom". 
 
 # printCsr

}

function printCsr {
 # Vous pouvez afficher les détails de ce CSR avec :
 openssl req -passin pass:$CERTIFCATE_PASS -noout -text -in server.csr
}


function signCertificateTlsWithCa {
  # La commande qui signe la demande de certificat est la suivante : ==>  CRT ( = CSR + CA sign
  openssl x509 -passin pass:$CA_PASS -req -in server.csr -out server.crt -CA ca.crt -CAkey ca.key -CAcreateserial -CAserial ca.srl
  
  # printCrt
}

function printCrt {
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
   if [ -f "$FILE_KEYSTORE_PKCS12" ]
   then
	echo "$FILE_KEYSTORE_PKCS12 found."
        rm $FILE_KEYSTORE_PKCS12
   else
	echo "$FILE_KEYSTORE_PKCS12 not found."
   fi

   # Test for all Certificate File
   FILE_ALL_CERT=allcacerts.crt
   if [ -f "$FILE_ALL_CERT" ]
   then
	echo "$FILE_ALL_CERT found." 
   else
	echo "$FILE_ALL_CERT not found."
        mergeAllCertificats
   fi

   # create PKCS12 format keystores.
   openssl pkcs12 -passin pass:$CERTIFCATE_PASS -passout pass:$KEYSTORE_PK12_PASS  -export -in server.crt -inkey server.key -out $FILE_KEYSTORE_PKCS12 -name tomcat -CAfile allcacerts.crt -caname root -chain
 }

function createNewKeystoreJKS {
   # Keystore Vide
   if [ -f "$FILE_KEYSTORE_JKS" ]
   then
	echo "$FILE_KEYSTORE_JKS found."
        rm $FILE_KEYSTORE_JKS
   else
	echo "$FILE_KEYSTORE_JKS not found."
   fi

   #keytool -certreq -keyalg RSA -alias server -file server.csr -keystore server-keystore.jks -storepass $CA_PASS01 -keypass $CA_PASS01
   # keytool -genkey -alias server -keyalg rsa -keysize 1024 -keystore server-keystore.jks -storetype JKS -storepass $CA_PASS01 -keypass $CA_PASS01 -dname "CN=integ2, OU=COM, O=$CA_PASS, L=PARIS, ST=PARIS, C=FR, emailAddress=test@$CA_PASS.fr" 

   keytool -genkey -alias tomcat -keyalg RSA  -keysize 4096 -keypass $CERTIFCATE_PASS -keystore $FILE_KEYSTORE_JKS -storetype JKS -storepass $KEYSTORE_JKS_PASS -dname "CN=integ2, OU=COM, O=Organisation, L=PARIS, ST=PARIS, C=FR, emailAddress=test@organisation.fr" 
}

function importKeystoreJKSCertificates { 
 # Import the Chain Certificate into your keystore   
 # keytool -import -alias root -keystore $FILE_KEYSTORE_JKS -storepass $KEYSTORE_JKS_PASS -trustcacerts -noprompt -file  allcacerts.crt

 # keytool -import -alias root -keystore $FILE_KEYSTORE_JKS -storepass $KEYSTORE_JKS_PASS -trustcacerts -noprompt -file  ca.crt
 # keytool -import -alias tomcat -keystore $FILE_KEYSTORE_JKS -storepass $KEYSTORE_JKS_PASS -trustcacerts -noprompt -file  server.crt
 # keytool -alias dmzlan -import -keystore /DATA/API/certificates/api_keystore.jks -file /DATA/API/certificates/server-lanDmz.crt -storepass $KEYSTORE_JKS_PASS
 
 # List KeyStore
 printKeystoreJKSCertificates
}
 
function printKeystoreJKSCertificates { 
 # List KeyStore
 keytool -list -v -keystore $FILE_KEYSTORE_JKS -storepass $KEYSTORE_JKS_PASS
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



function setup {

  # Script Start
  # chmod +x /build/*.sh
  mkdir tls
  cd tls

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
}


case "$1" in
  setup)
    setup $2 || exit 1
    ;;
  ca)
    createCA $2 || exit 1
    ;;
  printCA)
    printCA $2 || exit 1
    ;;
  cert)
    createCertificateTls $2 || exit 1
    ;;
  printCsr)
    printCsr $2 || exit 1
    ;;
  printCrt)
    printCrt $2 || exit 1
    ;;
  sign)
    signCertificateTlsWithCa $2 || exit 1
    ;;
  certSign)
    createCertificateTls $2 || exit 1
    signCertificateTlsWithCa $2 || exit 1
    ;;
  keystoreJKS)
    createNewKeystoreJKS $2 || exit 1
    ;;
  printJKS)
    printKeystoreJKSCertificates $2 || exit 1
    ;;
  *)
    echo "Usage: $0 setup | ca | cert | sign | certSign | printCA | printCsr | printCrt | keystoreJKS | printJKS " >&2
    exit 1
    ;;
esac
exit 0
 
