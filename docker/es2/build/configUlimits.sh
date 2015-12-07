#!/bin/bash

function configSystem {
  echo ""
  echo "### Config System"
  echo "### ########################################################"
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

  printConfig
}


function printConfig {
  echo ""
  echo "### Print Config Elasticsearch"
  echo "### ########################################################"
  grep -v '^#' /etc/elasticsearch/elasticsearch.yml | grep ":"
  echo ""
  echo "### Print Config Ulimit"
  echo "### ########################################################"
  grep -v '^#' /etc/security/limits.conf
}


configSystem
