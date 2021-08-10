#!/bin/sh
echo "clean up old container ........"
docker stop debio_backend_v2_dev || true && docker rm debio_backend_v2_dev || true
docker rmi hub.debio.network/debio_backend_v2_dev:latest
docker pull hub.debio.network/debio_backend_v2_dev:latest
echo "reload container .............."
docker run -d --network=host --name=debio_backend_v2_dev --env=DEBIOENV=development -v /etc/localtime:/etc/localtime:ro --restart=always hub.debio.network/debio_backend_v2_dev:latest

