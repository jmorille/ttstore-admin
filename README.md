ttstore-admin
================

See the [component page](http://jmorille.github.io/ttstore-admin) for more information.

## Getting Started

We've put together a [guide for ttstore-admin](http://www.polymer-project.org/docs/start/reusableelements.html) to help get you rolling.

== Vulcanize
Issue : https://github.com/Polymer/polymer/issues/706


## Run Local Server
python -m SimpleHTTPServer



## Init Elasticsearch
curl -XPUT http://localhost:9200/users -d '
{
 "mappings" : {
  "_default_" : {
  "_timestamp" : { "enabled": true, "store" : true },
   "properties" : {
    "firstname" : {"type": "string", "index" : "not_analyzed" },
    "lastname" : {"type": "string", "index" : "not_analyzed" },
    "email" : {"type": "string", "index" : "not_analyzed" } 
   }
  }
 }
}
';


curl -XPUT localhost:9200/_bulk --data-binary @data-users.json