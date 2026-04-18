# Playwright 配置说明

## 浏览器安装位置

Playwright 的 Chromium 浏览器安装在项目目录下的 `.playwright-browsers` 文件夹中。

## 环境变量

在 `.env.local` 中设置：

```bash
PLAYWRIGHT_BROWSERS_PATH=./.playwright-browsers
```

## 安装浏览器

项目会在 `bun install` 后自动安装 Chromium（通过 postinstall 脚本）。

手动安装：

```bash
export PLAYWRIGHT_BROWSERS_PATH=./.playwright-browsers
bunx playwright install chromium
```

## Git 忽略

`.playwright-browsers` 目录已添加到 `.gitignore`，不会提交到版本控制。

## Vercel 部署

在 Vercel 上部署时，代码会自动使用 `playwright-aws-lambda`，无需安装浏览器。
