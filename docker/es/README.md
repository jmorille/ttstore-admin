# Build Images
docker build --rm -t jmorille/elasticsearch .

# View Images
docker run -ti jmorille/elasticsearch /bin/bash

# Run Images
docker run -i -t -p 9200:9200 -p 9300:9300 \
  -v /data2/ttstore/logs:/opt/elasticsearch-1.3.2/logs \
  -v /data2/ttstore/data:/opt/elasticsearch-1.3.2/data \
   jmorille/elasticsearch
 
# Os Configuration

 
 
