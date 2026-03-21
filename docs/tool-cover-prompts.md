# 工具封面图 AI 提示词

适用于 Logo Hub 当前工具卡片封面图生成。

## 统一风格

目标：**简约、骨架屏风、用户一眼能看懂工具用途**；画面为 **黑白手绘线条风**（钢笔/墨水线稿、素描感线框），非彩色扁平插画。

- 比例：`16:10`
- 风格：极简、**手绘线条**、线框感、轻 UI、留白充足；可略带不规则笔触，忌数码矢量圆滑过度
- 颜色：**仅黑白与灰阶**，用深浅线与留白区分层次，不用彩色色块作强调
- 构图：主体居中，避免复杂场景
- 要求：**不要文字、不要水印、不要真实照片感**

### 通用基础提示词

```text
minimalist product cover, black and white hand-drawn line art, pen and ink sketch style, loose sketchy linework, monochrome only, skeleton screen metaphor, clean geometric layout, soft paper or light gray wash background optional, wireframe panels as ink lines, lightweight UI placeholder composition, clear central metaphor, strong visual hierarchy, illustration not photo, no photorealism, no clutter, no text, no letters, no watermark, no logo, no full color, modern SaaS cover sketch, 16:10 aspect ratio
```

### 通用负面提示词

```text
text, typography, letters, words, watermark, logo, color, colorful, full color, vibrant hues, gradients for decoration, overly detailed, photorealistic, 3d rendering, glossy, noisy background, cluttered layout, complex scene, people, hands, realistic objects, heavy shadows, neon, cyberpunk, excessive decoration
```

---

## 1. Icon Maker

**核心表达**：选择图标 + 调整背景/渐变 + 导出 App 图标。

```text
minimalist product cover for an icon maker tool, black and white hand-drawn line art, pen sketch, skeleton screen style, centered rounded square app icon canvas, simple geometric symbol inside, surrounding wireframe control panels for gradient and background settings suggested by hatching and empty boxes, left panel with icon picker placeholders, right panel with sliders and swatch outlines as line shapes only, clean light background, monochrome ink lines, gray wash optional, clear app icon creation metaphor, no text, no watermark, no color, 16:10
```

---

## 2. ICO Converter

**核心表达**：一张图片被转换成多个尺寸的 ICO 图标。

```text
minimalist product cover for an ICO converter, black and white hand-drawn line art, pen sketch, skeleton screen style, one uploaded image card transforming into multiple small square icon tiles in different sizes like 16, 32, 48, 64, arranged in a clean grid, subtle arrow or flow from source image to icon set, wireframe UI upload area and export panel, neutral background, monochrome ink lines and gray shading, clear file conversion metaphor, no text, no watermark, no color, 16:10
```

---

## 3. Background Remover

**核心表达**：前景保留、背景去掉。

```text
minimalist product cover for a background remover tool, black and white hand-drawn line art, pen sketch, skeleton screen style, centered image comparison card with a vertical split view, left side showing simple object on solid tone, right side showing the same object isolated on checkerboard pattern drawn as line grid, subtle slider handle in the middle, clean wireframe upload and action placeholders, monochrome illustration, obvious remove-background metaphor, no text, no watermark, no color, 16:10
```

---

## 4. Logo Resize

**核心表达**：裁切 / 调整尺寸 / 固定比例输出。

```text
minimalist product cover for an image resize and crop tool, black and white hand-drawn line art, pen sketch, skeleton screen style, centered image frame with visible crop box and corner handles, surrounding aspect ratio placeholders like square, landscape, portrait, plus a small size output panel with width and height blocks, clean geometric composition, neutral background, wireframe UI as ink lines, gray tone optional, clear crop and resize metaphor, no text, no watermark, no color, 16:10
```

---

## 5. Image to SVG

**核心表达**：位图转矢量，左边粗糙像素，右边平滑路径。

```text
minimalist product cover for an image to SVG vectorization tool, black and white hand-drawn line art, pen sketch, skeleton screen style, split composition showing raster side as stippling or pixel grid sketch and vector side as smooth ink outlines, subtle flow between bitmap texture and clean curves, wireframe settings panel for tracing options, clean neutral background, monochrome illustration, clear bitmap-to-vector metaphor, no text, no watermark, no color, 16:10
```

---

## 6. SVG Viewer

**核心表达**：查看 SVG、编辑代码、预览结果、优化导出。

```text
minimalist product cover for an SVG viewer and editor tool, black and white hand-drawn line art, pen sketch, skeleton screen style, three-panel layout with left code editor wireframe, center SVG markup or node structure placeholders, right live preview canvas showing a simple shape as ink outline, subtle optimization controls as sketched toggles, clean neutral background, monochrome UI sketch, clear SVG inspect-edit-preview metaphor, no text, no watermark, no color, 16:10
```

---

## 7. Theme Color Extractor

**核心表达**：从图片提取主题色板。

```text
minimalist product cover for a color extractor tool, black and white hand-drawn line art, pen sketch, skeleton screen style, one image thumbnail feeding into a row or grid of empty swatch rectangles and striped or cross-hatched fill patterns suggesting palette slots, one enlarged swatch frame, palette chips as outlined boxes only, simple wireframe controls for count and format, neutral background, monochrome illustration, clear extract-palette metaphor without real pigments, no text, no watermark, no color, 16:10
```

---

## 使用建议

1. 每张图都先加上“通用基础提示词”。
2. 再拼接对应工具的单独提示词。
3. 最后追加“通用负面提示词”。
4. 如果平台支持，可额外补充：

```text
apple-like, swiss design, ultra clean, generous whitespace, dashboard thumbnail, soft shadows, low contrast, grayscale only, editorial ink drawing
```

5. 出图时尽量保持：
   - 主体居中
   - 元素不超过 3 组
   - 不要出现真实设备模型
   - 不要出现可读文字
   - 不要过度装饰
