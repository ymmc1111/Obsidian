#!/bin/bash
set -e

echo "Building api-core..."
docker build -f apps/api-core/Dockerfile -t pocket-ops/api-core:latest .

echo "Building web-client..."
docker build -f apps/web-client/Dockerfile -t pocket-ops/web-client:latest .

echo "Building data-pipeline..."
docker build -f apps/data-pipeline/Dockerfile -t pocket-ops/data-pipeline:latest .

echo "Building science-lab..."
docker build -f apps/science-lab/Dockerfile -t pocket-ops/science-lab:latest apps/science-lab

echo "All images built successfully."
