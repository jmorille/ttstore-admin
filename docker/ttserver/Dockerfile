#jmorille/ttserver
FROM ubuntu:14.04

# Set correct environment variables.
ENV HOME /root

# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV DEBIAN_FRONTEND noninteractive



# Config proxy env
# #######################
# ENV http_proxy="http://webcache.groupe.generali.fr:3128" https_proxy="$http_proxy" no_proxy="*.groupe.generali.fr" HTTP_PROXY="$http_proxy" HTTPS_PROXY="$http_proxy" NO_PROXY="$no_proxy"



# Config NodeJS env
# #######################
ENV NODE_VERSION="v0.12.0"
ENV NODE_HOME="/opt/nodejs/node-$NODE_VERSION-linux-x64"
ENV PATH="$PATH:$NODE_HOME/bin"


# Install NodeJS env
# #######################
ADD build build
RUN exec /build/install.sh


# Expose
# #######################
EXPOSE 8000
VOLUME ["/opt/ttserver", "/log"]


# Start Command
# #######################
CMD [ "node", "/opt/ttserver/server.js" ]
