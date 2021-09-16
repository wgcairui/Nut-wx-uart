<template>
  <section class="avatar">
    <nut-avatar @click="getUserInfo" size="120" :icon="accont.avatar"></nut-avatar>
    <p style="margin:5px 0">{{accont.nickName}}</p>
  </section>
  <section>
    <nut-tab @switch-tab="t=>accont.tab=t">
      <nut-tab-panel tab-title="微信注册"></nut-tab-panel>
      <nut-tab-panel tab-title="账号登录"></nut-tab-panel>
    </nut-tab>
  </section>
  <section class="input">
    <div v-if="accont.tab===0">
      <div class="tel">
        <nut-input v-model="accont.tel" require-show type="text" label="手机号" placeholder="请输入手机号码" />
        <nut-button
          size="small"
          type="info"
          open-type="getPhoneNumber"
          @bind="getphonenumber"
        >获取手机号码</nut-button>
      </div>
      <div class="center">
        <nut-button
          plain
          type="info"
          :loading="accont.loading"
          :disabled="!accont.tel"
          @click="register"
        >注册</nut-button>
      </div>
    </div>
    <div v-else>
      <nut-input v-model="accont.user" require-show type="text" label="账号" placeholder="请输入账号或手机" />
      <nut-input
        type="password"
        require-show
        label="密码"
        placeholder="请输入密码"
        v-model="accont.passwd"
      />
      <div class="center">
        <nut-button
          plain
          type="info"
          :loading="accont.loading"
          :disabled="!accont.passwd || !accont.user"
          @click="login"
        >登录</nut-button>
      </div>
    </div>
  </section>
  <section class="readme">
    <p>本小程序用于特定范围用户(使用我司云平台物联网设备)在手机上查看个人搭配的透传设备,需要使用云平台账号或授权使用微信用户信息(手机号,用户名,头像,id)注册使用,无法在开放范围提供服务,敬请谅解</p>
  </section>
</template>
<script lang="ts">
  import { reactive, toRaw } from "vue";
  import Taro from "@tarojs/taro"
  import api from "../../api";

  export default {
    onLoad(query: { scene?: string }) {
      console.log(query);

      Taro.showLoading({ title: 'loading' })
      Taro.login({
        success: async login => {
          // 发送网络请求，获取在线账户
          const { code, data } = await api.login({ js_code: login.code, scene: query.scene ? decodeURIComponent(query.scene) : '' })
          Taro.hideLoading()
          if (code) {
            const user = await api.userInfo()
            Taro.hideLoading()
            // 判断user用户组,如果是admin则跳转到专有页面
            switch (user.data.userGroup) {
              case "admin":
              case "root":
                Taro.reLaunch({ url: "/pages/admin/index" })
                break
              default:
                Taro.reLaunch({ url: "/pages/index/index" })
                break
            }
          }
          else {
            const { unionid, openid } = data
            this.accont.unionid = unionid
            this.accont.openid = openid
            /* Taro.hideLoading()
            Taro.reLaunch({ url: "/pages/login/index?openid=" + data.openid + "&unionid=" + data.unionid }) */
          }
        }
      })
    },
    setup() {
      const accont = reactive({
        user: "",
        passwd: "",
        avatar: "https://www.ladishb.com/upload/11122020__LADS108.png",
        nickName: "",
        loading: false,
        tab: 0,
        tel: '15337364316',
        openid: "",
        unionid: ""
      })




      const getUserInfo = async () => {
        const { userInfo } = await Taro.getUserProfile({
          desc: '用于注册小程序'
        })
        if (userInfo) {
          accont.nickName = userInfo.nickName
          accont.avatar = userInfo.avatarUrl

        }
      }

      // 获取用户手机号码
      const getphonenumber = async (e: any) => {
        console.log(e);

        if (!e.detail.encryptedData) return
        Taro.showLoading({ title: '获取手机号' })
        const { data } = await api.getphonenumber({ openid: '', encryptedData: e.detail.encryptedData, iv: e.detail.iv })
        accont.tel = data.phoneNumber

        Taro.hideLoading()
      }
      // 注册用户
      const register = async () => {
        // await this.getUserInfo()
        const tel = accont.tel
        if (!tel || !/^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/.test(tel.toString())) {
          Taro.showToast({ title: "需要手机号码", icon: "none" })
          return
        }
        // await SubscribeMessage(['注册成功提醒'])
        const { nickName, avatar, unionid, openid } = toRaw(accont)
        console.log({ nickName, avatar, unionid, openid });
        accont.loading = true
        const { code, msg } = await api.registerUser({ user: unionid, openid, name: nickName, avanter: avatar, tel })
        accont.loading = false
        if (!code) {
          Taro.showModal({ title: msg })
        } else {
          Taro.reLaunch({ url: '/pages/index/index' })
        }
      }

      const login = async () => {
        accont.loading = true
        const { openid, unionid } = Taro.getCurrentInstance().router?.params!
        const { user, passwd, avatar, nickName } = toRaw(accont)
        console.log({ openid, unionid, user, passwd, avatar, nickName });

        const { code, msg } = await api.userlogin({ avanter: avatar, openid: openid!, unionid: unionid!, user, passwd })
        accont.loading = false
        if (code) {
          Taro.reLaunch({ url: '/pages/index/index' })
        } else {
          Taro.showModal({
            title: '登录错误',
            content: msg,
            success: () => {
              accont.passwd = ""
            }
          })
        }
      }
      return { login, register, getphonenumber, getUserInfo, accont }
    }
  }


</script>
<style lang="scss">
  .avatar {
    height: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .readme {
    padding: 48rpx 36rpx;
    font-size: 23rpx;
    font-weight: 500;
  }
  .center {
    padding: 16px;
  }
  .tab-swiper {
    height: 0 !important;
  }
  .input {
    height: 200px;
    padding: 12px 0;
  }
  .tel {
    display: flex;
    padding-right: 8px;
    align-items: center;
    .nut-input .h5-input {
      width: auto;
    }
  }
</style>
