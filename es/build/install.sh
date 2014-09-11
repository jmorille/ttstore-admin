#!/bin/bash

function installTools {
   apt-get update
   apt-get -y install wget
}

function installElasticsearch {
  curl -s -o /opt/elasticsearch.tar.gz https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.2.tar.gz
  tar -C /opt/elasticsearch-1.3.2 --strip-components 1 -xzf /opt/elasticsearch.tar.gz
  ln -s /opt/elasticsearch-1.3.2 /opt/elasticsearch
  rm /opt/elasticsearch.tar.gz
}


function cleanBuildInstall {
   apt-get -y autoremove
   apt-get clean
   rm -rf /build
}



function setup {
  # Script Start
  chmod +x /build/*.sh

  installTools


  cleanBuildInstall
}



setup