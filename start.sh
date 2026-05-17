#!/bin/bash

# MythWriter 一键启动脚本 - 同时启动后端和前端

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/document"
BACKEND_DIR="$ROOT_DIR/server"
BACKEND_PORT=3000
FRONTEND_PORT=1420

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

# 关闭已占用的端口
kill_port() {
  local port=$1
  local pid=$(lsof -ti :"$port" 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "[端口] 检测到端口 $port 已被占用 (PID: $pid)，正在释放..."
    kill -9 $pid 2>/dev/null
    sleep 0.5
  fi
}

# 检查是否支持桌面端
has_cargo() {
  command -v cargo &>/dev/null
}

echo "==============================="
echo "  MythWriter 一键启动"
echo "==============================="

# 释放端口
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# 启动后端
echo "[后端] 启动 API 服务 (port $BACKEND_PORT)..."
cd "$BACKEND_DIR" && npm run dev &
BACKEND_PID=$!

# 启动前端
if has_cargo; then
  echo "[桌面端] 启动 Tauri 应用..."
  cd "$FRONTEND_DIR" && pnpm tauri dev &
  FRONTEND_PID=$!
  echo ""
  echo "后端 API: http://localhost:$BACKEND_PORT"
  echo "后端健康检查: http://localhost:$BACKEND_PORT/api/health"
else
  echo "[前端] Rust/Cargo 未安装，使用网页模式 (port $FRONTEND_PORT)..."
  echo "[前端] 如需桌面端，请安装 Rust: https://rustup.rs"
  cd "$FRONTEND_DIR" && pnpm dev &
  FRONTEND_PID=$!
  echo ""
  echo "前端: http://localhost:$FRONTEND_PORT"
  echo "后端 API: http://localhost:$BACKEND_PORT"
  echo "后端健康检查: http://localhost:$BACKEND_PORT/api/health"
fi

echo ""
echo "按 Ctrl+C 停止所有服务"
echo "==============================="

wait
