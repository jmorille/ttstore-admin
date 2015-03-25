#!/bin/bash

#DOCKER_REGISTRY_URL=127.0.0.1:5000
#DOCKER_REGISTRY_URL=10.66.16.122:5000
#DOCKER_REGISTRY_URL=lr2te863v.groupe.generali.fr:5000
#DOCKER_REGISTRY_URL=docker-registry.groupe.generali.fr:5000
DOCKER_REGISTRY_URL=178.255.97.203:5000
#DOCKER_REGISTRY_URL=jmorille
PROJECT_NAMESPACE=jmorille
PROJECT_VERSION=0.0.1

function dockerBuild {
      echo ""
      echo "### #################################################### ###"
      echo "### Building docker images : $1"
      echo "### #################################################### ###"
      docker build --rm -t $PROJECT_NAMESPACE/$1 $1/. || exit 1
      echo ""
}


function dockerTagAndPush {
      echo ""
      echo "### #################################################### ###"
      echo "### Tag docker images : $1 to Version $PROJECT_VERSION"
      echo "### #################################################### ###"
      docker tag -f $PROJECT_NAMESPACE/$1 $DOCKER_REGISTRY_URL/$1:$PROJECT_VERSION
      docker push  $DOCKER_REGISTRY_URL/$1
      echo ""
}



function buildDockerRegistryImages {
    dockerBuild docker-registry  || exit 1
}


function buildDockerImages {
   # bower-public
    for v
    in  es ttserver nginx-spdy
    do
      dockerBuild $v  || exit 1
    done
}


function tagDockerImages {
   # bower-public
    for v
    in   es ttserver nginx-spdy
    do
      dockerTagAndPush $v  || exit 1
    done
}

function buildAndTagDockerImages {
  #buildDockerRegistryImages
  buildDockerImages || exit 1
  tagDockerImages || exit 1
}


buildAndTagDockerImages < /dev/tty
