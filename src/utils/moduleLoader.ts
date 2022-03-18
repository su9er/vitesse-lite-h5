export default function moduleLoader(moduleName: string, moduleLink: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (moduleName in window) {
      resolve()
    }
    else {
      if (!moduleLink) {
        reject(new Error(`${moduleName}: 模块链接不存在`))
      }
      else {
        const script = document.createElement('script')
        script.src = moduleLink
        script.onload = () => {
          if (moduleName in window)
            resolve()
          else
            reject(new Error(`${moduleName}: 模块加载失败。`))
        }
        script.onerror = () => {
          reject(new Error(`${moduleName}: 模块加载失败。`))
        }
        document.body.appendChild(script)
      }
    }
  })
}
