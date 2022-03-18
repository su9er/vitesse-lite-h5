export default function bootstrap(): Promise<any> {
  // 初始化应用实例前，可以先执行一些获取数据、配置等前置操作
  return Promise.all([Promise.resolve()].map(p => p.catch(e => e)))
}
