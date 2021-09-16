<template>
  <main>
    <section>
      <scan label="设备ID:" v-model="state.id" @scan="scanRequst"></scan>
      <div style="margin:10px 16px">
        <nut-button block type="info" @click="scanRequst">添加设备</nut-button>
      </div>
    </section>
    <section>
      <nut-cell-group :title="'设备列表/'+state.ids.length">
        <nut-cell v-for="val in state.ids" :key="val" :title="val">
          <template #link>
            <nut-icon name="close" @click="rmid(val)" color="#fa2c19"></nut-icon>
          </template>
        </nut-cell>
      </nut-cell-group>
    </section>
    <section>
      <nut-cell-group title="添加设备参数">
        <nut-cell title="设备类型" :desc="state.devType" @click="selectType"></nut-cell>
        <nut-cell title="设备型号" :desc="state.devModal" @click="state.isModal = true"></nut-cell>
        <nut-cell title="设备协议" :desc="state.devProtocol" @click="state.isProtocol = true"></nut-cell>
        <nut-cell title="设备地址">
          <template #link>
            <nut-inputnumber v-model="state.pid" min="0" max="255" />
          </template>
        </nut-cell>
      </nut-cell-group>
      <nut-actionsheet
        v-model:visible="state.isModal"
        :menu-items="modalItems"
        @choose="i=>state.devModal = i.value"
      ></nut-actionsheet>
      <nut-actionsheet
        v-model:visible="state.isProtocol"
        :menu-items="protocolItems"
        @choose="i=>state.devProtocol = i.value"
      ></nut-actionsheet>

      <div style="margin:10px 16px">
        <nut-button block type="success" @click="submit">提交</nut-button>
      </div>
    </section>
  </main>
</template>
<script lang="ts" setup>
  import api from "../../../api";
  import { computed, reactive, ref, toRaw, watchEffect } from "vue";
  import scan from "../../../component/scan.vue"
  import Taro from "@tarojs/taro"
  interface devModals {
    name: string,
    value: string
  }

  const devTypes = ['UPS', "空调", '电量仪', '温湿度']
  const devModes = ref<Uart.DevsType[]>([])


  const state = reactive({
    /**
     * 设备id
     */
    id: "",
    /**
     * 已扫描的设备id
     */
    ids: [] as string[],
    /**
     * 设备类型
     */
    devType: 'UPS',
    /**
     * 设备型号
     */
    devModal: '',
    isModal: false,
    /**
     * 设备协议
     */
    devProtocol: '',
    isProtocol: false,
    /**
     * pid
     */
    pid: 1
  })

  /**
   * 根据设备类型变化更新型号列表
   */
  watchEffect(async () => {
    const { data } = await api.getDevTypes(state.devType)
    devModes.value = data
    state.devModal = ''
    state.devProtocol = ''
  })

  /**
   * 如果以选择设备型号为空或者设备型号中不包含此协议,清除已选的协议
   */
  watchEffect(() => {
    state.devProtocol = (state.devModal === '' || devModes.value.find(el => el.DevModel === state.devModal)!.Protocols.findIndex(el => el.Protocol === state.devProtocol) === -1) ? '' : state.devProtocol
  })

  const modalItems = computed(() => devModes.value.map(el => ({ name: el.DevModel, value: el.DevModel })))
  const protocolItems = computed(() => devModes.value.find(el => el.DevModel === state.devModal)?.Protocols.map(el => ({ name: el.Protocol, value: el.Protocol })))

  /**
   * 选择设备类型
   */
  const selectType = async () => {
    const { errMsg, tapIndex } = await Taro.showActionSheet({ itemList: devTypes })
    if (errMsg === 'showActionSheet:ok') {
      state.devType = devTypes[tapIndex]
    }
  }


  const scanRequst = async () => {
    Taro.showLoading({ title: '查询中' })
    const r = await api.getRegisterDev(state.id)
    Taro.hideLoading()
    if (r.code && r.data) {
      Taro.showModal({
        title: '重复注册',
        content: `设备${r.data.id}/${r.data.mountDev}已被注册`
      })
    } else
      state.ids = [...new Set([...state.ids, state.id])]
  }


  // 删除选择的DTU
  const rmid = (mac: string) => {
    Taro.showModal({
      title: '删除Id',
      content: `确定删除Id:${mac} ??`,
      success: (res) => {
        if (res.confirm) {
          state.ids = state.ids.filter(el => el !== mac)
        }
      }
    })
  }
  // 提交
  const submit = async () => {
    const { ids, pid, devModal, devProtocol, devType } = toRaw(state)
    console.log({ ids, pid, devModal, devProtocol, devType });
    
    if (ids.length === 0 || !pid || !devProtocol || !devModal || !devType) {
      Taro.showModal({
        title: '校验错误',
        content: "缺少参数"
      })
      return
    }
    const mountDev: Uart.TerminalMountDevs = {
      Type: devType,
      mountDev: devModal,
      pid,
      protocol: devProtocol
    }

    const res = await Taro.showModal({
      title: '登记设备',
      content: `确认参数[${mountDev.mountDev}]/[${mountDev.protocol}]/[${mountDev.pid}] !!!`
    })
    if (res.confirm) {
      Taro.showLoading({ title: '正在登记' })
      const r = await api.addRegisterDev(ids, mountDev)
      Taro.hideLoading()
      if (r.code) {
        Taro.showModal({
          title: 'success',
          content: `成功注册设备${r.data.length}个`
        })
        state.id = ''
        state.ids = []
      }
    }
  }

</script>
