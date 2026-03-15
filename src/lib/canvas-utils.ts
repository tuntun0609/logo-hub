const ACCEPTED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

const ACCEPTED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateImageFile(file: File): string | null {
  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
  if (!(ACCEPTED_TYPES.has(file.type) || ACCEPTED_EXTENSIONS.has(ext))) {
    return '不支持的文件格式，请上传 PNG、JPG、SVG、WEBP 或 GIF 图片'
  }
  if (file.size > MAX_FILE_SIZE) {
    return '文件大小超过 10MB 限制'
  }
  return null
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法加载此图片文件'))
    }
    img.src = url
  })
}

export function resizeToCanvas(
  img: HTMLImageElement,
  size: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Scale to fit, centered, with transparent padding for non-square images
  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  const x = (size - w) / 2
  const y = (size - h) / 2

  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(img, x, y, w, h)
  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Canvas 导出失败'))
      }
    }, 'image/png')
  })
}
