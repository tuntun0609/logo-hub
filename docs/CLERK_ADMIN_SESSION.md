# Clerk 管理员会话（`metadata.role`）

本项目的 `/admin` 与 `/api/admin/*` 依赖 JWT 中的 `sessionClaims.metadata.role === 'admin'`。

## 1. 在 Clerk Dashboard 为用户设置 metadata

在 **Users** 中选择用户 → **Public metadata**（或你打算写入的 metadata），例如：

```json
{ "role": "admin" }
```

## 2. 将会话令牌模板加入 `metadata`

在 Clerk Dashboard → **Sessions** → **Customize session token**（或 JWT templates），在 JSON 中加入：

```json
{
  "metadata": "{{user.public_metadata}}"
}
```

否则服务端 `auth().sessionClaims.metadata` 可能为空，管理员校验会失败。

## 3. 本地开发

确保已配置 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 与 `CLERK_SECRET_KEY`。非管理员访问 `/admin` 或 `/api/admin/*` 会返回 **403**；未登录会跳转登录页。
