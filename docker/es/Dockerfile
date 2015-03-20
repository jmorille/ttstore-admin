#jmorille/elasticsearch

FROM ubuntu:14.04

# Set correct environment variables.
ENV HOME /root

# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV DEBIAN_FRONTEND noninteractive



# Config proxy env
# #######################
#ENV http_proxy="http://webcache.groupe.generali.fr:3128" https_proxy="$http_proxy" no_proxy="*.groupe.generali.fr" HTTP_PROXY="$http_proxy" HTTPS_PROXY="$http_proxy" NO_PROXY="$no_proxy"


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
VOLUME ["/data", "/logs", "/work", "/tmp"]


# Start Command
# #######################
CMD [ "/opt/elasticsearch/bin/elasticsearch" ]
