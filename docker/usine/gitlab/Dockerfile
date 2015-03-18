#jmorille/gitlab

FROM ubuntu:14.04

# Set correct environment variables.
ENV HOME /root

# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV DEBIAN_FRONTEND noninteractive



# Config proxy env
# #######################
ENV http_proxy http://webcache.groupe.generali.fr:3128
ENV https_proxy $http_proxy
ENV no_proxy *.groupe.generali.fr

ENV HTTP_PROXY $http_proxy
ENV HTTPS_PROXY $http_proxy
ENV NO_PROXY $no_proxy


# #######################
# Install  NGINX
# #######################
ENV GITLAB_VERSION 7.8.4


# Install dependencies
# #######################
RUN apt-get update -qq
RUN apt-get install -yqq openssh-server postfix


# Download and install GitLab
# #######################
# Modules :  http://wiki.nginx.org/Modules
RUN mkdir -p /data && mkdir -p /var/lib
RUN cd /tmp && wget -q -O gitlab.deb  https://downloads-packages.s3.amazonaws.com/ubuntu-14.04/gitlab_${GITLAB_VERSION}-omnibus-1_amd64.deb
RUN dpkg -i /tmp/gitlab.deb

# Configure and start GitLab
# #######################
# http://www.cyberciti.biz/tips/linux-unix-bsd-nginx-webserver-security.html
RUN   gitlab-ctl reconfigure


#EXPOSE 80 23
#VOLUME ["/var/log/gitlab", "/etc/nginx/logs", "/var/lib/nginx", "/etc/nginx/ssl" ]


# Start Command
# #######################
# WORKDIR /etc/nginx/
#CMD ["/usr/sbin/nginx"]
#CMD ["/usr/sbin/nginx", "-g", "daemon off;"]


