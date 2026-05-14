@echo off
echo 正在检查青龙湾系统环境...

echo 1. Node.js 版本:
node --version

echo 2. NPM 版本:
npm --version

echo 3. 检查目录结构:
dir

echo 4. 检查数据库:
dir database

echo 5. 检查前端:
dir frontend

echo 6. 检查后端:
dir backend

echo 7. 检查 package.json:
type package.json

echo 环境检查完成!
pause 