ttstore-admin
================

See the [component page](http://jmorille.github.io/ttstore-admin) for more information.

## Getting Started

We've put together a [guide for ttstore-admin](http://www.polymer-project.org/docs/start/reusableelements.html) to help get you rolling.

== Vulcanize
Issue : https://github.com/Polymer/polymer/issues/706


## Run Local Server
python -m SimpleHTTPServer

"transform" : {
     "script": "ctx._source['suggest_name'] = ctx._source['firstname']"
   },

## Init Elasticsearch
 curl -XDELETE "http://localhost:9200/users?pretty"
  

curl -XPUT http://localhost:9200/users?pretty  --data-binary @es-settings.json
   

## Inject Data Users 
curl -XPUT localhost:9200/_bulk?pretty --data-binary @data-users.json

curl -XPUT localhost:9200/_bulk --data-binary @data-user-vol1.json

curl -XPUT 'http://localhost:9200/users/user/10?pretty' -d '{
    "firstname" : "gandalf",
    "lastname" : "Le Gris",
    "email" : "gandalf@yahoo.com"
}
';

curl -XGET "http://localhost:9200/users/user/10?pretty&_source_transform&fields=firstname,suggest,email,lastname"


 