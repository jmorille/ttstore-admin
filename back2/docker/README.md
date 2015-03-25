# Load Images
```shell
docker load --input nginx-webapp.tar 
```

# Build Images
```shell
cp docker/Dockerfile dist
cd dist
docker build --rm -t jmorille/nginx-webapp .
```


# Run Images
```shell
docker run -ti  jmorille/nginx-webapp
```
