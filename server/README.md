



## Init Elasticsearch
curl -XDELETE "http://localhost:9200/users?pretty"

curl -XPUT http://localhost:9200/users?pretty  --data-binary @es-settings.json

curl -XPUT localhost:9200/_bulk --data-binary @data-users.json
