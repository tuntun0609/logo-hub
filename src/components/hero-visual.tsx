'use client'

import { motion } from 'motion/react'

// Dot grid SVG patterns (Figma/Sketch canvas feel)
const dotPatternLight = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23d4d4d4'/%3E%3C/svg%3E")`
const dotPatternDark = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23ffffff'/%3E%3C/svg%3E")`

const ease = [0.25, 0.46, 0.45, 0.94] as const

const toolShapes = [
  {
    // 裁切框
    className: 'top-6 right-8 size-20 sm:size-28',
    delay: 0.1,
    path: 'M4 4h24v24H4z M0 8h4 M28 8h4 M8 0v4 M8 28v4 M0 24h4 M28 24h4 M24 0v4 M24 28v4',
    viewBox: '0 0 32 32',
  },
  {
    // 贝塞尔曲线
    className: 'top-16 right-[30%] size-14 sm:size-20',
    delay: 0.2,
    path: 'M4 28C4 28 10 4 16 4S28 28 28 28 M4 28l4-4m-4 4l-0 0 M28 28l-4-4m4 4',
    viewBox: '0 0 32 32',
  },
  {
    // 色彩圆环
    className: 'right-16 bottom-10 size-16 sm:size-24',
    delay: 0.3,
    path: 'M16 4a12 12 0 1 1 0 24 12 12 0 0 1 0-24z M16 8a8 8 0 1 1 0 16 8 8 0 0 1 0-16z',
    viewBox: '0 0 32 32',
  },
  {
    // 缩放箭头
    className: 'top-4 left-[55%] hidden size-12 sm:block sm:size-16',
    delay: 0.4,
    path: 'M4 20L4 28L12 28 M28 12L28 4L20 4 M4 28L14 18 M28 4L18 14',
    viewBox: '0 0 32 32',
  },
  {
    // 取色器
    className: 'bottom-6 left-[40%] hidden size-14 sm:block sm:size-18',
    delay: 0.5,
    path: 'M20 4l8 8-14 14H6v-8L20 4z M18 6l8 8 M6 22l4 4',
    viewBox: '0 0 32 32',
  },
]

export function HeroVisual() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Dot grid pattern — light */}
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-0"
        style={{
          backgroundImage: dotPatternLight,
          backgroundSize: '20px 20px',
          maskImage:
            'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
        }}
      />
      {/* Dot grid pattern — dark */}
      <div
        className="absolute inset-0 hidden opacity-[0.08] dark:block"
        style={{
          backgroundImage: dotPatternDark,
          backgroundSize: '20px 20px',
          maskImage:
            'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
        }}
      />

      {/* Tool outline shapes */}
      {toolShapes.map((shape) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={`absolute ${shape.className}`}
          initial={{ opacity: 0, y: 12 }}
          key={shape.path}
          transition={{ delay: shape.delay, duration: 0.8, ease }}
        >
          <svg
            aria-hidden="true"
            className="size-full text-foreground/[0.07] dark:text-foreground/[0.12]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            viewBox={shape.viewBox}
          >
            <path d={shape.path} />
          </svg>
        </motion.div>
      ))}

      {/* Breathing glow — center-right */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        className="absolute top-1/2 right-1/4 size-64 -translate-y-1/2 rounded-full bg-foreground/[0.03] blur-3xl sm:size-80 dark:bg-foreground/[0.06]"
        transition={{
          duration: 10,
          ease: 'easeInOut',
          repeat: Number.POSITIVE_INFINITY,
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise" />

      {/* Bottom fade to background */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}
