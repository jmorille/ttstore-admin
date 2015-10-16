== Generate Self Signed Certificate
./build/install.sh tlscertif password

==> TODO follow  : https://weakdh.org/sysadmin.html

== Build Images
docker build --rm -t jmorille/nginx-spdy .

== View Images
docker run -ti jmorille/nginx-spdy /bin/bash


== Run Images
docker run -ti -p 80:80 \
  -v /home/a000cqp/project/ttstore-admin/back:/data/wwww \
  -v /data2/ttsore-ngnix/logs:/etc/nginx/logs \
   jmorille/nginx-spdy


== Source
https://github.com/dod91/docker_nginx_spdy



== Security Guide
http://www.nginxtips.com/nginx-security-guide/
