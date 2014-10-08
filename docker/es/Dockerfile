#jmorille/elasticsearch

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

ENV ES_HEAP_SIZE 4g


# Install build
# #######################
ADD build build

RUN [ "/build/install.sh" , "setup" ]
#RUN [ "/build/install.sh" , "jdk7" ]
#RUN [ "/build/install.sh" , "es" ]



# Expose
# #######################

EXPOSE 9200 9300
VOLUME ["/opt/elasticsearch-1.3.3/logs", "/opt/elasticsearch-1.3.3/data"]


# Start Command
# #######################
CMD [ "/opt/elasticsearch-1.3.3/bin/elasticsearch" ]
