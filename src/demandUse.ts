import type { App } from 'vue'
import { Button, Dialog, Toast } from 'vant'

export default function demandUse(app: App) {
  Toast.setDefaultOptions('loading', { forbidClick: true })

  app.use(Button)
  app.use(Dialog)
  app.use(Toast)
}
