#!/bin/bash

ES_HOME=/opt/elasticsearch

INSTALL_ES_VERSION=elasticsearch-1.3.2

function installTools {
  echo "### Install  Base Tools"
  echo "### ########################################################"
  apt-get update
  apt-get -y install curl
}

function installAddAptRepositor {
  echo "### Install  add-apt-repositor"
  echo "### ########################################################"
  apt-get install -q -y software-properties-common
}

function installJDK7 {
    echo "### Install Java 7"
    echo "### ########################################################"
    add-apt-repository ppa:webupd8team/java
    apt-get update
    echo "debconf shared/accepted-oracle-license-v1-1 select true" | debconf-set-selections
    echo "debconf shared/accepted-oracle-license-v1-1 seen true" | debconf-set-selections
    apt-get install -q -y oracle-java7-installer
}



function installEs {
  echo "### Install ElasticSearch in : $ES_HOME"
  echo "### ########################################################"
  curl -L -s -o /opt/elasticsearch.tar.gz https://download.elasticsearch.org/elasticsearch/elasticsearch/$INSTALL_ES_VERSION.tar.gz
  tar -xzf /opt/elasticsearch.tar.gz -C  /opt/
  ln -s /opt/$INSTALL_ES_VERSION $ES_HOME
  rm /opt/elasticsearch.tar.gz
}

function configProxy {
 if [ -n $HTTP_PROXY ]; then
    echo "### Config Proxy :  $HTTP_PROXY"
    echo "### ########################################################"
    echo "## Config Proxy : ElasticSearch Plugins"
    sed -i 's/$JAVA_OPTS/$JAVA_OPTS -Dhttps.proxyHost=webcache.generali.fr -Dhttps.proxyPort=3128/' $ES_HOME/bin/plugin
 fi
}



function installEsPlugins {
  echo "### Install ElasticSearch Plugins"
  echo "### ########################################################"
  /opt/elasticsearch/bin/plugin -install mobz/elasticsearch-head
   /opt/elasticsearch/bin/plugin -install lmenezes/elasticsearch-kopf

}

function configEs {
  echo "### Config Elasticsearch"
  echo "### ########################################################"
  #sed -i'' 's/#path.data: \/path\/to\/data/path.data: \/data\/es-ttstore/' $ES_HOME/config/elasticsearch.yml
  printEs
}

function printEs {
 grep -v '^#' /opt/elasticsearch/config/elasticsearch.yml | grep ":"
 exit 0
}


function cleanBuildInstall {
  echo "### Clean Docker Image"
  echo "### ########################################################"
   apt-get -y autoremove
   apt-get clean
   rm -rf /build
}

function setupJdk7 {
  installTools || exit 1
  installAddAptRepositor || exit 1
  installJDK7 || exit 1
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
  setupJdk7 || exit 1
  # Install Es
  setupEs || exit 1
  # Clean
  cleanBuildInstall || exit 1
}

case "$1" in
  setup)
    setup
    ;;
  jdk7)
    setupJdk7 || exit 1
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
