<template>
  <nut-row class="scan-postion">
    <nut-col :span="22">
      <nut-input v-model="val" :label="label" @change="change" />
    </nut-col>
    <nut-col :span="2">
      <nut-icon name="scan2" size="20" @click="scan"></nut-icon>
    </nut-col>
  </nut-row>
</template>
<script lang="ts">
  import { defineComponent, ref, watchEffect } from 'vue'
  import Taro from "@tarojs/taro"
  export default defineComponent({
    props: {
      modelValue: String,
      label: String
    },
    emits: ["update:modelValue", "scan"],
    setup(_prps, ctx) {
      const val = ref('')
      const change = (val: string) => {
        ctx.emit("update:modelValue", val)
      }

      watchEffect(() => {
        val.value = _prps.modelValue || ''
      })

      const scan = () => {
        Taro.scanCode({
          success(res) {
            val.value = res.result
            ctx.emit("update:modelValue", res.result)
            ctx.emit("scan", res.result)
          }
        })
      }
      return { change, scan, val }
    },
  })
</script>
<style lang="scss">
  .scan-postion {
    display: flex;
    align-items: center;
    padding: 10px 4px;
  }
</style>