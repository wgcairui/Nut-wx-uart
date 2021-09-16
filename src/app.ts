import { createApp } from 'vue';
import './app.scss';
import {
  Avatar,
  Icon,
  Layout,
  Cell,
  Button,
  Input,
  Switch,
  Picker,
  Popup,
  InputNumber,
  ActionSheet,
  Radio,
  Collapse,
  Tab,
  Swiper,
  NoticeBar
} from '@nutui/nutui-taro';
import Taro from '@tarojs/taro';
// import '@nutui/nutui-taro/dist/style.css';

import '@nutui/nutui-taro/dist/styles/themes/default.scss';

interface referrerInfo {
  /**
   * 来源小程序，或者公众号（微信中）
   */
  appId: string,
  /**
   * 来源小程序传过来的数据，微信和百度小程序在scene=1037或1038时支持
   */
  extraData: Record<string, any>
  /**
   * 来源插件，当处于插件运行模式时可见
   */
  sourceServiceId: string
}

type opt = Taro.RouterInfo & { referrerInfo: referrerInfo }

const App = createApp({
  onShow(options: opt) { },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
  // 可以使用所有的 Vue 生命周期方法
  mounted() { },

  // 对应 onLaunch
  onLaunch() {
    const updateManager = Taro.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      Taro.showToast({ title: res.hasUpdate ? '有新版本,正在后台更新' : '最新版', icon: 'none' })
      console.log("新版本：" + res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  },

  // 对应 onHide
  onHide() {
    Taro.clearStorage()
  },

})

App
  .use(Avatar)
  .use(Icon)
  .use(Layout)
  .use(Cell)
  .use(Button)
  .use(Input)
  .use(Switch)
  .use(Picker)
  .use(Popup)
  .use(InputNumber)
  .use(ActionSheet)
  .use(Radio)
  .use(Collapse)
  .use(Tab)
  .use(Swiper)
  .use(NoticeBar)

export default App;
