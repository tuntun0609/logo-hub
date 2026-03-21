import { formatBytes } from '@/lib/svg-utils'
import type { CleanResult } from './types'

interface PrefixIdsPluginConfig {
  name: 'prefixIds'
  params: {
    delim: string
    prefix: string
  }
}

export const CLEAN_PLUGINS = [
  {
    group: '元数据',
    items: [
      { key: 'removeDoctype', label: '移除 Doctype' },
      { key: 'removeXMLProcInst', label: '移除 XML 声明' },
      { key: 'removeComments', label: '移除注释' },
      { key: 'removeMetadata', label: '移除元数据' },
      { key: 'removeEditorsNSData', label: '移除编辑器数据' },
      { key: 'removeDesc', label: '移除描述' },
      { key: 'removeTitle', label: '移除标题' },
    ],
  },
  {
    group: '结构',
    items: [
      { key: 'cleanupAttrs', label: '清理属性空白' },
      { key: 'removeEmptyAttrs', label: '移除空属性' },
      { key: 'removeEmptyText', label: '移除空文本' },
      { key: 'removeEmptyContainers', label: '移除空容器' },
      { key: 'removeHiddenElems', label: '移除隐藏元素' },
      { key: 'removeUnknownsAndDefaults', label: '移除默认/未知属性' },
      { key: 'removeUnusedNS', label: '移除未使用命名空间' },
      { key: 'removeUselessDefs', label: '移除无用定义' },
      { key: 'removeUselessStrokeAndFill', label: '移除无用描边填充' },
      { key: 'collapseGroups', label: '折叠冗余分组' },
    ],
  },
  {
    group: '样式与路径',
    items: [
      { key: 'mergeStyles', label: '合并样式' },
      { key: 'inlineStyles', label: '内联样式' },
      { key: 'minifyStyles', label: '压缩样式' },
      { key: 'cleanupNumericValues', label: '清理数值精度' },
      { key: 'convertColors', label: '标准化颜色' },
      { key: 'convertTransform', label: '简化变换' },
      { key: 'convertShapeToPath', label: '图形转路径' },
      { key: 'convertEllipseToCircle', label: '椭圆转圆' },
      { key: 'convertPathData', label: '压缩路径数据' },
      { key: 'mergePaths', label: '合并路径' },
      { key: 'sortAttrs', label: '排序属性' },
    ],
  },
  {
    group: '嵌入与导出',
    items: [
      { key: 'cleanupIds', label: '清理 ID' },
      { key: 'prefixIds', label: '为 ID 添加前缀' },
      { key: 'removeDimensions', label: '移除宽高属性' },
      { key: 'removeViewBox', label: '移除 viewBox' },
      { key: 'removeXlink', label: '移除 xlink' },
      { key: 'removeXMLNS', label: '移除 xmlns' },
    ],
  },
  {
    group: '安全',
    items: [
      { key: 'removeScripts', label: '移除脚本' },
      { key: 'removeStyleElement', label: '移除 style 标签' },
      { key: 'removeRasterImages', label: '移除位图图片' },
    ],
  },
] as const

export type CleanPluginKey =
  (typeof CLEAN_PLUGINS)[number]['items'][number]['key']

export type CleanOptions = Record<CleanPluginKey, boolean>

export const ALL_CLEAN_KEYS = CLEAN_PLUGINS.flatMap((group) =>
  group.items.map((item) => item.key)
)

const SVG_EXTENSION_RE = /\.svg$/i
const NON_ALPHANUMERIC_RE = /[^a-z0-9]+/g
const EDGE_DASH_RE = /^-+|-+$/g

export const CLEAN_PRESETS = [
  {
    key: 'recommended',
    description: '日常清理，保留响应式与可访问性',
    label: '推荐',
    plugins: [
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'cleanupAttrs',
      'removeEmptyAttrs',
      'removeEmptyText',
      'removeEmptyContainers',
      'removeHiddenElems',
      'removeUnknownsAndDefaults',
      'removeUnusedNS',
      'removeUselessDefs',
      'removeUselessStrokeAndFill',
      'collapseGroups',
      'mergeStyles',
      'inlineStyles',
      'minifyStyles',
      'cleanupNumericValues',
      'convertColors',
      'convertTransform',
      'convertShapeToPath',
      'convertEllipseToCircle',
      'convertPathData',
      'mergePaths',
      'sortAttrs',
      'removeXlink',
    ],
  },
  {
    key: 'icon',
    description: '图标导出，尺寸更紧凑',
    label: 'Web 图标',
    plugins: [
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'removeDesc',
      'removeTitle',
      'cleanupAttrs',
      'removeEmptyAttrs',
      'removeEmptyText',
      'removeEmptyContainers',
      'removeHiddenElems',
      'removeUnknownsAndDefaults',
      'removeUnusedNS',
      'removeUselessDefs',
      'removeUselessStrokeAndFill',
      'collapseGroups',
      'mergeStyles',
      'inlineStyles',
      'minifyStyles',
      'cleanupNumericValues',
      'convertColors',
      'convertTransform',
      'convertShapeToPath',
      'convertEllipseToCircle',
      'convertPathData',
      'mergePaths',
      'sortAttrs',
      'cleanupIds',
      'removeDimensions',
      'removeXlink',
    ],
  },
  {
    key: 'inline',
    description: '适合内联到 React/HTML',
    label: '内联 React',
    plugins: [
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'cleanupAttrs',
      'removeEmptyAttrs',
      'removeEmptyText',
      'removeEmptyContainers',
      'removeHiddenElems',
      'removeUnknownsAndDefaults',
      'removeUnusedNS',
      'removeUselessDefs',
      'removeUselessStrokeAndFill',
      'collapseGroups',
      'mergeStyles',
      'inlineStyles',
      'minifyStyles',
      'cleanupNumericValues',
      'convertColors',
      'convertTransform',
      'convertShapeToPath',
      'convertEllipseToCircle',
      'convertPathData',
      'mergePaths',
      'sortAttrs',
      'prefixIds',
      'removeDimensions',
      'removeXlink',
      'removeXMLNS',
    ],
  },
  {
    key: 'strict',
    description: '偏安全清理，去掉脚本/位图/style',
    label: '严格',
    plugins: [
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'removeDesc',
      'removeTitle',
      'cleanupAttrs',
      'removeEmptyAttrs',
      'removeEmptyText',
      'removeEmptyContainers',
      'removeHiddenElems',
      'removeUnknownsAndDefaults',
      'removeUnusedNS',
      'removeUselessDefs',
      'removeUselessStrokeAndFill',
      'collapseGroups',
      'mergeStyles',
      'inlineStyles',
      'minifyStyles',
      'cleanupNumericValues',
      'convertColors',
      'convertTransform',
      'convertShapeToPath',
      'convertEllipseToCircle',
      'convertPathData',
      'mergePaths',
      'sortAttrs',
      'cleanupIds',
      'removeScripts',
      'removeStyleElement',
      'removeRasterImages',
      'removeXlink',
    ],
  },
] as const satisfies ReadonlyArray<{
  description: string
  key: string
  label: string
  plugins: readonly CleanPluginKey[]
}>

export type CleanPreset = (typeof CLEAN_PRESETS)[number]
export type CleanPresetKey = CleanPreset['key']

export function buildCleanOptions(
  enabledKeys: readonly CleanPluginKey[]
): CleanOptions {
  const enabled = new Set(enabledKeys)
  return Object.fromEntries(
    ALL_CLEAN_KEYS.map((key) => [key, enabled.has(key)])
  ) as CleanOptions
}

export function makeDefaultCleanOptions(): CleanOptions {
  return buildCleanOptions(
    CLEAN_PRESETS.find((preset) => preset.key === 'recommended')?.plugins ?? []
  )
}

function cleanPresetMatchesOptions(
  plugins: readonly CleanPluginKey[],
  cleanOptions: CleanOptions
): boolean {
  return ALL_CLEAN_KEYS.every((key) =>
    plugins.includes(key) ? cleanOptions[key] : !cleanOptions[key]
  )
}

export function getActiveCleanPresetKey(
  cleanOptions: CleanOptions
): CleanPresetKey | null {
  return (
    CLEAN_PRESETS.find((preset) =>
      cleanPresetMatchesOptions(preset.plugins, cleanOptions)
    )?.key ?? null
  )
}

function createSvgIdPrefix(fileName: string | null) {
  const source = fileName?.replace(SVG_EXTENSION_RE, '') || 'svg'
  const normalized = source
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_RE, '-')
    .replace(EDGE_DASH_RE, '')
  return normalized || 'svg'
}

export function getEnabledCleanPlugins(
  cleanOptions: CleanOptions,
  fileName: string | null
): Array<CleanPluginKey | PrefixIdsPluginConfig> {
  return ALL_CLEAN_KEYS.filter((key) => cleanOptions[key]).map((key) =>
    key === 'prefixIds'
      ? {
          name: 'prefixIds',
          params: {
            delim: '__',
            prefix: createSvgIdPrefix(fileName),
          },
        }
      : key
  )
}

export function getCleanResultMeta(cleanResult: CleanResult) {
  if (cleanResult.cleanedSize < cleanResult.beforeSize) {
    const savedBytes = cleanResult.beforeSize - cleanResult.cleanedSize
    const savedPercent = Math.round((savedBytes / cleanResult.beforeSize) * 100)
    return {
      className: 'text-green-600 dark:text-green-400',
      text: `（减少 ${formatBytes(savedBytes)} / ${savedPercent}%）`,
    }
  }

  if (cleanResult.cleanedSize > cleanResult.beforeSize) {
    return {
      className: 'text-amber-600 dark:text-amber-400',
      text: `（增加 ${formatBytes(cleanResult.cleanedSize - cleanResult.beforeSize)}）`,
    }
  }

  return {
    className: '',
    text: '（体积无变化）',
  }
}
