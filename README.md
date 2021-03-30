# EduOJ Frontend

这个仓库存储EduOJ的前端代码。

EduOJ是一个面向教学的在线评测系统，将程序在线评测和编辑管理功能结合到一起，实现高效的班级、作业管理，作业自动检验。

> 目前应用于北京工业大学。

## 部署

### 下载 & 构建

```sh
sudo apt-get update
sudo apt-get install -y git
git clone https://github.com/EduOJ/frontend.git
cd frontend
yarn build
```

### 配置

复制`frontend/src/config/config.example.js`，如有需要可修改其中的`title`和`apiUrl`

```
cp src/config/config.example.js src/config/config.js
```

### 部署

把`dist`部署到`nginx`根目录，并配置`/api`目录到后端的反向代理

### 文档 

我们的文档还在施工中。