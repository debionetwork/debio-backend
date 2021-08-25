#!/bin/sh
docker build -t debio_backend_v2_dev . -f Dockerfile
docker tag debio_backend_v2_dev hub.debio.network/debio_backend_v2_dev:latest
docker push hub.debio.network/debio_backend_v2_dev:latest

