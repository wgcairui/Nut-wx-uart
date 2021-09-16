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
    <section v-if="state.ids.length>0">
      <nut-cell-group title="节点名称/最大挂载数/已挂载数">
        <nut-radiogroup v-model="state.node">
          <nut-radio
            v-for="item in nodes"
            :key="item.IP"
            :label="item.Name"
          >{{item.Name}}/{{item.MaxConnections}}/{{item.count}}</nut-radio>
        </nut-radiogroup>
      </nut-cell-group>
      <div style="margin:10px 16px">
        <nut-button block type="success" @click="submit">提交</nut-button>
      </div>
    </section>
  </main>
</template>
<script lang="ts" setup>
  import api from "../../../api";
  import { onMounted, reactive, ref, toRaw } from "vue";
  import scan from "../../../component/scan.vue"
  import Taro from "@tarojs/taro"
  interface devModals {
    name: string,
    value: string
  }

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
    node: ""
  })

  const nodes = ref<Uart.NodeClient[]>([])

  onMounted(async () => {
    const { data } = await api.Nodes()
    nodes.value = data
    state.node = data[0].Name
  })


  const scanRequst = async () => {
    state.ids = [...new Set([...state.ids, state.id])]
  }


  // 删除选择的DTU
  const rmid = (mac: string) => {
    Taro.showModal({
      title: '删除Dtu',
      content: `确定删除Dtu:${mac} ??`,
      success: (res) => {
        if (res.confirm) {
          state.ids = state.ids.filter(el => el !== mac)
        }
      }
    })
  }
  // 提交
  const submit = async () => {
    const { ids, node } = toRaw(state)
    Taro.showModal({
      title: '提交核对',
      content: `本次提交的dtu数目:${ids.length},挂载的节点为:${node},`,
      success: async () => {
        const all = await Promise.all(ids.map(el => api.addRegisterTerminal(el, node)))
        if (all.length === ids.length) {
          Taro.showModal({
            title: '提交成功',
            content: `成功提交[${all.length}] 个设备`
          })
          state.id = ''
          state.ids = []
        } else {
          Taro.showModal({
            title: '提交错误',
            content: '提交错误'
          })
        }
      }
    })
  }

</script>
<style lang="scss">
  .nut-radio {
    margin: 6px 0;
  }
</style>