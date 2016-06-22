# Clean Images
```shell
docker rm -fv $(docker ps -a -q)
```

# Remove Images
```shell
docker rmi $(docker images -q)
docker rmi $(docker images -qf "dangling=true")
```

# Remove untagged images
```shell
docker rmi $(docker images | grep "^<none>" | awk "{print $3}")
``` 

# Kill containers and remove them:
```shell
docker rm $(docker kill $(docker ps -q))
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
