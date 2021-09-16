<template>
  <main>
    <scan label="IMEI:" v-model="mac" @scan="scanRequst"></scan>
    <div style="margin:10px 16px">
      <nut-button block type="info" @click="scanRequst">查询</nut-button>
    </div>
    <span v-if="dev">
      <nut-cell-group :title="mac">
        <nut-cell title="ID:" :desc="dev.id"></nut-cell>
        <nut-cell title="类型:" :desc="dev.Type"></nut-cell>
        <nut-cell title="设备:" :desc="dev.mountDev"></nut-cell>
        <nut-cell title="协议:" :desc="dev.protocol"></nut-cell>
        <nut-cell title="地址:" :desc="dev.pid"></nut-cell>
        <nut-cell title="注册时间:" :desc="parseTime(dev.timeStamp)"></nut-cell>
      </nut-cell-group>
      <div style="margin:10px 16px">
        <nut-button block @click="delRegisterDev">删除</nut-button>
      </div>
    </span>
  </main>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import scan from "../../../component/scan.vue";
  import Taro from "@tarojs/taro"
  import api from "../../../api";
  import { parseTime } from "../../../util";
  const mac = ref('')
  const dev = ref<Uart.registerDev>()

  // 查询DTU设备信息
  const scanRequst = async () => {
    Taro.showLoading({ title: '查询中' })
    const { code, data } = await api.getRegisterDev(mac.value)
    Taro.hideLoading()
    if (code && data) {
      //(data as any).timeStamp = parseTime((data as any).timeStamp)
      dev.value = data
    } else {
      Taro.showModal({
        title: 'search',
        content: '此设备没有注册，请核对设备是否在我司渠道购买'
      })
    }
  }

  // 删除注册设备
  const delRegisterDev = async () => {
    const { confirm } = await Taro.showModal({
      title: '删除设备',
      content: `确定删除${mac.value} ???`
    })

    if (confirm) {
      Taro.showLoading({ title: "loading" })
      const { code, msg } = await api.delRegisterDev(mac.value)
      Taro.hideLoading()
      if (code) {
        Taro.showModal({
          title: 'success',
          content: '已删除',
          success() {
            Taro.navigateBack()
          }
        })
      } else {
        Taro.showModal({
          title: 'error',
          content: msg
        })
      }
    }
  }

</script>