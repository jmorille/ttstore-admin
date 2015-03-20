== Build Images
```shell
cp docker/Dockerfile dist
cd dist
docker build --rm -t jmorille/nginx-webapp .
```


== Run Images
docker run -ti  jmorille/nginx-webapp
