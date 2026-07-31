# OAuth 登录回调配置说明

## 登录流程

### 1. 用户发起登录
用户点击登录按钮，跳转到后端 OAuth 登录接口：

```
https://your-backend.com/auth/google/login
```

### 2. Google 认证
用户在 Google 页面完成认证。

### 3. 后端处理
后端收到 Google 回调后，需要：
1. 处理 OAuth 认证
2. 生成 sa-token
3. **重定向到前端成功页面，并传递 token**

## 后端回调配置（重要！）

### 推荐方式：后端直接重定向带参数

后端处理完 OAuth 后，应该重定向到前端：

```
HTTP 302 Redirect
Location: https://qubar.site/success?token=465f4e12-e538-40a4-98bd-6a50bb337a65&expire=259200&email=user@example.com
```

**示例代码（Go）：**

```go
// OAuth 回调处理
func GoogleCallback(c *gin.Context) {
    // 1. 获取 Google 用户信息
    // 2. 生成 sa-token
    token := "465f4e12-e538-40a4-98bd-6a50bb337a65"
    expire := "259200" // 3天，单位秒

    // 3. 重定向到前端
    redirectURL := fmt.Sprintf(
        "https://qubar.site/success?token=%s&expire=%s&email=%s",
        token,
        expire,
        "user@example.com",
    )
    c.Redirect(http.StatusFound, redirectURL)
}
```

**前端接收：**
[Success.vue:49-126](src/views/Success.vue#L49-L126) 会自动：
1. 从 URL 参数提取 token、expire、email
2. 保存到 localStorage
3. 显示成功消息
4. 1.5秒后自动跳转到 `/home`

### 备选方式：前端自行请求

如果后端返回的是 code，前端会自动：

1. 检测到 URL 中的 `code` 参数
2. POST 到后端 `/auth/google/callback` 交换 token
3. 收到 JSON 响应后保存 token
4. 跳转到主页

**前端会发送的请求：**

```javascript
POST https://api.qubar.site/auth/google/callback
Content-Type: application/json

{
  "code": "4/0ATX87lPy3pP..."
}
```

**后端应返回：**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "expire": "259200",
    "token": "465f4e12-e538-40a4-98bd-6a50bb337a65",
    "email": "user@example.com"
  }
}
```

## 前端路由配置

前端已配置路由：

| 路由 | 用途 |
|------|------|
| `/` | 登录页 |
| `/success` | OAuth 回调成功页 |
| `/home` | 主页（需要登录） |

## Google OAuth 应用配置

在 Google Cloud Console 配置授权重定向 URI：

```
https://qubar.site/success
```

**注意：** 由于使用了 History 模式路由，不需要 `#/`。

## 测试登录流程

1. 访问：`https://qubar.site/`
2. 点击"使用 Google 账号继续"
3. 完成 Google 认证
4. 自动跳转到：`https://qubar.site/success`
5. 显示欢迎信息（带 token 调试信息）
6. 1.5秒后自动跳转到：`https://qubar.site/home`

## Token 使用

登录成功后，所有 API 请求会自动在请求头中携带 token：

```
satoken: 465f4e12-e538-40a4-98bd-6a50bb337a65
```

详见：[src/utils/request.js:15-17](src/utils/request.js#L15-L17)

## 故障排查

### 问题：回调后没有跳转到主页

**检查：**
1. 浏览器控制台是否有错误
2. URL 参数是否包含 token
3. Network 标签查看请求是否成功

### 问题：token 未保存

**检查：**
1. 打开浏览器开发者工具 > Application > Local Storage
2. 查找 `qubar_token` 和 `qubar_token_expire`
3. 如果不存在，检查回调 URL 格式

### 问题：跳转到 /home 后又被重定向回登录页

**原因：** Token 验证失败或未保存成功

**解决：**
1. 检查 localStorage 中是否有 token
2. 检查 token 是否过期
3. 查看路由守卫逻辑

## 开发环境 vs 生产环境

### 开发环境
- URL: `http://localhost:5173/success?token=xxx`
- 后端可以使用 ngrok URL 进行测试

### 生产环境
- URL: `https://qubar.site/success?token=xxx`
- 需要配置正确的 GitHub Pages 域名

## 安全建议

1. **HTTPS 生产环境必须使用 HTTPS**
2. **Token 过期时间** 建议设置为 3-7 天
3. **Token 存储** 使用 localStorage（已实现）
4. **Token 刷新** 可考虑实现 refresh token 机制
