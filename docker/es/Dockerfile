#jmorille/elasticsearch

#FROM ubuntu:14.04
FROM debian:latest

# Set correct environment variables.
# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV HOME="/root" DEBIAN_FRONTEND="noninteractive"


# Config proxy env
# #######################
# ENV http_proxy="http://webcache.groupe.generali.fr:3128" https_proxy="http://webcache.groupe.generali.fr:3128" no_proxy="*.groupe.generali.fr" HTTP_PROXY="http://webcache.groupe.generali.fr:3128" HTTPS_PROXY="http://webcache.groupe.generali.fr:3128" NO_PROXY="*.groupe.generali.fr"


# Config Elasticsearch
# #######################
ENV ES_HEAP_SIZE="4g"

# Expose
# #######################

EXPOSE 9200 9300
VOLUME ["/data", "/logs", "/work", "/tmp"]


# Start Command
# #######################
CMD [ "/opt/elasticsearch/bin/elasticsearch" ]


# Install build
# #######################
ADD build build
RUN [ "/build/install.sh" , "setup" ]

#RUN [ "/build/install.sh" , "jdk7" ]
#RUN [ "/build/install.sh" , "es" ]




