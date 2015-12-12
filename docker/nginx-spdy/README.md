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


```
     location /esd/ {
        rewrite  ^/esd/(.*)  /$1 break;

        proxy_pass http://lb-es; # Load balance the URL location "/" to the upstream lb-subprint
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # proxy_read_timeout 600s;
        # proxy_buffering off;
     }
     location /head {
        proxy_pass http://lb-es/_plugin/head; # Load balance the URL location "/" to the upstream lb-subprint
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
     }
```
