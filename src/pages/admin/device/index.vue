<template>
  <nut-cell-group v-if="dev" :title="name">
    <nut-cell title="更新时间:" :desc="parseTime(dev.time)"></nut-cell>
    <nut-cell
      v-for="val in dev.result"
      :key="val.name + val.value"
      :title="val.name"
      :desc="val.parseValue"
    ></nut-cell>
  </nut-cell-group>
</template>
<script lang="ts">
  import { onMounted, ref } from "_vue@3.2.11@vue";
  import Taro from "@tarojs/taro"
  import api from "../../../api";
  import { parseTime } from "../../../util";

  export default {

    onLoad() {
      Taro.showLoading({ title: '获取运行数据' })
      this.GetDevsRunInfo()
      Taro.hideLoading()
    },

    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
    onPullDownRefresh: async function () {
      await this.GetDevsRunInfo()
      Taro.stopPullDownRefresh()
    },

    setup() {
      const dev = ref<Uart.queryResultSave>()
      const name = ref("")
      const parms = Taro.getCurrentInstance().router?.params! as any
      const GetDevsRunInfo = async () => {
        const { mac, pid, mountDev } = parms
        name.value = mountDev
        Taro.setNavigationBarTitle(mountDev)
        const { code, data, msg } = await api.getTerminalData(mac!, pid!)
        if (code && data.result) {
          dev.value = data
        } else {
          Taro.showModal({
            title: 'Error',
            content: msg
          })
        }
      }

      return { dev, GetDevsRunInfo, parseTime, name }
    }

  }
</script>
