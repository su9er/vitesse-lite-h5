export default function copyText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 数字没有 .length 不能执行selectText 需要转化成字符串
    const textString = text.toString()
    let input = document.querySelector('#copy-input') as HTMLInputElement
    if (!input) {
      input = document.createElement('input') as HTMLInputElement
      input.id = 'copy-input'
      input.readOnly = true // 防止ios聚焦触发键盘事件
      input.style.position = 'absolute'
      input.style.left = '-1000px'
      input.style.zIndex = '-1000'
      document.body.appendChild(input)
    }

    input.value = textString
    // ios必须先选中文字且不支持 input.select();
    input.setSelectionRange(0, textString.length)
    input.focus()
    if (document.execCommand('copy'))
      resolve()
      // document.execCommand('copy')
    else
      reject(new Error('复制失败'))

    input.blur()
  })
}
