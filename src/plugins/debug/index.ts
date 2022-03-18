import type { EggFingerOptions } from './eggFinger'
import EggFinger from './eggFinger'
import moduleLoader from '~/utils/moduleLoader'

export function eggHandler(): void {
  if (!window.VConsole) {
    moduleLoader('VConsole', 'https://unpkg.com/vconsole@3.11.0/dist/vconsole.min.js').then(() => {
      // eslint-disable-next-line no-new
      new window.VConsole()
    })
  }
}

export default function initDebugEgg(options?: Omit<EggFingerOptions, 'eggHandler'>) {
  if (!window.VConsole) {
    return new EggFinger({
      ...options,
      eggHandler,
    })
  }
  else {
    return null
  }
}
