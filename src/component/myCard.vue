<template>
  <section class="devs-item">
    <span class="devs-item-card">
      <span class="devs-item-card-body">
        <p style="font-size:15px;">{{title}}</p>
        <span class="devs-item-card-content">
          <slot name="subtitle">{{subTitle}}</slot>
          <span class="devs-item-card-pic">
            <slot name="pic" />
          </span>
        </span>
      </span>
    </span>
  </section>
</template>
<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: "myCard",
    props: {
      title: {
        type: String,
        default: ""
      },
      subTitle: {
        type: String,
        default: ""
      }
    },
    setup() {

    },
  })
</script>
<style lang="scss">
  .devs-item {
    width: 48%;
    min-height: 150px;
    margin-bottom: 12px;
    padding: 8px;
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
</style>