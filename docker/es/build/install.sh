#!/bin/bash

ES_HOME=/opt/elasticsearch

INSTALL_ES_VERSION=elasticsearch-1.4.2

function installTools {
  echo ""
  echo "### Install  Base Tools"
  echo "### ########################################################"
  apt-get update
  apt-get -y install curl
}

function installAddAptRepositor {
  echo ""
  echo "### Install  add-apt-repositor"
  echo "### ########################################################"
  apt-get install -q -y software-properties-common
}

function installJDK7 {
    echo ""
    echo "### Install Java 7"
    echo "### ########################################################"
    add-apt-repository ppa:webupd8team/java
    apt-get update
    echo "debconf shared/accepted-oracle-license-v1-1 select true" | debconf-set-selections
    echo "debconf shared/accepted-oracle-license-v1-1 seen true" | debconf-set-selections
    apt-get install -q -y oracle-java7-installer
}

function installJDK8 {
    echo ""
    echo "### Install Java 8"
    echo "### ########################################################"
    add-apt-repository ppa:webupd8team/java
    apt-get update
    echo "debconf shared/accepted-oracle-license-v1-1 select true" | debconf-set-selections
    echo "debconf shared/accepted-oracle-license-v1-1 seen true" | debconf-set-selections
    apt-get install -q -y oracle-java8-installer
}


function installEs {
  echo ""
  echo "### Install ElasticSearch in : $ES_HOME"
  echo "### ########################################################"
  curl -L -s -o /opt/elasticsearch.tar.gz https://download.elasticsearch.org/elasticsearch/elasticsearch/$INSTALL_ES_VERSION.tar.gz
  tar -xzf /opt/elasticsearch.tar.gz -C  /opt/
  ln -s /opt/$INSTALL_ES_VERSION $ES_HOME
  rm /opt/elasticsearch.tar.gz
}

function configProxy {
 if [ -n $HTTP_PROXY ]; then
    echo ""
    echo "### Config Proxy :  $HTTP_PROXY"
    echo "### ########################################################"
    echo "## Config Proxy : ElasticSearch Plugins"
    sed -i 's/$JAVA_OPTS/$JAVA_OPTS -Dhttps.proxyHost=webcache.generali.fr -Dhttps.proxyPort=3128/' $ES_HOME/bin/plugin
 fi
}



function installEsPlugins {
  echo ""
  echo "### Install ElasticSearch Plugins"
  echo "### ########################################################"
  echo "### Install ElasticSearch Plugins : head"
  /opt/elasticsearch/bin/plugin -install mobz/elasticsearch-head
  echo "### Install ElasticSearch Plugins : kopf"
  /opt/elasticsearch/bin/plugin -install lmenezes/elasticsearch-kopf

}

function configEs {
  echo ""
  echo "### Config Elasticsearch"
  echo "### ########################################################"
  # Set to true to instruct the operating system to never swap the ElasticSearch process
  sed -i'' 's/#bootstrap.mlockall: true/bootstrap.mlockall: true/' $ES_HOME/config/elasticsearch.yml
  # Paths
  sed -i'' 's/#path.data: \/path\/to\/data$/path.data: \/data/' $ES_HOME/config/elasticsearch.yml
  sed -i'' 's/#path.logs: \/path\/to\/logs/path.logs: \/logs/' $ES_HOME/config/elasticsearch.yml
  sed -i'' 's/#path.work: \/path\/to\/work/path.work: \/work/' $ES_HOME/config/elasticsearch.yml
  # Config ulimits
  echo ""   >> /etc/security/limits.conf
  echo "*         soft    nofile          1048576"   >> /etc/security/limits.conf
  echo "*         hard    nofile          1048576"   >> /etc/security/limits.conf
  echo "*         -       memlock         unlimited" >> /etc/security/limits.conf
  echo "root      soft    nofile          1048576"   >> /etc/security/limits.conf
  echo "root      hard    nofile          1048576"   >> /etc/security/limits.conf
  echo "root      -       memlock         unlimited" >> /etc/security/limits.conf
  # Config pam_limit
  echo "" >> /etc/pam.d/common-session
  echo "session required pam_limits.so" >> /etc/pam.d/common-session

  printEs
}

function printEs {
  echo ""
  echo "### Print Config Elasticsearch"
  echo "### ########################################################"
  grep -v '^#' /opt/elasticsearch/config/elasticsearch.yml | grep ":"
  echo ""
  echo "### Print Config Elasticsearch"
  echo "### ########################################################"
  grep -v '^#' /etc/security/limits.conf
}


function cleanBuildInstall {
  echo ""
  echo "### Clean Docker Image"
  echo "### ########################################################"
   apt-get -y autoremove
   apt-get clean
   rm -rf /build
}

function setupJdk8 {
  installTools || exit 1
  installAddAptRepositor || exit 1
  # installJDK7 || exit 1
  installJDK8 || exit 1
}


function setupEs {
  installEs || exit 1
  configProxy || exit 1
  configEs || exit 1
  installEsPlugins || exit 1
}

function setup {
  # Script Start
  chmod +x /build/*.sh
  # Install Jdk
  setupJdk8 || exit 1
  # Install Es
  setupEs || exit 1
  # Clean
  cleanBuildInstall || exit 1
}

case "$1" in
  setup)
    setup
    ;;
  jdk8)
    setupJdk8 || exit 1
    ;;
  es)
    setupEs || exit 1
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
