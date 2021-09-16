<template>
  <main class="container">
    <div class="userinfo card" v-if="userInfo">
      <nut-avatar size="large" :icon="userInfo.avatar"></nut-avatar>
      <span>{{userInfo.name}}</span>
    </div>

    <div>
      <nut-cell-group title="常用操作">
        <nut-cell title="批量登记设备" is-link @click="push('/pages/admin/registerDev/index')"></nut-cell>
        <nut-cell title="查询透传DTU" is-link @click="push('/pages/admin/scan/index')"></nut-cell>
        <nut-cell title="查询LADS设备" is-link @click="push('/pages/admin/dev/index')"></nut-cell>
      </nut-cell-group>
      <nut-cell-group title="其它操作">
        <nut-cell title="批量登记DTU" is-link @click="push('/pages/admin/registerDtu/index')"></nut-cell>
        <nut-cell title="查询节点" is-link @click="push('/pages/admin/node/index')"></nut-cell>
        <nut-cell title="清除缓存" @click="clearCache"></nut-cell>
        <nut-cell title="解绑微信" @click="unbindwx"></nut-cell>
      </nut-cell-group>
    </div>
  </main>
</template>
<script lang="ts" setup>
  import api from "../../api";
  import { onBeforeMount, ref } from "vue";
  import Taro from "@tarojs/taro"

  const userInfo = ref<Uart.UserInfo>()

  onBeforeMount(() => {
    start()
  })
  const start = async () => {
    const { data } = await api.userInfo()
    userInfo.value = data
  }

  /**
   * 
   */
  const push = (url: string) => {
    Taro.navigateTo({ url })
  }
  // 解绑微信
  const unbindwx = async () => {
    const d = await Taro.showModal({
      title: '解绑微信',
      content: userInfo.value?.rgtype === 'wx' ? '这将会删除您所有的配置和信息!!!' : '这将会解除小程序和透传账号之间的连接',
    })

    if (d.confirm) {
      const { code } = await api.unbindwx()
      if (code) {
        clearCache()
        await Taro.showModal({
          title: 'success',
          content: '已成功解绑,确定退出小程序'
        });
        Taro.exitMiniProgram()
      }
    }
  }
  const clearCache = () => {
    Taro.getStorageInfo({
      success(res) {
        const size = res.currentSize / 1024
        try {
          Taro.clearStorage({
            success() {
              Taro.showModal({
                title: '缓存清理成功',
                content: '清除缓存' + size + 'MB',
                success() {
                  Taro.reLaunch({ url: '/pages/index/index' })
                }
              })
            }
          })
        } catch (error) {
          Taro.showModal({
            title: '缓存清理失败',
            content: error,
            success() {
              Taro.reLaunch({ url: '/pages/index/index' })
            }
          })
        }
      }
    })
  }

</script>
<style lang="scss">
  .userinfo {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .userinfo-avatar {
    width: 128rpx;
    height: 128rpx;
    margin: 20rpx;
    border-radius: 50%;
  }

  .van-grid {
    margin-top: 12px;
  }

  .info {
    display: flex;
    flex-direction: column;
  }
</style>