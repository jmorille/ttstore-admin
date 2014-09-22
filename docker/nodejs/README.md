# Build Image
docker build --rm  -t jmorille/nodejs .

# Connect Image
docker run -i -t jmorille/nodejs /bin/bash

