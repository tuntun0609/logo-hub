# AI Logo Maker - Testing Guide

## Setup

1. Add your OpenRouter API key to `.env.local`:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

2. Get a free API key from: https://openrouter.ai/

## Testing Checklist

### Basic Functionality
- [ ] Page loads at http://localhost:3000/tools/ai-logo-maker
- [ ] Left panel shows style selector and empty state message
- [ ] Right panel shows empty preview state

### Generation Flow
- [ ] Enter prompt: "一个蓝色的科技公司 logo"
- [ ] Click "发送" button
- [ ] Message appears in chat history
- [ ] AI response streams in real-time
- [ ] SVG preview appears in right panel
- [ ] Small thumbnail shows in chat message

### Style Presets
- [ ] Change style to "现代" (Modern)
- [ ] Generate new logo
- [ ] Verify style affects output

### Preview Controls
- [ ] Toggle background: checkerboard → white → black
- [ ] Zoom in (+) and out (-)
- [ ] Switch to "代码" (Code) mode
- [ ] Edit SVG code manually
- [ ] Switch back to "预览" (Preview)

### Export Functions
- [ ] Click "复制代码" - shows "已复制!"
- [ ] Paste clipboard - contains SVG code
- [ ] Click "下载 SVG" - downloads .svg file
- [ ] Click "导出 PNG ▾" - menu opens
- [ ] Select 512×512 - downloads .png file
- [ ] Click outside menu - menu closes

### Conversation Flow
- [ ] Send follow-up: "让它更简洁"
- [ ] AI refines the logo
- [ ] Chat history preserved
- [ ] New SVG replaces preview

### Edge Cases
- [ ] Empty prompt - button disabled
- [ ] Very long prompt - handles gracefully
- [ ] Invalid SVG in code editor - validation works
- [ ] Rapid consecutive requests - queued properly

## Example Prompts

**Minimalist:**
- "一个简洁的字母 A logo"
- "极简风格的山形图标"

**Modern:**
- "现代感的渐变色圆形 logo"
- "科技公司的抽象图形"

**Vintage:**
- "复古徽章风格的咖啡店 logo"
- "经典的圆形印章设计"

**Tech:**
- "未来感的电路板图案"
- "霓虹色的几何 logo"

**Organic:**
- "自然风格的树叶图标"
- "流动的水波纹 logo"

## Known Limitations

1. **API Key Required**: Must have valid OpenRouter API key
2. **Model Availability**: Uses free tier `google/gemini-2.0-flash-exp:free`
3. **No Persistence**: Chat history cleared on page refresh
4. **SVG Only**: Generates vector graphics, not raster images
5. **Single Result**: One logo per generation (no variations)

## Troubleshooting

**"OpenRouter API key not configured"**
- Add OPENROUTER_API_KEY to .env.local
- Restart dev server

**SVG not rendering**
- Check browser console for errors
- Verify SVG code is valid
- Try switching to code mode

**PNG export fails**
- Check if SVG is valid
- Try smaller size (256×256)
- Check browser console

**Streaming stops mid-generation**
- Check network tab for errors
- Verify API key is valid
- Check OpenRouter rate limits

## Architecture Notes

### Components
- `page.tsx` - Main page with layout
- `chat-panel.tsx` - Left sidebar with messages
- `preview-panel.tsx` - Right panel with preview/code
- `use-ai-logo-maker.ts` - State management hook

### API
- `/api/ai/generate-logo` - Streaming endpoint
- Uses Vercel AI SDK for streaming
- OpenRouter provider with Gemini Flash

### Utilities
- `svg-validator.ts` - Sanitization and validation
- `svg-to-png.ts` - Canvas-based conversion
