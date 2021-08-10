#!/bin/sh
docker build -t debio_backend_v2_dev . -f Dockerfile
docker tag debio_backend_v2_dev asia.gcr.io/degenics/debio_backend_v2_dev:latest
docker push asia.gcr.io/degenics/debio_backend_v2_dev:latest

