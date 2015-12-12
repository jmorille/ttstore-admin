#jmorille/elasticsearch

FROM elasticsearch:2.1


# Config Elasticsearch
# #######################
ENV ES_HEAP_SIZE="4g"


# Install plugins
# #######################
RUN /usr/share/elasticsearch/bin/plugin install mobz/elasticsearch-head \
    /usr/share/elasticsearch/bin/plugin install lmenezes/elasticsearch-kopf

# Config Elasticsearch
# #######################
# RUN sed -i'' 's/# network.host: 192.168.0.1/network.host: _non_loopback_/' /etc/elasticsearch/elasticsearch.yml
COPY config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

# Expose
# #######################
EXPOSE 9200 9300
VOLUME ["/usr/share/elasticsearch/data", "/var/log/elasticsearch", "/work", "/tmp"]


# Start Command
# #######################
# CMD [ "/opt/elasticsearch/bin/elasticsearch" ]






