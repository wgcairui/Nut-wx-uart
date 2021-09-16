export default {
  pages: [
    "pages/login/index",
    'pages/index/index',
    'pages/alarm/index',
    "pages/user/index",
    "pages/dtu/index",
    "pages/devs/index",
    "pages/admin/index",
    "pages/bindDev/index",
    "pages/admin/registerDev/index",
    "pages/admin/dev/index",
    "pages/admin/scan/index",
    "pages/admin/registerDtu/index",
    "pages/admin/node/index",
    "pages/admin/device/index"
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'LADS云平台',
    navigationBarTextStyle: 'black'
  },
  permission: {
    "scope.userLocation": {
      desc: "您的位置将用于定位您的DTU设备"
    },

  },
  tabBar: {
    color: "#000",
    selectedColor: "#1296db",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    position: "bottom",
    list: [
      {
        "pagePath": "pages/index/index",
        "text": "设备",
        "iconPath": "assert/Devs.png",
        "selectedIconPath": "assert/Devs_select.png"
      },
      {
        "pagePath": "pages/alarm/index",
        "text": "告警",
        "iconPath": "assert/alarm.png",
        "selectedIconPath": "assert/alarm_select.png"
      },
      {
        "pagePath": "pages/user/index",
        "text": "我的",
        "iconPath": "assert/user.png",
        "selectedIconPath": "assert/user_select.png"
      }
    ]
  }
} as Taro.AppConfig
