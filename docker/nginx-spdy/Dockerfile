#jmorille/nginx-spdy

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
ENV NGINX_VERSION 1.7.10


# Install dependencies
# #######################
RUN apt-get update -qq
RUN apt-get install -yqq build-essential zlib1g-dev libpcre3 libpcre3-dev openssl libssl-dev libperl-dev wget zip ca-certificates


# From instructions here: https://github.com/pagespeed/ngx_pagespeed
# Download ngx_pagespeed
# RUN cd /tmp && wget -q -O - https://github.com/pagespeed/ngx_pagespeed/archive/v1.8.31.3-beta.tar.gz | tar zxf -
# RUN cd /tmp/ngx_pagespeed-1.8.31.3-beta/ && wget -q -O - https://dl.google.com/dl/page-speed/psol/1.8.31.3.tar.gz | tar zxf -
# In build --add-module=/tmp/ngx_pagespeed-1.8.31.3-beta


# Download and build nginx
# #######################
# Modules :  http://wiki.nginx.org/Modules
RUN mkdir -p /data && mkdir -p /var/lib
RUN cd /tmp && wget -q -O - http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz | tar zxf -

# Secure Ngnix version
# #######################
# http://www.cyberciti.biz/tips/linux-unix-bsd-nginx-webserver-security.html
RUN sed -i'' 's/static char ngx_http_server_string\[\] = "Server: nginx" CRLF;/static char ngx_http_server_string\[\] = "Server: Microsoft-IIS\/7\.5" CRLF;/' /tmp/nginx-${NGINX_VERSION}/src/http/ngx_http_header_filter_module.c
RUN  sed -i'' 's/static char ngx_http_server_full_string\[\] = "Server: " NGINX_VER CRLF;/static char ngx_http_server_full_string\[\] = "Server: Microsoft-IIS\/7\.5" CRLF;/' /tmp/nginx-${NGINX_VERSION}/src/http/ngx_http_header_filter_module.c
RUN  grep 'static char ngx_http_server' /tmp/nginx-${NGINX_VERSION}/src/http/ngx_http_header_filter_module.c

RUN  sed -i'' 's/\#define NGINX_VER          "nginx\/" NGINX_VERSION/#define NGINX_VER          "Microsoft-IIS\/7\.5"/' /tmp/nginx-${NGINX_VERSION}/src/core/nginx.h
RUN  grep 'NGINX_VER' /tmp/nginx-${NGINX_VERSION}/src/core/nginx.h

# Compile Ngnix
# #######################
RUN cd /tmp/nginx-${NGINX_VERSION} \
	&& ./configure --prefix=/etc/nginx/ --sbin-path=/usr/sbin/nginx \
	  --http-client-body-temp-path=/var/lib/nginx/body_temp \
      --http-proxy-temp-path=/var/lib/nginx/proxy_temp \
      --http-fastcgi-temp-path=/var/lib/nginx/fastcgi_temp  \
      --http-scgi-temp-path=/var/lib/nginx/scgi_temp  \
      --http-uwsgi-temp-path=/var/lib/nginx/uwsgi_temp \
      --user=www-data \
      --group=www-data \
      --with-http_ssl_module \
      --with-http_stub_status_module \
      --with-http_realip_module \
      --with-http_spdy_module \
      --with-http_gzip_static_module \
      --with-http_gunzip_module \
      --with-ipv6 \
      --with-pcre   \
      --without-http_autoindex_module \
      --without-http_ssi_module \
	&& make install

# Cleanup
# #######################
#RUN rm -Rf /tmp/ngx_pagespeed-1.8.31.3-beta
RUN rm -Rf /tmp/nginx-${NGINX_VERSION}


# TLS Certificat
# #######################
ADD build/ssl /etc/nginx/ssl


# Configure nginx
# #######################
COPY build/nginx.conf /etc/nginx/conf/nginx.conf
COPY /build/sites-enabled /etc/nginx/sites-enabled


# Install build
# #######################
# ADD build build
# RUN [ "/build/install.sh" , "setup" ]


# forward request and error logs to docker log collector
# #######################
#RUN ln -sf /dev/stdout /var/log/nginx/access.log
#RUN ln -sf /dev/stderr /var/log/nginx/error.log


# Expose
# #######################

EXPOSE 80 443
VOLUME ["/data/wwww", "/etc/nginx/logs", "/var/lib/nginx", "/etc/nginx/ssl" ]


# Start Command
# #######################
# WORKDIR /etc/nginx/
#CMD ["/usr/sbin/nginx"]
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]


