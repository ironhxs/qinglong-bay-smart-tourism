@echo off
echo 正在启动青龙湾生态智能系统...

REM 设置环境变量
set PORT=5000

REM 检查数据库目录是否存在
if not exist "database" (
    echo 创建数据库目录...
    mkdir database
)

REM 检查数据库文件是否存在
if not exist "database\qlb.db" (
    echo 初始化数据库...
    
    REM 复制示例数据库（如果存在）
    if exist "backend\database\qlb.db" (
        copy "backend\database\qlb.db" "database\"
        echo 已复制示例数据库
    ) else (
        echo 未找到示例数据库，将创建空数据库
        REM 这里可以添加数据库初始化命令
    )
)

echo 启动应用...
echo 前端将在: http://localhost:3000
echo 后端将在: http://localhost:5000

REM 启动应用
npm run dev

echo 按任意键退出...
pause 