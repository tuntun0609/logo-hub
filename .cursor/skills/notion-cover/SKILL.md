---
name: notion-cover
description: Generate Notion-style illustration covers with centered line-art illustrations and generous white space. Use when the user asks to create a cover, banner, hero image, or illustration in Notion aesthetic style, or mentions "notion cover", "notion banner", "illustration cover", or "留白封面".
---

# Notion 插画风格封面生成

生成以线条插画为中心、大面积留白的 Notion 风格封面图。

## 设计原则

1. **大面积留白** — 插画仅占画面 30-40%，其余为纯净背景
2. **居中构图** — 插画元素位于画面视觉中心
3. **线条插画** — 细线描边、极简造型、无多余装饰
4. **克制配色** — 最多 2-3 种颜色 + 黑色线条，背景纯白或极浅色
5. **呼吸感** — 元素之间保持充足间距，不堆叠

## 封面尺寸

| 用途 | 尺寸 | 比例 |
|------|------|------|
| Notion 页面封面 | 1500×600 | 5:2 |
| 博客封面 | 1200×630 | ~1.9:1 |
| 社交媒体 | 1200×675 | 16:9 |

默认使用 **1500×600**（Notion 标准封面比例）。

## 生成方式

根据场景选择合适的方式：

### 方式一：AI 图片生成（推荐用于复杂插画）

使用 GenerateImage 工具，按以下 prompt 模板构建描述：

```
模板结构：
[主题描述] + [风格约束] + [构图约束] + [配色约束]
```

**Prompt 构建规则：**

1. 主题描述：用简洁英文描述插画主体
2. 风格约束：`minimal line art illustration, thin clean outlines, simple geometric shapes, Notion-style aesthetic`
3. 构图约束：`centered composition, vast white negative space around the subject, subject occupies only 30-40% of the canvas, clean white background`
4. 配色约束：`limited color palette of 2-3 muted colors with black outlines, soft pastel accents`

**完整 prompt 示例：**

```
A minimal line art illustration of a potted plant with simple leaves, thin clean outlines, simple geometric shapes, Notion-style aesthetic. Centered composition with vast white negative space around the subject, the plant occupies only 30-40% of the canvas. Clean white background. Limited color palette: sage green and terracotta with black outlines. No text, no borders, no shadows.
```

**必须附加的否定约束：**
- `No text, no borders, no shadows, no gradients, no complex textures`

### 方式二：SVG/HTML 代码生成（推荐用于简单图形）

生成可编辑的 SVG 封面，适合简洁的几何线条插画。

**SVG 模板结构：**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 600">
  <!-- 纯白背景 -->
  <rect width="1500" height="600" fill="#FFFFFF"/>

  <!-- 插画组：居中放置，占画面 30-40% -->
  <g transform="translate(750, 300)" stroke="#2D2D2D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- 插画元素在此 -->
  </g>
</svg>
```

**SVG 设计约束：**
- `stroke-width`: 1.5-2.5px
- `stroke`: 使用 `#2D2D2D`（柔和黑）而非纯黑
- `fill`: 大部分元素 `none`，仅少量色块填充
- 所有元素用 `<g>` 包裹并通过 `translate` 居中

## 配色方案参考

| 主题 | 主色 | 辅色 | 线条色 |
|------|------|------|--------|
| 自然/植物 | `#7BAE7F` 草绿 | `#C17F59` 陶土 | `#2D2D2D` |
| 科技/工具 | `#6B9BD2` 天蓝 | `#F0C987` 暖黄 | `#2D2D2D` |
| 创意/艺术 | `#D4A0C0` 淡紫 | `#F2B880` 杏橘 | `#2D2D2D` |
| 商务/办公 | `#5B8C85` 青绿 | `#E8D5B7` 米色 | `#2D2D2D` |
| 生活/日常 | `#E8A87C` 珊瑚 | `#85CDCA` 薄荷 | `#2D2D2D` |

## 工作流程

1. **确认主题** — 用户提供封面主题（如"读书笔记"、"项目管理"）
2. **选择方式** — 复杂插画用 AI 生成，简单图形用 SVG
3. **匹配配色** — 根据主题从配色方案中选择或由用户指定
4. **生成封面** — 按对应方式的模板生成
5. **确认尺寸** — 默认 1500×600，用户可指定其他尺寸

## 常见主题 Prompt 速查

| 主题 | 核心插画元素 |
|------|-------------|
| 读书笔记 | an open book with a few floating pages |
| 项目管理 | a kanban board with simple cards and arrows |
| 旅行日记 | a compass and a simplified mountain landscape |
| 代码开发 | a laptop with code brackets and a coffee cup |
| 日记/随笔 | a pen resting on a notebook with a small flower |
| 食谱/美食 | a bowl with chopsticks and steam lines |
| 音乐 | headphones with floating musical notes |
| 健身运动 | a yoga pose silhouette or simple dumbbell |
| 财务记录 | a piggy bank with a coin and a small chart |
| 学习笔记 | a lightbulb with gears inside |
