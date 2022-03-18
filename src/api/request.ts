import type { AxiosRequestConfig } from 'axios'
import type { RequestFunctionParams } from 'yapi-to-typescript'
import axiosInstance from './axiosInstance'

/**
 * @key showErrorMsg 默认接口请求都会开启错误提示，如需要关闭，赋值false
 * @key showLoading 默认接口请求都不会开启加载动画，如需要开启，赋值true
 * @key loadingText
 */
export interface ExtInfo {
  showErrorMsg?: boolean
  showLoading?: boolean
  loadingText?: string
}

const { MODE, VITE_APP_BASE_PATH } = import.meta.env

export default function request<TResponseData>(payload: RequestFunctionParams, extInfo?: ExtInfo) {
  // 基本地址
  const baseUrl = MODE === 'mock' ? payload.mockUrl : VITE_APP_BASE_PATH

  // 请求地址
  const url = `${baseUrl}${payload.path}`
  const method = payload.method
  const data = payload.data
  const options: AxiosRequestConfig & { extInfo?: ExtInfo } = {
    url,
    method,
    extInfo,
  }

  // 具体请求逻辑
  switch (method) {
    case 'GET':
      options.params = data
      break
    default:
      options.data = data
  }
  return axiosInstance.request<any, TResponseData>(options)
}
