# Notion 封面示例

## AI 生成示例

### 示例 1：读书笔记封面

**用户请求：** "帮我生成一个读书笔记的 Notion 封面"

**生成的 prompt：**
```
A minimal line art illustration of an open book with a few gently floating pages and a small bookmark ribbon, thin clean outlines, simple geometric shapes, Notion-style aesthetic. Centered composition with vast white negative space around the subject, the book occupies only 35% of the canvas. Clean white background. Limited color palette: muted sage green and warm terracotta with soft black outlines. No text, no borders, no shadows, no gradients, no complex textures.
```

**参数：**
- filename: `notion-cover-reading.png`

---

### 示例 2：项目管理封面

**用户请求：** "做一个项目管理页面的封面"

**生成的 prompt：**
```
A minimal line art illustration of a simple kanban board with three columns and small task cards, connected by thin curved arrows, Notion-style aesthetic. Centered composition with vast white negative space, the board occupies only 30% of the canvas. Clean white background. Limited color palette: sky blue and warm yellow accents with soft black outlines. No text, no borders, no shadows, no gradients.
```

---

## SVG 生成示例

### 示例 3：简约咖啡杯封面

**用户请求：** "生成一个简单的咖啡主题 SVG 封面"

**生成的 SVG：**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 600">
  <rect width="1500" height="600" fill="#FFFFFF"/>
  <g transform="translate(750, 280)" stroke="#2D2D2D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- 杯身 -->
    <path d="M-40,0 L-35,60 Q-30,80 0,80 Q30,80 35,60 L40,0 Z"/>
    <!-- 把手 -->
    <path d="M40,10 Q65,10 65,35 Q65,55 40,55"/>
    <!-- 蒸汽 -->
    <path d="M-15,-15 Q-10,-30 -15,-45" stroke-width="1.5"/>
    <path d="M0,-15 Q5,-35 0,-50" stroke-width="1.5"/>
    <path d="M15,-15 Q20,-30 15,-45" stroke-width="1.5"/>
    <!-- 碟子 -->
    <ellipse cx="0" cy="85" rx="55" ry="8"/>
    <!-- 咖啡液面色块 -->
    <ellipse cx="0" cy="5" rx="32" ry="8" fill="#C17F59" stroke="none" opacity="0.3"/>
  </g>
</svg>
```

### 示例 4：音乐主题封面

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 600">
  <rect width="1500" height="600" fill="#FFFFFF"/>
  <g transform="translate(750, 300)" stroke="#2D2D2D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- 耳机 -->
    <path d="M-45,10 Q-45,-45 0,-50 Q45,-45 45,10"/>
    <rect x="-55" y="5" width="18" height="30" rx="5"/>
    <rect x="37" y="5" width="18" height="30" rx="5"/>
    <!-- 音符 -->
    <circle cx="-75" cy="-20" r="5" fill="#D4A0C0" stroke="none"/>
    <line x1="-70" y1="-20" x2="-70" y2="-45"/>
    <circle cx="75" cy="-35" r="4" fill="#D4A0C0" stroke="none"/>
    <line x1="79" y1="-35" x2="79" y2="-55"/>
    <path d="M79,-55 Q85,-55 85,-50" stroke-width="1.5"/>
  </g>
</svg>
```
