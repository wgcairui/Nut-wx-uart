<template>
  <main>
    <nut-cell-group v-for="val in nodes" :key="val.IP" :title="val.Name">
      <nut-cell title="IP" :desc="val.IP"></nut-cell>
      <nut-cell title="Port" :desc="val.Port"></nut-cell>
      <nut-cell title="最大连接数" :desc="val.MaxConnections"></nut-cell>
      <nut-cell title="已使用连接数" :desc="val.count"></nut-cell>
      <nut-cell title="使用比例" :desc="val.count/val.MaxConnections+'%'"></nut-cell>
    </nut-cell-group>
  </main>
</template>
<script lang="ts" setup>
  import api from "../../../api";
  import { onMounted, ref } from "vue";

  const nodes = ref<Uart.NodeClient[]>([])
  onMounted(() => {
    api.Nodes().then(el => {
      nodes.value = el.data
    })
  })
</script>
