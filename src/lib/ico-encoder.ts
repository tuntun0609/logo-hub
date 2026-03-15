interface IcoEntry {
  pngBlob: Blob
  size: number
}

/**
 * Encode multiple PNG blobs into a single ICO file.
 * ICO format: ICONDIR (6 bytes) + ICONDIRENTRY[] (16 bytes each) + PNG data
 */
export async function encodeIco(entries: IcoEntry[]): Promise<Blob> {
  const pngBuffers = await Promise.all(
    entries.map((e) => e.pngBlob.arrayBuffer())
  )

  const headerSize = 6
  const entrySize = 16
  const directorySize = headerSize + entrySize * entries.length
  const totalSize =
    directorySize + pngBuffers.reduce((sum, buf) => sum + buf.byteLength, 0)

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)

  // ICONDIR header
  view.setUint16(0, 0, true) // reserved
  view.setUint16(2, 1, true) // type: 1 = ICO
  view.setUint16(4, entries.length, true) // image count

  // ICONDIRENTRY array + PNG data
  let dataOffset = directorySize
  for (let i = 0; i < entries.length; i++) {
    const entryOffset = headerSize + i * entrySize
    const size = entries[i].size
    const pngData = pngBuffers[i]

    // width & height: 0 means 256
    view.setUint8(entryOffset, size >= 256 ? 0 : size)
    view.setUint8(entryOffset + 1, size >= 256 ? 0 : size)
    view.setUint8(entryOffset + 2, 0) // color count (0 for PNG)
    view.setUint8(entryOffset + 3, 0) // reserved
    view.setUint16(entryOffset + 4, 1, true) // color planes
    view.setUint16(entryOffset + 6, 32, true) // bits per pixel
    view.setUint32(entryOffset + 8, pngData.byteLength, true) // data size
    view.setUint32(entryOffset + 12, dataOffset, true) // data offset

    // Copy PNG data
    new Uint8Array(buffer, dataOffset, pngData.byteLength).set(
      new Uint8Array(pngData)
    )
    dataOffset += pngData.byteLength
  }

  return new Blob([buffer], { type: 'image/x-icon' })
}
