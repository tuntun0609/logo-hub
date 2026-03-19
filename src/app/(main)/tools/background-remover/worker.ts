import { removeBackground } from '@imgly/background-removal'

self.onmessage = async (e: MessageEvent<{ file: File }>) => {
  try {
    const blob = await removeBackground(e.data.file, {
      proxyToWorker: false,
      progress: (key: string, current: number, total: number) => {
        self.postMessage({ type: 'progress', key, current, total })
      },
    })
    self.postMessage({ type: 'result', blob })
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : '背景移除失败',
    })
  }
}
