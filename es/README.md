== Build Images
docker build --rm -t jmorille/elasticsearch .

== View Images
docker run -ti jmorille/elasticsearch /bin/bash

== Run Images
docker run -i -t -p 8080:8080 \
  -v /opt/jetbrains-licence-server/logs:/log/jetbrains-licence-server \
  -v /opt/jetbrains-licence-server/temp:/data/tmp/jetbrains-licence-server \
  -v /opt/jetbrains-licence-server/db:/data/jetbrains-licence-server/db
  generali_ccj/jetbrains-licence-server
