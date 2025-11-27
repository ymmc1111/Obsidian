#!/bin/bash
set -e

echo "Applying Kubernetes manifests..."
kubectl apply -k k8s/base

echo "Deployment initiated. Check status with: kubectl get pods -n pocket-ops"
