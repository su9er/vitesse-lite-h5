// 计算距离和角度等的数学公式

// 根据两边的长度求直角三角形斜边长度(主要用于求两点距离)
function getLen(v: { x: any; y: any }) {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}
// 主要用于计算两次手势状态间的夹角的辅助函数
function dot(v1: { x: number; y: number }, v2: { x: number; y: number }) {
  return v1.x * v2.x + v1.y * v2.y
}
// 计算两次手势状态间的夹角
function getAngle(v1: any, v2: any) {
  const mr = getLen(v1) * getLen(v2)
  if (mr === 0) return 0
  let r = dot(v1, v2) / mr
  if (r > 1) r = 1
  return Math.acos(r)
}
// 计算夹角的旋转方向，(逆时针大于0，顺时针小于0)
function cross(v1: { x: number; y: number }, v2: { y: number; x: number }) {
  return v1.x * v2.y - v2.x * v1.y
}
// 将角度转换为弧度，并且绝对值
function getRotateAngle(v1: { x: number; y: number }, v2: any) {
  let angle = getAngle(v1, v2)
  if (cross(v1, v2) > 0)
    angle *= -1

  return (angle * 180) / Math.PI
}
// 用于处理手势监听函数的构造函数
class HandlerAdmin {
  handlers
  el
  constructor(el: HTMLElement) {
    this.handlers = <any>[]
    this.el = el
  }

  // 构造函数的添加监听函数的方法
  add(handler: any) {
    this.handlers.push(handler)
  }

  // 构造函数的删除监听函数的方法
  del(handler: any) {
    if (!handler) this.handlers = [] // handler为假值时，代表清空监听函数列表

    for (let i = this.handlers.length; i >= 0; i--) {
      if (this.handlers[i] === handler)
        this.handlers.splice(i, 1)
    }
  }

  dispatch(...args: any) {
    for (let i = 0, len = this.handlers.length; i < len; i++) {
      const handler = this.handlers[i]
      if (typeof handler === 'function') handler.apply(this.el, args)
    }
  }
}
// 实例化处理监听函数的对象
function wrapFunc(el: any, handler: any) {
  const handlerAdmin = new HandlerAdmin(el)
  handlerAdmin.add(handler) // 添加监听函数

  return handlerAdmin // 返回实例
}
class AlloyFinger {
  [x: string]: any;
  element: HTMLElement | null
  constructor(el: HTMLElement | string, options: any) {
    this.element = typeof el == 'string' ? document.querySelector(el) : el // 绑定事件的元素

    // 绑定原型上start, move, end, cancel函数的this对象为 AlloyFinger实例
    // this.start = this.start.bind(this)
    // this.move = this.move.bind(this)
    // this.end = this.end.bind(this)
    // this.cancel = this.cancel.bind(this)

    // 绑定原生的 touchstart, touchmove, touchend, touchcancel事件。
    this.element?.addEventListener('touchstart', this.start, false)
    this.element?.addEventListener('touchmove', this.move, false)
    this.element?.addEventListener('touchend', this.end, false)
    this.element?.addEventListener('touchcancel', this.cancel, false)

    this.preV = { x: null, y: null } // 保存当有两个手指以上时，两个手指间横纵坐标的差值，用于计算两点距离
    this.pinchStartLen = null // 两个手指间的距离
    this.zoom = 1 // 初始缩放比例
    this.isDoubleTap = false // 是否双击
    this.stopPropagation = options.stopPropagation || false // 是否阻止冒泡
    this.distance = options.size // 注入swipe事件滑动的距离

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const noop = function() { } // 空函数，没有绑定事件时，传入的函数

    // 对14种手势，分别实例化监听函数对象，根据option的值添加相关监听函数，没有就添加空函数。
    this.rotate = wrapFunc(this.element, options.rotate || noop)
    this.touchStart = wrapFunc(this.element, options.touchStart || noop)
    this.multipointStart = wrapFunc(this.element, options.multipointStart || noop)
    this.multipointEnd = wrapFunc(this.element, options.multipointEnd || noop)
    this.pinch = wrapFunc(this.element, options.pinch || noop)
    this.swipe = wrapFunc(this.element, options.swipe || noop)
    this.tap = wrapFunc(this.element, options.tap || noop)
    this.doubleTap = wrapFunc(this.element, options.doubleTap || noop)
    this.longTap = wrapFunc(this.element, options.longTap || noop)
    this.singleTap = wrapFunc(this.element, options.singleTap || noop)
    this.pressMove = wrapFunc(this.element, options.pressMove || noop)
    this.touchMove = wrapFunc(this.element, options.touchMove || noop)
    this.touchEnd = wrapFunc(this.element, options.touchEnd || noop)
    this.touchCancel = wrapFunc(this.element, options.touchCancel || noop)

    this.delta = null // 用于判断是否是双击的时间戳
    this.last = null // 记录时间戳的变量
    this.now = null // 记录时间戳的变量
    this.tapTimeout = null // tap事件执行的定时器
    this.singleTapTimeout = null // singleTap执行的定时器
    this.longTapTimeout = null // longTap执行的定时器
    this.swipeTimeout = null // swipe执行的定时器
    this.x1 = this.x2 = this.y1 = this.y2 = null // start时手指的坐标x1, y1, move时手指的坐标x2, y2
    this.preTapPosition = { x: null, y: null } // 记住start时，手指的坐标
    this.isLongTap = false // 是否是长按
  }

  start(evt: TouchEvent) {
    // 阻止冒泡
    if (this.stopPropagation)
      evt.stopPropagation()

    if (!evt.touches) return // touches手指列表，没有就return
    this.now = Date.now() // 记录当前事件点
    this.x1 = evt.touches[0].pageX // 第一个手指x坐标
    this.y1 = evt.touches[0].pageY // 第一个手指y坐标
    this.delta = this.now - (this.last || this.now) // 时间戳
    this.touchStart.dispatch(evt) // 触发touchStart事件
    if (this.preTapPosition.x !== null) {
      // 不是第一次触摸屏幕时，比较两次触摸时间间隔，两次触摸间隔小于250ms，触摸点的距离小于30px时记为双击。
      this.isDoubleTap
        = this.delta > 0
        && this.delta <= 250
        && Math.abs(this.preTapPosition.x - this.x1) < this.distance
        && Math.abs(this.preTapPosition.y - this.y1) < this.distance
    }
    this.preTapPosition.x = this.x1 // 将此次的触摸坐标保存到preTapPosition。
    this.preTapPosition.y = this.y1
    this.last = this.now // 记录本次触摸时间点
    const preV = this.preV // 获取记录的两点坐标差值
    const len = evt.touches.length // 手指个数
    if (len > 1) {
      // 手指个数大于1
      this.#cancelLongTap() // 取消longTap定时器
      this.#cancelSingleTap() // 取消singleTap定时器
      const v = { x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1 }
      // 计算两个手指间横纵坐标差，并保存到prev对象中，也保存到this.preV中。
      preV.x = v.x
      preV.y = v.y
      this.pinchStartLen = getLen(preV) // 计算两个手指的间距
      this.multipointStart.dispatch(evt) // 触发multipointStart事件
    }
    // 开启longTap事件定时器，如果750ms内定时器没有被清除则触发longTap事件。
    this.longTapTimeout = setTimeout(() => {
      this.isLongTap = true // 触发了长按事件
      this.longTap.dispatch(evt)
    }, 750)
  }

  move(evt: TouchEvent & {
    zoom?: any
    angle?: any
    deltaX?: any
    deltaY?: any
  }) {
    // 阻止冒泡
    if (this.stopPropagation)
      evt.stopPropagation()

    if (!evt.touches) return
    const preV = this.preV // start方法中保存的两点横纵坐标差值。
    const len = evt.touches.length // 手指个数
    const currentX = evt.touches[0].pageX // 第一个手指的x坐标
    const currentY = evt.touches[0].pageY // 第一个手指的y坐标
    this.isDoubleTap = false // 移动了就不能是双击事件了
    if (len > 1) {
      // 获取当前两点横纵坐标的差值，保存到v对象中。
      const v = { x: evt.touches[1].pageX - currentX, y: evt.touches[1].pageY - currentY }
      // start保存的preV不为空，pinchStartLen大于0
      if (preV.x !== null) {
        if (this.pinchStartLen > 0) {
          // 当前两点的距离除以start中两点距离，求出缩放比，挂载到evt对象中
          evt.zoom = getLen(v) / this.pinchStartLen
          this.pinch.dispatch(evt) // 触发pinch事件
        }

        evt.angle = getRotateAngle(v, preV) // 计算旋转的角度，挂载到evt对象中
        this.rotate.dispatch(evt) // 触发rotate事件
      }
      preV.x = v.x // 将move中的两个手指的横纵坐标差值赋值给preV，同时也改变了this.preV
      preV.y = v.y
    }
    else {
      // 出列一根手指的pressMove手势

      // 第一次触发move时，this.x2为null，move执行完会有给this.x2赋值。
      if (this.x2 !== null) {
        // 用本次的move坐标减去上一次move坐标，得到x,y方向move距离。
        evt.deltaX = currentX - this.x2
        evt.deltaY = currentY - this.y2
      }
      else {
        // 第一次执行move，所以移动距离为0，将evt.deltaX,evt.deltaY赋值为0.
        evt.deltaX = 0
        evt.deltaY = 0
      }
      // 触发pressMove事件
      this.pressMove.dispatch(evt)
    }
    // 触发touchMove事件，挂载不同的属性给evt对象抛给用户
    this.touchMove.dispatch(evt)

    // 取消长按定时器，750ms内可以阻止长按事件。
    this.#cancelLongTap()
    this.isLongTap = false // 长按设置为false
    this.x2 = currentX // 记录当前第一个手指坐标
    this.y2 = currentY
    if (len > 1)
      evt.preventDefault() // 两个手指以上阻止默认事件
  }

  end(evt: TouchEvent & {
    direction?: any
  }) {
    // 阻止冒泡事件
    if (this.stopPropagation)
      evt.stopPropagation()

    if (!evt.changedTouches) return
    // 取消长按定时器，750ms内会阻止长按事件
    this.#cancelLongTap()
    // 判断如果触发了长按事件，将阻止end里的所有事件，包括tap、singleTap、doubleTap、swipe
    if (this.isLongTap) {
      this.isLongTap = false // 重置长按判断条件
      return // return掉，阻止下面操作
    }
    // 如果当前留下来的手指数小于2，触发multipointEnd事件
    if (evt.touches.length < 2)
      this.multipointEnd.dispatch(evt)

    // this.x2或this.y2存在代表触发了move事件。
    // Math.abs(this.x1 - this.x2)代表在x方向移动的距离。
    // 故就是在x方向或y方向移动的距离大于30px时则触发swipe事件
    if (
      (this.x2 && Math.abs(this.x1 - this.x2) > this.distance)
      || (this.y2 && Math.abs(this.y1 - this.y2) > this.distance)
    ) {
      // 计算swipe的方向并写入evt对象。
      evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2)
      this.swipeTimeout = setTimeout(() => {
        this.swipe.dispatch(evt) // 异步触发swipe事件
      }, 0)
    }
    else {
      this.tapTimeout = setTimeout(() => {
        this.tap.dispatch(evt) // 异步触发tap事件
        // trigger double tap immediately
        if (this.isDoubleTap) {
          // start方法中计算的满足双击条件时
          this.doubleTap.dispatch(evt) // 触发双击事件
          clearTimeout(this.singleTapTimeout) // 清楚singleTap事件定时器
          this.isDoubleTap = false // 重置双击条件
        }
      }, 0)

      if (!this.isDoubleTap) {
        // 如果不满足双击条件
        this.singleTapTimeout = setTimeout(() => {
          this.singleTap.dispatch(evt) // 触发singleTap事件
        }, 250)
      }
    }

    this.touchEnd.dispatch(evt) // 触发touchEnd事件
    // end结束后重置相关的变量
    this.preV.x = 0
    this.preV.y = 0
    this.zoom = 1
    this.pinchStartLen = null
    this.x1 = this.x2 = this.y1 = this.y2 = null
  }

  cancel(evt: { stopPropagation: () => void }) {
    // 阻止冒泡事件
    if (this.stopPropagation)
      evt.stopPropagation()

    // 关闭所有定时器
    clearTimeout(this.singleTapTimeout)
    clearTimeout(this.tapTimeout)
    clearTimeout(this.longTapTimeout)
    clearTimeout(this.swipeTimeout)
    this.touchCancel.dispatch(evt)
  }

  #cancelLongTap() {
    clearTimeout(this.longTapTimeout) // 关闭longTap定时器
  }

  #cancelSingleTap() {
    clearTimeout(this.singleTapTimeout) // 关闭singleTap定时器
  }

  _swipeDirection(x1: number, x2: number, y1: number, y2: number) {
    // 判断swipe方向
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2)
      ? x1 - x2 > 0
        ? 'Left'
        : 'Right'
      : y1 - y2 > 0
        ? 'Up'
        : 'Down'
  }

  // 给14中手势中一种手势添加监听函数
  on(evt: string | number, handler: any) {
    if (this[evt]) {
      // 事件名在这14中之中，才添加函数到监听事件中
      this[evt].add(handler)
    }
  }

  // 给14中手势中一种手势移除监听函数
  off(evt: string | number, handler: any) {
    if (this[evt]) {
      // 事件名在这14中之中，才移除相应监听函数
      this[evt].del(handler)
    }
  }

  // 清空，重置所有数据
  destroy() {
    // 关闭所有定时器
    if (this.singleTapTimeout) clearTimeout(this.singleTapTimeout)
    if (this.tapTimeout) clearTimeout(this.tapTimeout)
    if (this.longTapTimeout) clearTimeout(this.longTapTimeout)
    if (this.swipeTimeout) clearTimeout(this.swipeTimeout)
    // 移除touch的四个事件
    this.element?.removeEventListener('touchstart', this.start)
    this.element?.removeEventListener('touchmove', this.move)
    this.element?.removeEventListener('touchend', this.end)
    this.element?.removeEventListener('touchcancel', this.cancel)
    // 清除所有手势的监听函数
    this.rotate.del()
    this.touchStart.del()
    this.multipointStart.del()
    this.multipointEnd.del()
    this.pinch.del()
    this.swipe.del()
    this.tap.del()
    this.doubleTap.del()
    this.longTap.del()
    this.singleTap.del()
    this.pressMove.del()
    this.touchMove.del()
    this.touchEnd.del()
    this.touchCancel.del()
    // 重置所有变量
    this.distance
      = this.stopPropagation
      = this.isLongTap
      = this.preV
      = this.pinchStartLen
      = this.zoom
      = this.isDoubleTap
      = this.delta
      = this.last
      = this.now
      = this.tapTimeout
      = this.singleTapTimeout
      = this.longTapTimeout
      = this.swipeTimeout
      = this.x1
      = this.x2
      = this.y1
      = this.y2
      = this.preTapPosition
      = this.rotate
      = this.touchStart
      = this.multipointStart
      = this.multipointEnd
      = this.pinch
      = this.swipe
      = this.tap
      = this.doubleTap
      = this.longTap
      = this.singleTap
      = this.pressMove
      = this.touchMove
      = this.touchEnd
      = this.touchCancel
      = null

    return null
  }
}

export default AlloyFinger
