#!/bin/bash

# ==============================
# DUHIGURE MU MIRYANGO CI/CD Script (Minikube Ready with Tunnel)
# ==============================
set -e

APP_NAME=exam-duhigure
IMAGE_NAME=examapp:latest
K8S_NAMESPACE=duhigure
INGRESS_HOST=www.duhigure.rw

# 1. Switch Docker CLI to Minikube
echo "Switching Docker to Minikube..."
eval $(minikube docker-env)

# 2. Build Docker image
echo "Building Docker image inside Minikube..."
docker build -t $IMAGE_NAME .

# 3. Ensure namespace exists
kubectl get ns $K8S_NAMESPACE >/dev/null 2>&1 || kubectl create ns $K8S_NAMESPACE

# 4. Apply Kubernetes manifests
echo "Applying Deployment..."
kubectl apply -f k8s/deployment.yaml -n $K8S_NAMESPACE
echo "Applying Service..."
kubectl apply -f k8s/service.yaml -n $K8S_NAMESPACE
echo "Applying Ingress..."
kubectl apply -f k8s/ingress.yaml -n $K8S_NAMESPACE

# 5. Restart deployment
echo "Restarting deployment..."
kubectl rollout restart deployment/$APP_NAME -n $K8S_NAMESPACE

# 6. Wait for rollout to finish
echo "Waiting for rollout to finish..."
kubectl rollout restart deployment/$APP_NAME -n $K8S_NAMESPACE
kubectl rollout status deployment/$APP_NAME -n $K8S_NAMESPACE

# 7. Start Minikube tunnel in background for Ingress
echo "Starting Minikube tunnel for Ingress..."
if ! pgrep -f "minikube tunnel" >/dev/null; then
    sudo nohup minikube tunnel >/dev/null 2>&1 &
    echo "Minikube tunnel started in background (requires sudo for ports 80/443)."
else
    echo "Minikube tunnel already running."
fi

# 8. Add Ingress host mapping if not exists
if ! grep -q "$INGRESS_HOST" /etc/hosts; then
    echo "Adding $INGRESS_HOST to /etc/hosts..."
    echo "$(minikube ip) $INGRESS_HOST" | sudo tee -a /etc/hosts
fi

# 9. Print access info
NODE_PORT=$(kubectl get svc $APP_NAME-service -n $K8S_NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')
echo ""
echo "==============================="
echo "Deployment complete!"
echo "NodePort URL: http://$(minikube ip):$NODE_PORT"
echo "Ingress URL: http://$INGRESS_HOST"
echo "==============================="
