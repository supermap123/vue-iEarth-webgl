<template>
  <n-card closable @close="closePanel"  content-style="padding:6px;">
      <sm-measure/>
  </n-card>
</template>

<script setup>
import { inject } from 'vue'

let { seletcedComponent } = inject("state");


//关闭界面
function closePanel() {
  seletcedComponent.value = null;
}
</script>

<style lang="scss" scoped>
.n-card {
  width: auto;
  position: absolute;
  right: 6%;
  top: 6%;
  z-index: 999;
}
</style>