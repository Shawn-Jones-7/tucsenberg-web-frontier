#!/usr/bin/env bash
set -euo pipefail

# 1. 切到当前 workspace 根目录（Conductor 会设这个环境变量）
cd "${CONDUCTOR_WORKSPACE_PATH:-.}"

echo "[setup] workspace: $(pwd)"

# 2. 按 .nvmrc 设置 Node 版本，如果你本机有 nvm
if [ -f ".nvmrc" ] && command -v nvm >/dev/null 2>&1; then
  echo "[setup] using Node version from .nvmrc"
  nvm install "$(cat .nvmrc)"
  nvm use "$(cat .nvmrc)"
fi

# 3. 确保有 corepack
if ! command -v corepack >/dev/null 2>&1; then
  echo "[setup] corepack not found, installing via npm"
  npm install -g corepack
fi

echo "[setup] enabling corepack"
corepack enable

# 4. 激活指定版本 pnpm（和主支保持一致）
corepack prepare pnpm@10.13.1 --activate || true

# 5. 直接用 pnpm 安装依赖，不再兜到 npm
echo "[setup] installing dependencies with pnpm"
pnpm install

echo "[setup] dependency installation finished"