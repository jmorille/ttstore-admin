#!/bin/bash

function installTools {
 echo "## Install  Base Tools"
    echo "############################"
   apt-get update
   apt-get -y install wget
}

function installAddAptRepositor {
    echo "## Install  add-apt-repositor"
    echo "############################"
   apt-get install -q -y software-properties-common

}

function installJDK7 {
    echo "## Install Java 7"
    echo "############################"
    add-apt-repository ppa:webupd8team/java
    apt-get update
    echo "debconf shared/accepted-oracle-license-v1-1 select true" | debconf-set-selections
    echo "debconf shared/accepted-oracle-license-v1-1 seen true" | debconf-set-selections
    apt-get install -q -y oracle-java7-installer
}



function installElasticsearch {
  echo "## Install ElasticSearch"
  echo "############################"
  curl -L -s -o /opt/elasticsearch.tar.gz https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.2.tar.gz
  tar -C /opt/elasticsearch-1.3.2 --strip-components 1 -xzf /opt/elasticsearch.tar.gz
  ln -s /opt/elasticsearch-1.3.2 /opt/elasticsearch
  rm /opt/elasticsearch.tar.gz
}

function installElasticsearchPlugins {
  echo "## Install ElasticSearch Plugins"
  echo "############################"
}

function configlElasticsearch {
  echo "### Config Elasticsearch"
  echo "############################"
  #sed -i'' 's/jdbc:derby:${catalina.home}\/db/jdbc:derby:${catalina.home}\/data\/db/' /opt/elasticssearch/conf/elasticsearch.yml
  cat /opt/elasticssearch/conf/elasticsearch.yml
}

function cleanBuildInstall {
  echo "### Clean Docker Image"
  echo "############################"
   apt-get -y autoremove
   apt-get clean
   rm -rf /build
}



function setup {
  # Script Start
  chmod +x /build/*.sh

  # Install Tools
  installTools
  installAddAptRepositor
  installJDK7

  # Install Es
  installElasticsearch
  installElasticsearchPlugins
  configlElasticsearch

  # Clean
  cleanBuildInstall
}



setup