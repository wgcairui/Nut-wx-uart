<template>
  <main>
    <scan label="IMEI:" v-model="mac" @scan="scanRequst"></scan>
    <div style="margin:10px 16px">
      <nut-button block type="info" @click="scanRequst">查询</nut-button>
    </div>
    <span v-if="dev" class="terminal">
      <nut-cell-group :title="dev.name">
        <nut-cell title="Mac:" :desc="dev.DevMac"></nut-cell>
        <nut-cell title="DTU名称:" :desc="dev.name"></nut-cell>
        <nut-cell title="接入节点:" :desc="dev.mountNode"></nut-cell>
        <nut-cell title="上线时间:" :desc="parseTime(dev.uptime)"></nut-cell>
        <nut-cell title="AT指令支持:">
          <template #link>
            <nut-switch v-model="dev.AT" />
          </template>
        </nut-cell>
        <nut-cell title="Gps:" :desc="dev.jw"></nut-cell>
        <nut-cell title="Port:" :desc="dev.port"></nut-cell>

        <nut-cell title="通讯:" :desc="dev.uart"></nut-cell>
        <nut-cell title="状态:">
          <template #link>
            <nut-switch v-model="dev.online" />
          </template>
        </nut-cell>
        <nut-cell title="挂载设备数目:" :desc="dev.mountDevs ? dev.mountDevs.length : 0"></nut-cell>
      </nut-cell-group>
      <nut-collapse
        icon="down-arrow"
        v-if="dev.iccidInfo && dev.iccidInfo.statu"
        v-model:active="collp"
      >
        <nut-collapse-item title="查看物联卡信息" :name="2">
          <nut-cell-group :title="dev.ICCID">
            <nut-cell title="开始时间:" :desc="dev.iccidInfo.validDate"></nut-cell>
            <nut-cell title="过期时间:" :desc="dev.iccidInfo.expireDate"></nut-cell>
            <nut-cell title="流量(MB):" :desc="dev.iccidInfo.flowResource/1024"></nut-cell>
            <nut-cell title="以使用(MB):" :desc="(dev.iccidInfo.flowUsed/1024).toFixed(0)"></nut-cell>
            <nut-cell
              title="百分百(%):"
              :desc="((dev.iccidInfo.flowUsed/dev.iccidInfo.flowResource)*100).toFixed(0)"
            ></nut-cell>
            <nut-cell title="套餐:" :desc="dev.iccidInfo.resName"></nut-cell>
          </nut-cell-group>
        </nut-collapse-item>
      </nut-collapse>
      <div style="margin:10px 16px">
        <nut-button block @click="bindDevId">绑定设备Id</nut-button>
        <nut-button block @click="modifyUart">修改波特率</nut-button>
        <nut-button block @click="initTerminal">初始化设备</nut-button>
        <nut-button block @click="iotRemoteUrl">获取远程调试地址</nut-button>
      </div>
      <section v-if="dev.mountDevs && dev.mountDevs.length>0">
        <span v-for="mountDev in dev.mountDevs" :key="mountDev.pid+mountDev.mountDev">
          <nut-cell-group :title="mountDev.mountDev">
            <nut-cell title="设备类型:" :desc="mountDev.Type"></nut-cell>
            <nut-cell title="设备型号:" :desc="mountDev.mountDev"></nut-cell>
            <nut-cell title="设备地址:" :desc="mountDev.pid"></nut-cell>
            <nut-cell title="设备协议:" :desc="mountDev.protocol"></nut-cell>
            <nut-cell title="设备Id:" :desc="mountDev.bindDev"></nut-cell>
            <nut-cell title="状态:">
              <template #link>
                <nut-switch v-model="mountDev.online" />
              </template>
            </nut-cell>
          </nut-cell-group>
          <div style="margin:10px 16px">
            <nut-button block @click="see(mountDev)">查看</nut-button>
            <nut-button block @click="rmBind(mountDev)">删除</nut-button>
          </div>
        </span>
      </section>
    </span>
  </main>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import scan from "../../../component/scan.vue";
  import Taro from "@tarojs/taro"
  import api from "../../../api";
  import { ObjectToStrquery, parseTime } from "../../../util";
  const mac = ref('')
  const dev = ref<Uart.Terminal>()
  const collp = ref([])
  // 查询DTU设备信息
  const scanRequst = async () => {
    Taro.showLoading({ title: '查询中' })
    const { code, data } = await api.getRootTerminal(mac.value)
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

  /**
   * 初始化dtu
   */
  const initTerminal = async () => {
    const { confirm } = await Taro.showModal({
      title: '初始化' + dev.value!.name,
      content: '初始化操作不可逆,会清除dtu绑定的设备信息,告警信息,且只能清除未被绑定的dtu!!!'
    })
    if (confirm) {
      Taro.showLoading({ title: 'loading' })
      const { code, data, msg } = await api.initTerminal(dev.value!.DevMac)
      if (code) {
        Taro.showModal({
          title: 'success',
          content: `耗时${data}ms`
        })
        scanRequst()
      } else {
        Taro.showModal({
          title: 'error',
          content: msg
        })
      }
    }
  }

  /**
   * 修改波特率
   */
  const modifyUart = async () => {
    const uarts = ['2400,8,1,NONE,NFC', '4800,8,1,NONE,HD', '9600,8,1,NONE,HD', '19200,8,1,NONE,HD', '115200,8,1,NONE,HD']
    const d = await Taro.showActionSheet({
      itemList: uarts
    })
    if (dev.value!.DevMac && d.errMsg === 'showActionSheet:ok') {
      const uart = `+++AT+UART=1,` + uarts[d.tapIndex]
      Taro.showLoading({ title: '正在修改' })
      const { code, data } = await api.sendATInstruct(dev.value!.DevMac, uart)
      Taro.hideLoading()
      if (code && data.ok) {
        Taro.showToast({
          title: 'success'
        })
        dev.value!.uart = uarts[d.tapIndex]
      } else {
        Taro.showModal({
          title: '操作失败',
          content: data.msg
        })
      }
    }
  }
  /**
   * 绑定设备id
   */
  const bindDevId = async () => {
    const scanResult = await Taro.scanCode({})
    Taro.showLoading({ title: 'loading' })
    const t = await api.getTerminal(scanResult.result)
    if (t.data) {
      Taro.hideLoading()
      Taro.showModal({
        title: 'error',
        content: `${scanResult.result}已被dtu:${t.data.DevMac} 绑定`
      })
      return
    }
    const { data } = await api.getRegisterDev(scanResult.result)
    Taro.hideLoading()
    if (data) {
      const { confirm } = await Taro.showModal({
        title: '确认绑定信息',
        content: `类型:${data.Type}\n 设备:${data.mountDev}\n 协议:${data.protocol}\n 地址:${data.pid}`
      })
      if (confirm) {
        Taro.showLoading({ title: '正在绑定设备' })
        const r = await api.addTerminalMountDev(dev.value!.DevMac, { mountDev: data.mountDev, Type: data.Type, protocol: data.protocol, pid: data.pid, bindDev: scanResult.result })
        Taro.hideLoading()
        if (r.code) {
          Taro.showToast({
            title: '设备绑定成功'
          })
          scanRequst()
        }
      }
    } else {
      Taro.showModal({
        title: '流程出错',
        content: `${scanResult.result}未注册,请先注册后绑定`
      })
    }

  }

  // 查看设备数据
  const see = ({ pid, mountDev }: Uart.TerminalMountDevs) => {
    Taro.navigateTo({
      url: '/pages/admin/device/index' + ObjectToStrquery({ pid: String(pid), mac: mac.value, mountDev })
    })
  }

  // 删除绑定设备
  const rmBind = async ({ pid, mountDev }: Uart.TerminalMountDevs) => {
    const { confirm } = await Taro.showModal({
      title: '删除绑定设备',
      content: `确定删除 ${mountDev} ???`
    })
    if (confirm) {
      api.delTerminalMountDev(dev.value!.DevMac, pid).then(() => {
        scanRequst()
      })
    }
  }
  //远程调试设备
  const iotRemoteUrl = async () => {
    const { code, data } = await api.iotRemoteUrl(mac.value)
    if (!code) {
      Taro.showModal({
        title: '获取失败',
        content: '设备未绑定到IOT账号'
      })
    } else {
      if (!/ remote_code=$/.test(data)) {
        Taro.showModal({
          title: '调试地址',
          content: data,
          success() {
            Taro.setClipboardData({
              data,
              success() {
                Taro.showToast({
                  title: '已复制网址到剪切板'
                })
              }
            })
          }
        })
      } else {
        Taro.showModal({
          title: '获取失败',
          content: '设备未连接到iot server中心'
        })
      }
    }
  }

</script>
<style lang="scss">
  .terminal .nut-button {
    margin: 4px 0;
  }
</style>