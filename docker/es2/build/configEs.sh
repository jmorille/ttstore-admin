#!/bin/bash


function configEs {
  echo ""
  echo "### Config Elasticsearch"
  echo "### ########################################################"
  # Set to true to instruct the operating system to never swap the ElasticSearch process
  # sed -i'' 's/#bootstrap.mlockall: true/bootstrap.mlockall: true/' $ES_HOME/config/elasticsearch.yml
  # Paths
  # sed -i'' 's/#path.data: \/path\/to\/data$/path.data: \/data/' $ES_HOME/config/elasticsearch.yml
  # sed -i'' 's/#path.logs: \/path\/to\/logs/path.logs: \/logs/' $ES_HOME/config/elasticsearch.yml
  # sed -i'' 's/#path.work: \/path\/to\/work/path.work: \/work/' $ES_HOME/config/elasticsearch.yml

  printConfig
}


function printConfig {
  echo ""
  echo "### Print Config Elasticsearch"
  echo "### ########################################################"
  grep -v '^#' /etc/elasticsearch/elasticsearch.yml | grep ":"
  echo ""
}


configEs
