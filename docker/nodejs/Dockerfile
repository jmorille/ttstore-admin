#jmorille/nodejs

FROM ubuntu:14.04

# Set correct environment variables.
ENV HOME /root

# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV DEBIAN_FRONTEND noninteractive



# Config proxy env
# #######################
ENV http_proxy http://172.30.3.11:3128
ENV https_proxy $http_proxy
ENV no_proxy *.groupe.generali.fr

ENV HTTP_PROXY $http_proxy
ENV HTTPS_PROXY $http_proxy
ENV NO_PROXY $no_proxy


ENV NODE_VERSION v0.10.32
ENV NODE_HOME /opt/nodejs/node-$NODE_VERSION-linux-x64
ENV PATH $PATH:$NODE_HOME/bin

ADD build build
RUN exec /build/install.sh

