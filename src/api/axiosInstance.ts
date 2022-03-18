import type { AxiosRequestConfig, AxiosResponse, Canceler } from 'axios'
import axios from 'axios'
import { Dialog, Toast } from 'vant'
import type { ExtInfo } from './request'

// 声明一个 Map 用于存储每个请求的标识 和 取消函数
const pending = new Map<string, Canceler>()

let loadingTimer: NodeJS.Timeout

/**
 * 添加请求进队列
 * @param {AxiosRequestConfig} config
 */
const addPending = (config: AxiosRequestConfig) => {
  const url = [
    config.method,
    config.url,
    JSON.stringify(config.params),
    JSON.stringify(config.data),
  ].join('&')
  config.cancelToken
    = config.cancelToken
    || new axios.CancelToken((cancel) => {
      if (!pending.has(url)) {
        // 如果 pending 中不存在当前请求，则添加进去
        pending.set(url, cancel)
      }
    })
}

/**
 * 从队列中移除请求
 * @param {AxiosRequestConfig} config
 */
const removePending = (config: AxiosRequestConfig) => {
  const url = [
    config.method,
    config.url,
    JSON.stringify(config.params),
    JSON.stringify(config.data),
  ].join('&')
  if (pending.has(url)) {
    const cancel = pending.get(url) as Canceler
    cancel(url)
    pending.delete(url)
  }
}

/**
 * 清空 pending 中的请求队列（在路由跳转时调用）
 */
export const clearPending = () => {
  for (const [url, cancel] of pending)
    cancel(url)

  pending.clear()
}

const showStatus = (status: number) => {
  let message = ''
  switch (status) {
    case 400:
      message = '请求错误(400)'
      break
    case 401:
      message = '未授权，请重新登录(401)'
      break
    case 403:
      message = '拒绝访问(403)'
      break
    case 404:
      message = '请求出错(404)'
      break
    case 408:
      message = '请求超时(408)'
      break
    case 500:
      message = '服务器错误(500)'
      break
    case 501:
      message = '服务未实现(501)'
      break
    case 502:
      message = '网络错误(502)'
      break
    case 503:
      message = '服务不可用(503)'
      break
    case 504:
      message = '网络超时(504)'
      break
    case 505:
      message = 'HTTP版本不受支持(505)'
      break
    default:
      message = `连接出错(${status})!`
  }
  return message
  // return `${message}，请检查网络或联系管理员！`
}

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  responseType: 'json',
  // validateStatus() {
  //   // 使用async-await，处理reject情况较为繁琐，所以全部返回resolve，在业务代码中处理异常
  //   return true
  // },
  // transformRequest: [
  //   (data) => {
  //     data = JSON.stringify(data)
  //     return data
  //   }
  // ],
  transformResponse: [
    (data) => {
      if (typeof data === 'string' && data.startsWith('{'))
        data = JSON.parse(data)

      return data
    },
  ],
})

axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
  // 开启加载中动画
  const { extInfo } = config as AxiosRequestConfig & { extInfo: ExtInfo }
  if (extInfo?.showLoading === true) {
    // 防止两个loading重复触发
    loadingTimer && clearTimeout(loadingTimer)
    loadingTimer = setTimeout(() => {
      Toast.loading({
        message: extInfo.loadingText ?? '加载中...',
        duration: 0,
      })
    }, 400)
  }
  removePending(config) // 在请求开始前，对之前的请求做检查取消操作
  addPending(config) // 将当前请求添加到 pending 队列中
  return config
})

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 关闭加载动画
    clearTimeout(loadingTimer)
    Toast.clear()
    removePending(response) // 在请求结束后，从 pending 队列中移除本次请求
    if (response.data?.success) {
      return Promise.resolve(response.data?.object)
    }
    else {
      // 弹窗提示错误消息
      const { extInfo } = response.config as AxiosRequestConfig & { extInfo: ExtInfo }
      if (!extInfo || extInfo.showErrorMsg !== false) {
        // Toast.fail(response.data?.message || '请求失败')
        Dialog.alert({
          message: response.data?.message || '请求失败',
        })
      }
      return Promise.reject(response || { message: '请求失败' })
    }
  },
  (error) => {
    // 关闭加载动画
    clearTimeout(loadingTimer)
    Toast.clear()
    if (axios.isCancel(error)) {
      // eslint-disable-next-line no-console
      console.log(`repeated request: ${error.message}`)
    }
    else {
      const response = error.response
      const message = response?.status ? showStatus(response.status) : error.message

      // 超时重新请求
      const config = error.config
      // 全局的请求次数,请求的间隙
      const [RETRY_COUNT, RETRY_DELAY] = [0, 1000]

      if (config && RETRY_COUNT) {
        // 设置用于跟踪重试计数的变量
        config.__retryCount = config.__retryCount || 3
        // 检查是否已经把重试的总数用完
        if (config.__retryCount >= RETRY_COUNT) {
          // 弹窗提示错误消息
          const { extInfo } = config as AxiosRequestConfig & { extInfo: ExtInfo }
          if (!extInfo || extInfo.showErrorMsg !== false) {
            // Toast.fail(message)
            Dialog.alert({
              message,
            })
          }
          return Promise.reject(response || { message })
        }
        // 增加重试计数
        config.__retryCount++
        // 创造新的Promise来处理后退
        const backoff = new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, RETRY_DELAY || 1)
        })
        // axiosInstance 重试请求的Promise
        return backoff.then(() => {
          return axiosInstance(config)
        })
      }

      // 根据返回的code值来做不同的处理(和后端约定)
      switch (response?.status) {
        case 401:
          // token失效
          break
        case 403:
          // 没有权限
          break
        case 500:
          // 服务端错误
          break
        case 503:
          // 服务端错误
          break
        default:
          break
      }

      // 弹窗提示错误消息
      const { extInfo } = config as AxiosRequestConfig & { extInfo: ExtInfo }
      if (!extInfo || extInfo.showErrorMsg !== false) {
        // Toast.fail(message)
        Dialog.alert({
          message,
        })
      }

      return Promise.reject(response || { message })
    }
  },
)

export default axiosInstance
