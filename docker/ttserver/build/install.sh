#!/bin/bash


function installGit {
  # Install Git
  # ################
  apt-get -y install git

  # Config Git
  # ################
  git --version
  if [ -n $HTTP_PROXY ]; then
      git config --global http.proxy $HTTP_PROXY
  fi
  if [ -n $HTTPS_PROXY ]; then
    git config --global https.proxy $HTTPS_PROXY
  fi
  # Display Config
  # ################
  git config --global -l
}


function installNodeJs {
  apt-get install -y curl
   # Version Download
   # ################
   mkdir -p $NODE_HOME
   curl -f -o /node-install.tar.gz http://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.gz

   tar -xzf /node-install.tar.gz -C  $NODE_HOME/..
   rm node-install.tar.gz

  # Config Npm
  # ################
  # npm config set registry "http://registry.npmjs.org/"

   if [ -n $HTTP_PROXY ]; then
      npm config set proxy $HTTP_PROXY
      npm config set strict-ssl false
   fi
   if [ -n $HTTPS_PROXY ]; then
      npm config set https-proxy $HTTPS_PROXY
   fi

  # Display Config
  # ################
  npm config list
  node --version
  npm --version
}

function cleanBuildInstall {
   apt-get -y autoremove
   apt-get clean
   rm -rf /build
}

function setup {
  # Script Start
  # #######################
  apt-get update
  chmod +x /build/*.sh

  # Install Git
  # #######################
  installGit

  installNodeJs

  # Clean Images
  # #######################
  cleanBuildInstall
}


setup
