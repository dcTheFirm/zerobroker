helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.service.type=NodePort \
  --set prometheus.service.type=NodePort \
  --set alertmanager.service.type=NodePort