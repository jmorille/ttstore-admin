#jmorille/elasticsearch

FROM ubuntu:14.04

# Set correct environment variables.
ENV HOME /root

# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV DEBIAN_FRONTEND noninteractive



# Config proxy env
# #######################
#ENV http_proxy http://172.30.3.11:3128
#ENV https_proxy $http_proxy
#ENV no_proxy *.groupe.generali.fr

#ENV HTTP_PROXY $http_proxy
#ENV HTTPS_PROXY $http_proxy
#ENV NO_PROXY $no_proxy

# Expose
# #######################

EXPOSE 9200 9300

VOLUME ["/opt/elasticsearch/log", "/opt/elasticsearch/data"]

RUN [ "/opt/elasticsearch/bin/elasticsearch" ]


# Install build
# #######################
ADD build build
RUN [ "/build/install.sh" ]