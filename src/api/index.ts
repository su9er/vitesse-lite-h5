/* 该文件由 yapi-to-typescript 自动生成，请勿直接修改！！！ */
import type { RequestConfig, RequestFunctionRestArgs } from 'yapi-to-typescript'
import { Method, RequestBodyType, ResponseBodyType, prepare } from 'yapi-to-typescript'
import request from './request'

type UserRequestRestArgs = RequestFunctionRestArgs<typeof request>

// Request: 目前 React Hooks 功能有用到
export type Request<
  TRequestData,
  TRequestConfig extends RequestConfig,
  TRequestResult,
> = (TRequestConfig['requestDataOptional'] extends true
  ? (requestData?: TRequestData, ...args: RequestFunctionRestArgs<typeof request>) => TRequestResult
  : (
    requestData: TRequestData,
    ...args: RequestFunctionRestArgs<typeof request>
  ) => TRequestResult) & {
  requestConfig: TRequestConfig
}

const mockUrl_0_0_0_1 = 'http://{yapihost}/mock/xxx' as any
const devUrl_0_0_0_1 = '' as any
const prodUrl_0_0_0_1 = '' as any
const dataKey_0_0_0_1 = 'object' as any

export interface SleepTestRequest { }

export type SleepTestResponse = boolean

type SleepTestRequestConfig = Readonly<
RequestConfig<
'http://{yapihost}/mock/xxx',
'',
'',
'/api/SleepTest',
'object',
string,
string,
true
>
>

const sleepTestRequestConfig: SleepTestRequestConfig = /* #__PURE__ */ {
  mockUrl: mockUrl_0_0_0_1,
  devUrl: devUrl_0_0_0_1,
  prodUrl: prodUrl_0_0_0_1,
  path: '/api/SleepTest',
  method: Method.GET,
  requestHeaders: {},
  requestBodyType: RequestBodyType.query,
  responseBodyType: ResponseBodyType.json,
  dataKey: dataKey_0_0_0_1,
  paramNames: [],
  queryNames: [],
  requestDataOptional: true,
  requestDataJsonSchema: {},
  responseDataJsonSchema: {},
  requestFunctionName: 'sleepTest',
  extraInfo: {},
}

export const sleepTest = /* #__PURE__ */ (
  requestData?: SleepTestRequest,
  ...args: UserRequestRestArgs
) => {
  return request<SleepTestResponse>(prepare(sleepTestRequestConfig, requestData), ...args)
}

sleepTest.requestConfig = sleepTestRequestConfig
