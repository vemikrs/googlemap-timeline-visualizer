#!/bin/bash
# build-prod.sh - 本番ビルドスクリプト
# ビルド番号: {version}-{YYYYMMDD}-{NNN}
set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Timeline Visualizer - Production Build ===${NC}"

# 1. ワーキングツリー差分の確認
echo -e "\n${YELLOW}[1/7] Checking for uncommitted changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Error: Uncommitted changes detected.${NC}"
  echo "Please commit or stash your changes before building."
  git status --short
  exit 1
fi
echo -e "${GREEN}✓ Working tree is clean${NC}"

# 2. 未Pushコミットの確認
echo -e "\n${YELLOW}[2/7] Checking for unpushed commits...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
UNPUSHED=$(git log origin/${CURRENT_BRANCH}..HEAD --oneline 2>/dev/null || echo "")
if [ -n "$UNPUSHED" ]; then
  echo -e "${RED}Error: Unpushed commits detected.${NC}"
  echo "Please push your commits before building:"
  echo "$UNPUSHED"
  exit 1
fi
echo -e "${GREEN}✓ All commits are pushed${NC}"

# 3. リモートからPull（タグ含む）
echo -e "\n${YELLOW}[3/7] Fetching remote tags and branches...${NC}"
git fetch --tags --prune
git pull --ff-only || true
echo -e "${GREEN}✓ Remote synced${NC}"

# 4. バージョンと日付（JST）を取得
echo -e "\n${YELLOW}[4/7] Generating build number...${NC}"
VERSION=$(node -p "require('./package.json').version")
# JST日付を取得 (UTC+9)
DATE_JST=$(TZ='Asia/Tokyo' date +%Y%m%d)

# 今日のビルドタグをカウントして連番を決定
EXISTING_TAGS=$(git tag -l "v${VERSION}-${DATE_JST}-*" 2>/dev/null | wc -l)
BUILD_NUM=$(printf "%03d" $((EXISTING_TAGS + 1)))
BUILD_TAG="v${VERSION}-${DATE_JST}-${BUILD_NUM}"
BUILD_INFO="Build: ${VERSION}-${DATE_JST}-${BUILD_NUM}"

echo -e "${GREEN}✓ Build tag: ${BUILD_TAG}${NC}"
echo -e "  Build info: ${BUILD_INFO}"

# 5. ビルド（環境変数でビルド情報を渡す）
echo -e "\n${YELLOW}[5/7] Building...${NC}"
export VITE_BUILD_TAG="${BUILD_TAG}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Build failed.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

# 6. Gitタグを作成
echo -e "\n${YELLOW}[6/7] Creating git tag...${NC}"
git tag -a "${BUILD_TAG}" -m "Production build ${BUILD_INFO}"
echo -e "${GREEN}✓ Tag created: ${BUILD_TAG}${NC}"

# 7. タグをPush
echo -e "\n${YELLOW}[7/7] Pushing tag to remote...${NC}"
git push origin "${BUILD_TAG}"
echo -e "${GREEN}✓ Tag pushed${NC}"

echo -e "\n${GREEN}=== Build Complete ===${NC}"
echo -e "Tag: ${BUILD_TAG}"
echo -e "Build info: ${BUILD_INFO}"
