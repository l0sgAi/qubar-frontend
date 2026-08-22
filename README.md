# 趣吧配套前端

与我的后端项目[qubar](https://github.com/l0sgAi/qubar "趣吧后端")配套的前端代码，使用 `VUE3`+`javascript`+`NaiveUI`开发，`Vite`构建。

线上地址：<https://qubar.site>

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Naive UI** - 优秀的 Vue 3 组件库
- **vue-i18n** - 国际化（中/英双语）
- **axios** - HTTP 请求封装
- **md-editor-v3** - Markdown 编辑器
- **cropperjs** - 图片裁剪

## 项目结构

```bash
qubar-frontend/
├── src/
│   ├── api/             # 后端接口封装（auth、post、comment、like、collect、circle、user 等）
│   ├── assets/          # 静态资源（全局样式等）
│   ├── components/      # 通用组件（帖子卡片、圈子卡片、侧边栏、弹窗等）
│   ├── composables/     # 组合式函数（图片上传等）
│   ├── locales/         # 国际化语言包（zh-CN / en-US）
│   ├── router/          # 路由配置
│   ├── utils/           # 工具函数（请求封装、鉴权、游客模式、节流等）
│   ├── views/           # 页面组件
│   │   ├── Home.vue          # 首页帖子流
│   │   ├── Hot.vue           # 热门
│   │   ├── Discover.vue      # 发现（圈子/帖子推荐）
│   │   ├── SearchResults.vue # 搜索结果
│   │   ├── CreatePost.vue    # 发布帖子
│   │   ├── PostDetail.vue    # 帖子详情
│   │   ├── CircleDetail.vue  # 圈子详情
│   │   ├── UserDetail.vue    # 用户主页
│   │   ├── UserProfile.vue   # 个人资料
│   │   ├── Login.vue         # 登录/注册
│   │   └── ...               # Success / Terms / Privacy 等
│   ├── App.vue          # 根组件
│   └── main.js          # 应用入口
├── public/              # 不经过构建的静态文件（CNAME、favicon 等）
├── scripts/             # 构建检查脚本
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 项目配置
```

## 使用方式

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

项目部署于 GitHub Pages，线上地址为 <https://qubar.site>（域名配置见 `public/CNAME`），后端 API 地址为 `https://api.qubar.site`。

## 功能特性

- ✨ 优雅的 UI 设计，采用玻璃态效果
- 🎨 动态背景装饰，提供流畅的视觉体验
- 🔐 Google 账号登录与邮箱密码登录/注册（含找回密码）
- 📝 帖子发布、点赞、收藏、评论，支持 Markdown 编辑与图片上传
- 🌀 兴趣圈子：创建圈子、浏览圈子详情与圈子内帖子
- 🔍 发现页、热门榜与全文搜索
- 👤 用户主页与个人资料编辑（头像裁剪上传）
- 👀 游客模式：未登录可浏览内容，操作时引导登录
- 🌐 中/英文双语切换
- 💾 本地存储 Token 管理
- 📱 响应式设计，适配各种设备
- 🎯 使用 NaiveUI 组件库，开箱即用

## 后端配置

请求封装位于 [src/utils/request.js](src/utils/request.js)，`baseURL` 默认为线上后端 `https://api.qubar.site`，如需切换到本地开发后端，请修改该文件。
