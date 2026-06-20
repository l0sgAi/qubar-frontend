# 趣吧配套前端

与我的后端项目[car-rental-backend](https://github.com/l0sgAi/interestBar "趣吧后端")配套的前端代码，使用 `VUE3`+`javascript`+`NaiveUI`开发，`Vite`构建。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Naive UI** - 优秀的 Vue 3 组件库

## 项目结构

```bash
interestBar-frontend/
├── src/
│   ├── assets/          # 静态资源
│   │   └── main.css     # 全局样式
│   ├── router/          # 路由配置
│   │   └── index.js     # 路由定义
│   ├── views/           # 页面组件
│   │   ├── Login.vue    # 登录页面
│   │   └── Success.vue  # 登录成功页面
│   ├── App.vue          # 根组件
│   └── main.js          # 应用入口
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 项目配置
```

### 使用方式

使用`vscode`打开项目，在终端运行命令：

```bash
npm install

npm run dev
```

注：需要 `NodeJS`环境。

如果成功，会出现如下提示，此时访问[前端网页](http://localhost:5173/ "前端地址")即可。

```bash
 VITE v6.3.5  ready in 381 ms



  ➜  Local:   http://localhost:5173/

  ➜  Network: use --host to expose

  ➜  press h + enter to show help
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

该项目未来也被部署在`https://l0sgai.github.io/interestBar/`

## 功能特性

- ✨ 优雅的 UI 设计，采用玻璃态效果
- 🎨 动态背景装饰，提供流畅的视觉体验
- 🔐 Google 账号登录集成
- 💾 本地存储 Token 管理
- 📱 响应式设计，适配各种设备
- 🎯 使用 NaiveUI 组件库，开箱即用

## 后端配置

登录接口指向 ngrok 后端地址，如需修改，请编辑 [src/views/Login.vue](src/views/Login.vue) 中的登录 URL。
