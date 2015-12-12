



## Init Elasticsearch
curl -XDELETE "http://localhost:9200/users?pretty"

curl -XPUT http://localhost:9200/userauth?pretty  --data-binary @userauth-settings.json

curl -XPUT localhost:9200/_bulk --data-binary @data-users.json
