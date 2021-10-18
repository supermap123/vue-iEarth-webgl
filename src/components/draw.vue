<template>
  <n-card closable @close="closePanel"  content-style="padding: 0 20px 15px 20px;">
    <n-tabs type="line" size="large" justify-content="space-between" tab-style='padding-right:10px'>
      <n-tab-pane name="DrawPoint" display-directive="show" :tab='resource.DrawPoint'> DrawPoint</n-tab-pane>
      <n-tab-pane name="DrawPolyline" display-directive="show" :tab='resource.DrawPolyline'>  DrawPolyline  </n-tab-pane>
      <n-tab-pane name="DrawPolygon"   display-directive="show" :tab='resource.DrawPolygon'> DrawPolygon </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import { inject } from "vue";
let { resource, seletcedComponent } = inject("state");

//关闭界面
function closePanel() {
  seletcedComponent.value = null;
}

</script>

<style lang="scss" scoped>
.n-card {
  width: auto;
  min-width: 300px;
  position: absolute;
  right: 6%;
  top: 10%;
  z-index: 999;
}
</style>