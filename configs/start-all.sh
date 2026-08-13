#!/bin/bash
# Start all services

echo "Starting LLM Proxy..."
cd /root/llm-proxy && node server.mjs &
sleep 2

echo "Starting Code Server..."
export PASSWORD=omvs2026
export PORT=9090
nohup /tmp/code-server-4.100.0-linux-amd64/bin/code-server --bind-addr 0.0.0.0:9090 --auth password --disable-telemetry --disable-update-check > /tmp/code-server.log 2>&1 &
sleep 3

echo "Starting Cloudflare Tunnel..."
nohup /tmp/cloudflared tunnel --url http://localhost:9090 > /tmp/cloudflared.log 2>&1 &
sleep 5

echo "Getting public URL..."
URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflared.log | tail -1)
echo "========================================="
echo "VS Code URL: $URL"
echo "Password: omvs2026"
echo "========================================="
