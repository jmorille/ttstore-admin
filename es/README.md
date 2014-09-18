== Build Images
docker build --rm -t jmorille/elasticsearch .

== View Images
docker run -ti jmorille/elasticsearch /bin/bash

== Run Images
docker run -i -t -p 9200:9200 -p 9300:9300 \
  -v /opt/elasticsearch/logs:/data2/ttstore/logs \
  -v /opt/elasticsearch/data:/data2/ttstore/data \
   jmorille/elasticsearch
 
 
 
