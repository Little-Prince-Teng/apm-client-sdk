#!/bin/bash

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  exit 1
fi

echo "Releasing version $VERSION..."

# 更新版本
npm version $VERSION --no-git-tag-version

# 运行测试
npm test

# 构建
npm run build

# 运行类型检查
npm run type-check

# 运行lint
npm run lint

# 提交更改
git add .
git commit -m "chore(release): $VERSION"

# 创建标签
git tag -a "v$VERSION" -m "Release $VERSION"

# 推送到远程
git push origin main
git push origin "v$VERSION"

# 发布到npm
npm publish

echo "Release $VERSION completed successfully!"
