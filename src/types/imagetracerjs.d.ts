declare module 'imagetracerjs' {
  export interface ImageTracerOptions {
    blurdelta?: number
    blurradius?: number
    colorquantcycles?: number
    colorsampling?: number
    corsenabled?: boolean
    desc?: boolean
    layering?: number
    lcpr?: number
    linefilter?: boolean
    ltres?: number
    mincolorratio?: number
    numberofcolors?: number
    pathomit?: number
    qcpr?: number
    qtres?: number
    rightangleenhance?: boolean
    roundcoords?: number
    scale?: number
    strokewidth?: number
    viewbox?: boolean
  }

  interface ImageTracerInstance {
    checkoptions(options?: string | ImageTracerOptions): ImageTracerOptions
    imagedataToSVG(
      imagedata: ImageData,
      options?: string | ImageTracerOptions
    ): string
    optionpresets: Record<string, Partial<ImageTracerOptions>>
    readonly versionnumber: string
  }

  const imageTracer: ImageTracerInstance
  export default imageTracer
}
