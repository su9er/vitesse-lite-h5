import AlloyFinger from '~/utils/alloyFinger'

export interface EggFingerOptions {
  el?: string | HTMLElement
  points?: number // 触发彩蛋的手指数
  timeout?: number // 触发彩蛋的超时时间
  eggHandler?: () => void
}

export default class EggFinger {
  af
  points: number
  timeout: number
  eggHandler: (() => void) | undefined
  multiPointTimeout: number | undefined
  constructor(options: EggFingerOptions) {
    this.points = options.points || 3
    this.timeout = options.timeout || 5000
    this.eggHandler = options.eggHandler
    this.af = new AlloyFinger(options.el || document.body, {
      multipointStart: this.multiPointStart.bind(this),
      multipointEnd: this.multiPointEnd.bind(this),
    })
  }

  multiPointStart(evt: TouchEvent) {
    const pointsLen = evt.touches.length
    if (pointsLen === this.points) {
      this.multiPointTimeout = window.setTimeout(() => {
        this.eggHandler?.()
      }, this.timeout)
    }
  }

  multiPointEnd() {
    window.clearTimeout(this.multiPointTimeout)
  }

  destroy() {
    this.af.destroy()
  }
}
