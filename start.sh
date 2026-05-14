#!/bin/bash

# ProWriter 一键启动脚本 - 同时启动前端和后端

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/document"
BACKEND_DIR="$ROOT_DIR/server"

cleanup() {
  echo ""
  echo "正在停止所有服务..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "服务已停止"
  exit 0
}

trap cleanup SIGINT SIGTERM

# 检查目录是否存在
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "错误: 前端目录不存在 $FRONTEND_DIR"
  exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
  echo "错误: 后端目录不存在 $BACKEND_DIR"
  exit 1
fi

echo "==============================="
echo "  ProWriter 一键启动"
echo "==============================="

# 启动后端
echo "[后端] 启动 API 服务 (port 3000)..."
cd "$BACKEND_DIR" && npm run dev &
BACKEND_PID=$!

# 启动前端
echo "[前端] 启动 Vite 开发服务器..."
cd "$FRONTEND_DIR" && pnpm dev &
FRONTEND_PID=$!

echo ""
echo "前端: http://localhost:1420"
echo "后端: http://localhost:3000"
echo "后端健康检查: http://localhost:3000/api/health"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "==============================="

wait
