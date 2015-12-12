# Build Image
docker build --rm  -t jmorille/ttserver .

# Connect Image
docker run -i -t jmorille/ttserver /bin/bash

