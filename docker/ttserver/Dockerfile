#jmorille/ttserver
#FROM ubuntu:14.04
FROM debian:latest

# Set correct environment variables.
# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV HOME="/root" DEBIAN_FRONTEND="noninteractive"



# Config NodeJS env
# #######################
ENV NODE_VERSION="v0.12.0"
ENV NODE_HOME="/opt/nodejs/node-$NODE_VERSION-linux-x64"
ENV PATH="$PATH:$NODE_HOME/bin"

# Expose
# #######################
EXPOSE 8000
VOLUME ["/opt/ttserver", "/log"]


# Start Command
# #######################
CMD [ "node", "/opt/ttserver/src/server.js" ]

# Install NodeJS env
# #######################
ADD build build
RUN exec /build/install.sh



