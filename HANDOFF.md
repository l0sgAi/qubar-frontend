# 交接文档 — 移动端 Web 门户适配

> 更新：2026-10-02 · 分支：`feature/mobile-compatibility-20261002`（基于 `main@fbd82b6`）
> 方案与范围：[docs/mobile-adaptation-plan.md](docs/mobile-adaptation-plan.md)（v2.1）。本文件只记录**进度、验证结果、坑和下一步**。

## 一、当前状态

- **P0 基础设施：已完成，全部改动未提交。**
- P1 门户上线：未开始。
- 第十二节待决策全部按推荐方案执行：
  - 断点 ≤ 768px。
  - P1 做纯文本评论。
  - 保留点赞、收藏、加入圈子。
  - 不做圈子抽屉。
  - 在手机上用桌面布局，依赖浏览器的「请求桌面网站」。
  - App 下载入口只预留配置。
  - 复盘数据先用服务端访问日志。

## 二、P0 改了什么

| 类别 | 文件 | 说明 |
|---|---|---|
| 新增 | `src/constants/breakpoints.js` | 断点常量 `BP_MOBILE_MAX = 768`、`MOBILE_QUERY`；移动端外框总开关 **`MOBILE_SHELL_ENABLED = false`** |
| 新增 | `src/composables/useBreakpoint.js` | `matchMedia` 单例，返回只读的 `isMobile` |
| 新增 | `src/composables/useAppShell.js` | `useAppShell()` 返回 `{ offset, mobileShell, contentStyle }`；`useMobileShell()`；侧栏宽度常量 |
| 新增 | `src/components/layout/AppShell.vue` | 多根节点外框：桌面渲染 `AppHeader` + `SideNav`，`v-model:offset`；移动端分支留空，P1 填 |
| 新增 | `src/composables/useUnreadNotice.js` | 未读数单例，按引用计数管理，最后一个消费方卸载 3 秒后才断开；`stopUnreadNotice()` 供登出调用 |
| 新增 | `src/router/mobileMeta.js` | `meta.mobile` 的默认值和 `getMobileMeta(route)` |
| 改 | `src/router/index.js` | 9 个路由加 `meta.mobile`：5 个页面 `supported: false`；帖子详情为 `back` 顶栏、无 TabBar；用户、圈子、搜索为 `back` 顶栏 |
| 改 | `src/components/layout/AppHeader.vue` | 改用 `useUnreadNotice`；删掉自管的 SSE 和事件监听；登出时先 `stopUnreadNotice()` |
| 改 | 9 个页面：Home、Hot、Discover、PostDetail、Notifications、UserProfile、UserDetail、CircleDetail、SearchResults | 原来的 `<AppHeader/>` + `<SideNav .../>` 换成 `<AppShell v-model:offset="offset" />`；内联 offset 样式换成 `contentStyle`；RightSidebar 加 `!mobileShell` 条件 |
| 改 | `index.html` | viewport 加 `viewport-fit=cover`；加 `theme-color` |
| 改 | `src/assets/main.css` | 新增 token：`--safe-top`、`--safe-bottom`、`--mobile-topbar-height`、`--tabbar-height` |
| 改 | `SideNav`、`RightSidebar`、`PostDetail`、`CircleDetail` | 6 处 `height` / `max-height` 加 `100dvh`，保留 `100vh` 作为回退 |
| 测试 | `tests/setup.js` | 加可控的 `matchMedia` stub，导出 `setMatchMedia`、`mediaListenerCount` |
| 测试 | 新增 5 个 spec | `useBreakpoint`、`useAppShell`、`useUnreadNotice`、`components/AppShell`、`router/mobileMeta` |
| 配置 | `vitest.config.js` | 3 个新 composable 加进高门槛组；全局基线提高到 52 / 52 / 89 / 61（只升不降） |
| 本地 | `.claude/launch.json` | 预览用的 dev server 配置（端口 5173）。是否提交由你决定 |
| 文档 | `docs/mobile-adaptation-plan.md` | 5.3 / 5.5 按实际实施改写，P0 标记为已实施 |

**和计划初稿的偏差**（文档 5.3 已同步）：

- `AppShell` **不再包裹页面内容**，只渲染外框，页面内容作为兄弟节点。
  - 原因：9 个页面的 `content-wrapper` / `main-content` 样式都写在各页 scoped CSS 里，改由 `AppShell` 渲染这些容器会让样式失效。
  - 结果：桌面 DOM 与迁移前逐节点一致；跨断点切换时页面内容天然不会 remount。
- 手机断点下覆盖 `--header-height` 推迟到 P1，避免压扁 P0 阶段手机上仍在用的桌面顶栏。
- `AppShell` 不负责启动未读数连接，改为由各消费方（`AppHeader`，P1 起加 `MobileTabBar`）自己 acquire。

## 三、验证结果

- **单测**：14 个文件、234 个用例全部通过（原有 166 个，新增 68 个）。新增的 4 个模块覆盖率均为 100%。
- **覆盖率门槛**：通过。全局 lines 从 46% 升到 52%。
- **`npm run build`**：通过。超过 500 kB 的 chunk 警告是原来就有的，与本次改动无关。
- **桌面回归**：
  - 方法：1440×900 视口，访客态，分别在迁移前后（迁移前用 `git stash` 回到原代码）采集 7 个页面的页面根节点子元素（标签、类名、`style` 属性）、各容器位置和宽度，加上收起侧栏后的同样数据，然后逐项对比。
  - 覆盖页面：Home、Hot、Discover、Search、PostDetail、CircleDetail、UserDetail。
  - 结果：**全部一致**。PostDetail 收起侧栏后的位置差异，已确认是测量时 CSS 过渡还没跑完造成的；关掉过渡后迁移前后一致。控制台无报错。
- **没有验证到的**：
  - Notifications 和 UserProfile 需要登录，没在浏览器里看过。它们的改动方式与其他页面相同，属于同一类机械替换。
  - 1920、1280、1024 三档宽度没有测。
  - 登录后的未读数：SSE 不随页面跳转断开、登出后立即断开。这部分只有单测覆盖，没有实测。

## 四、坑（接手前必读）

1. **本地 Node 26 下单测会全部报 `localStorage.clear` undefined。** 这是原来就有的问题：Node 内置的 Web Storage 全局变量遮住了 jsdom 的实现。CI 用 Node 20/22，不受影响。本地这样跑：
   ```bash
   NODE_OPTIONS=--no-experimental-webstorage npm run check
   ```
   可以考虑以后在 `package.json` 的脚本或 `vitest.config.js` 里统一处理。
2. **本地 `node_modules` 原先缺 devDependencies**（没装 vitest）。已经执行过 `npm ci`。注意不要用 `npx vitest`，它会临时拉取 vitest 5，和项目锁定的 3.x 不一致。
3. **浏览器预览面板隐藏时，`requestAnimationFrame` 会被挂起**，导致 `App.vue` 里路由 `<Transition>` 的离场动画卡住，页面停在旧路由。CSS 过渡也会停住。用浏览器自动化验收时：每个页面整页加载（不要在 SPA 内跳转），或者先注入 `*{transition:none!important}` 再测量。这不是代码 bug。
4. **`MOBILE_SHELL_ENABLED` 是总开关。** P1 开发期间可以本地临时改成 `true` 调试，但只有 P1 全部完成后才能提交 `true`，否则手机用户会看到没有导航的半成品。
5. **不要把页面内容挪进 `AppShell`**（原因见第二节"和计划初稿的偏差"）。新页面接入的写法：
   ```vue
   <AppShell v-model:offset="offset" />
   <div class="main-content" :style="contentStyle">...</div>
   ```
   ```js
   const { offset, mobileShell, contentStyle } = useAppShell()
   ```
6. **未读数**：
   - 不要在组件里直接调用 `useNoticeStream`，统一走 `useUnreadNotice`，否则会建立第二条 SSE 连接。
   - 新增登出入口时，要先调用 `stopUnreadNotice()`。

## 五、下一步：P1（按顺序）

详见计划文档第六至八节。

1. **`MobileTopBar.vue`**（6.1）：`main` / `back` 两种模式。返回逻辑：有 `history.state.back` 时调用 `router.back()`，否则 `router.replace('/home')`。用 `getMobileMeta(route)` 读取配置。
2. **`MobileTabBar.vue`**（6.2）：登录态四项、访客态三项，角标读 `useUnreadNotice()`。
3. 在 **`AppShell` 的移动端分支**挂上以上两个组件。同时完成两件事：
   - 手机断点下覆盖 `--header-height`。
   - 移动端的 `contentStyle` 加上底部留白（文档 5.5）。
4. **`MobileUnsupported.vue`**（6.3）：
   - 在 `App.vue` 里用 `resolveView` 按条件替换组件。把 `resolveView` 抽成纯函数，便于单测。
   - 在 `src/config/index.js` 加 `appDownloadUrl`。
5. **写入口隐藏**（6.4 的清单），以及**「我的」页**（6.5）。
6. **纯文本评论**（6.6）：
   - 先把 `useCommentSubmit` 从 `CommentEditor.vue` 和 `CommentReplyEditor.vue` 中抽出来，完成桌面回归（带图评论、@ 提及评论、回复根评论、回复某条回复四种场景）。
   - 再新增 `PlainCommentInput.vue`。
   - 实测 `MdPreview` 下单个换行能否显示为换行。
7. **i18n**：新增 `mobile.*` 命名空间，`@` 要写成 `{'@'}`。
8. **9 个页面加 Login 页的样式适配**（第七、八节）：hover 样式包进 `@media (hover: hover)`，去掉写死的宽度，等等。
9. 以上全部完成后，把 `MOBILE_SHELL_ENABLED` 改为 `true`，按第 11.2 节做真机验收：iOS Safari、Android Chrome，并验证「请求桌面网站」能切到桌面布局。

## 六、常用命令

```bash
NODE_OPTIONS=--no-experimental-webstorage npm run check
```

```bash
npm run dev
```
