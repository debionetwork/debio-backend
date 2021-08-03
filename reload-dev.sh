#!/bin/sh
echo "clean up old container ........"
docker stop debio_backend_v2_dev || true && docker rm debio_backend_v2_dev || true
docker rmi asia.gcr.io/degenics/debio_backend_v2_dev:latest
docker pull asia.gcr.io/degenics/debio_backend_v2_dev:latest
echo "reload container .............."
docker run -d --network=host --name=debio_backend_v2_dev --env=DEBIOENV=development -v /etc/localtime:/etc/localtime:ro --restart=always asia.gcr.io/degenics/debio_backend_v2_dev:latest

