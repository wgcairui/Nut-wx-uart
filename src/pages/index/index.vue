<template>
  <section>
    <nut-noticebar v-if="state.alarmNum>0" :text="state.alarm" @click="seeAlarm"></nut-noticebar>
    <nut-noticebar :text="stateInfo" color="#4C96DF"></nut-noticebar>
  </section>
  <section class="terminal">
    <nut-tab @switch-tab="n=>state.tab=n">
      <nut-tab-panel tab-title="设备"></nut-tab-panel>
      <nut-tab-panel tab-title="透传终端"></nut-tab-panel>
    </nut-tab>
    <div class="devs" v-if="state.tab===0">
      <my-card
        v-for="(item,key) in dtuItem"
        :key="key"
        :title="item.mountDev+'|'+item.dtu"
        @click="showMountDevData(item)"
      >
        <template #subtitle>
          <span>
            <nut-icon size="12" name="star" :color="item.online?'#00a1ff':'red'"></nut-icon>
            <span>{{item.online?'在线':'离线'}}</span>
          </span>
          <p class>{{item.protocol}}</p>
        </template>
        <template #pic>
          <img :src="item.pic" />
        </template>
      </my-card>
    </div>
    <div v-else class="devs">
      <span class="devs-item" v-for="(item,key) in DTUs" :key="key" @click="toDev(item.DevMac)">
        <span class="devs-item-card">
          <span class="devs-item-card-body">
            <p style="font-size:15px;">{{item.name}}</p>
            <span class="devs-item-card-content">
              <span>
                <span>
                  <nut-icon size="12" name="star" :color="item.online?'#00a1ff':'red'"></nut-icon>
                  <span>{{item.online?'在线':'离线'}}</span>
                </span>
                <p class>{{item.mountDevs.length || 0}}个设备</p>
              </span>
              <span class="devs-item-card-pic">
                <nut-icon name="category"></nut-icon>
              </span>
            </span>
          </span>
        </span>
      </span>
    </div>
  </section>
  <official-account bindload="bindload" binderror="binderror"></official-account>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import Taro from '@tarojs/taro';
  import api from '../../api';
  import { ObjectToStrquery } from "../../util"
  import myCard from "../../component/myCard.vue"
  /** DTU设备信息 */
  const DTUs = ref<Uart.Terminal[]>([])
  // 
  const state = reactive({
    tab: 0,
    /**
     * 告警状态信息
     */
    alarm: '',
    /**
     * 未确认告警数量
     */
    alarmNum: 0,
    confirm: false

  })
  // 虚拟设备
  const Vm = ref<Uart.Terminal[]>([])

  const devPics = {
    "UPS": require('../../assert/ups.png'),
    "温湿度": require('../../assert/th.png'),
    "电量仪": require('../../assert/em.png'),
    "空调": require('../../assert/air.png')
  }

  /**
   * 分类挂载设备类型
   */
  const dtuItem = computed(() => {

    const a = DTUs.value
      .map(dtu => dtu.mountDevs.map(dev => ({ ...dev, pic: devPics[dev.Type], dtu: dtu.name, online: dev.online && dtu.online })))
      .flat()

    console.log({ a });
    return a


  })


  /**
   * 统计所有设备状态
   */
  const stateInfo = computed(() => {
    const terminals = DTUs.value
    if (terminals.length > 0) {
      const terminal_all = terminals.length
      const terminal_on = terminals.map(el => el.online).filter(el => el).length
      const monutDev_all = terminals.map(el => el.mountDevs.length).reduce((pre, cur) => pre + cur)
      const mountDev_on = terminals.map(el => el.mountDevs.filter(el2 => el2.online)).reduce((pre, cur) => [...pre, ...cur]).length
      return `DTU:(全部${terminal_all}/在线${terminal_on}),挂载设备:(全部${monutDev_all}/在线${mountDev_on})`
    }
    else {
      return ''
    }
  })

  onMounted(() => {
    Taro.setNavigationBarColor({
      backgroundColor: "#487ed9",
      frontColor: "#ffffff"
    })
    bindDev()
  })

  // 获取用户绑定设备
  const bindDev = async () => {
    Taro.showLoading({ title: '获取DTU' })
    const { code, data } = await api.BindDev()
    Taro.hideLoading()
    if (code) {
      DTUs.value = data.UTs
      // 获取未读取的alarm数量
      api.getAlarmunconfirmed().then(({ data: len }) => {
        state.alarmNum = len
        state.alarm = len > 0 ? `有${len}条未确认的告警信息，点击查看?` : ''
      })

      if (data.UTs.length === 0 && !state.confirm) {
        Taro.showModal({
          title: '添加设备',
          content: '您还没有任何设备，是否添加设备?',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({
                url: '/pages/bindDev/index'
              })
            } else {
              state.confirm = true
              //this.addVm()
            }
          }
        })
      }
    }
  }

  // 查看挂载
  function toDev(mac: string) {
    Taro.navigateTo({
      url: '/pages/dtu/index' + ObjectToStrquery({ mac })
    })
  }

  // 查看设备数据
  function showMountDevData(mountDev: Uart.TerminalMountDevs & { dtu: string }) {
    const { DevMac } = DTUs.value.find(el => el.name === mountDev.dtu)!
    Taro.navigateTo({
      url: '/pages/devs/index' + ObjectToStrquery({ ...mountDev, DevMac })
    })
  }

  /**
   * 查看告警
   */
  const seeAlarm = () => {
    Taro.switchTab({ url: '/pages/alarm/index?num=' + state.alarmNum })
  }
  /*  //mac=98D863CC870D&pid=0&mountDev=G2K
   async onPullDownRefresh() {
         await this.bindDev()
         this.countDev(this.data.DTUs)
         this.start()
         Taro.stopPullDownRefresh()
       } */
  //
  function bindload(event: any) {
    console.log(`公众号加载success,状态:${event.detail.errMsg}`);
  }
  function binderror(event: any) {
    console.log(`公众号加载error,状态:${event.detail.errMsg}`);
  }

  // 添加虚拟设备
  async function addVm() {
    const { ok, arg } = await api.addVm()
    if (ok) {
      Vm.value = arg
      //sortDevs(arg)
    }
  }

</script>
<style lang="scss">
  .terminal {
    background-color: #565656;
    padding: 8px;
  }
  .devs {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1rem;

    .devs-item {
      width: 48%;
      min-height: 150px;
      margin-bottom: 12px;
      .devs-item-card {
        background-color: #fff;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        position: relative;
        /* box-shadow: 1px 1px 3px #fff; */

        .devs-item-card-body {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          padding: 16px 12px 12px 22px;
          display: flex;
          flex-direction: column;

          .devs-item-card-content {
            margin-top: auto;
            display: flex;
            span,
            p {
              font-size: 14px;
              color: #717171;
              overflow: hidden;
              text-overflow: ellipsis;
              /* white-space: nowrap; */
            }
          }

          .devs-item-card-pic {
            margin-left: auto;
            width: 50px;
            height: 50px;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }

    .devs-item:nth-child(2n) {
      margin-left: 4%;
    }
  }

  .tab-swiper {
    height: 0 !important;
  }
</style>
