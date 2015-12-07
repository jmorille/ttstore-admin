#jmorille/elasticsearch

FROM elasticsearch:latest


# Config Elasticsearch
# #######################
ENV ES_HEAP_SIZE="4g"

# Install plugins
# #######################
RUN /usr/share/elasticsearch/bin/plugin install mobz/elasticsearch-head \
    /usr/share/elasticsearch/bin/plugin install lmenezes/elasticsearch-kopf


# Expose
# #######################
EXPOSE 9200 9300
VOLUME ["/usr/share/elasticsearch/data", "/var/log/elasticsearch", "/work", "/tmp"]


# Start Command
# #######################
# CMD [ "/opt/elasticsearch/bin/elasticsearch" ]






