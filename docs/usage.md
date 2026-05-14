# 使用指南

## 本地运行
```bash
npm install            # 安装所有工作区依赖
npm run migrate        # 初始化 SQLite 数据库
npm run seed           # 写入示例数据
npm run dev            # 同时启动后端 (4000) 与前端 (3000)
```

浏览器打开 <http://localhost:3000> 查看应用。

## 生产构建
```bash
npm run --workspace frontend build  # 构建前端静态文件
npm run --workspace backend build   # 编译 TypeScript 后端
```

## 常见问题 FAQ
1. **端口被占用**  
   修改 `.env` 中 `PORT` 或 `frontend/.env` 中端口配置。
2. **数据库文件权限**  
   若 Windows 报写入权限，请以管理员身份运行或修改 `database` 目录权限。 