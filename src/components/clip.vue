<template>
  <n-card closable @close="closePanel"  content-style="padding: 0 20px 15px 20px;">
    <n-tabs type="line" size="large" justify-content="space-between" tab-style='padding-right:10px'>
      <n-tab-pane name="ClipBox" display-directive="if" :tab='resource.ClipBox'>  <sm-clip-box/></n-tab-pane>
      <n-tab-pane name="ClipCross" display-directive="show" :tab='resource.ClipCross'>  <sm-clip-cross/>  </n-tab-pane>
      <n-tab-pane name="ClipPlane"   display-directive="if" :tab='resource.ClipPlane'> <sm-clip-plane/> </n-tab-pane>
      <n-tab-pane name="ClipPolygon" display-directive="show" :tab='resource.ClipPolygon'> <sm-clip-polygon/>  </n-tab-pane>
     
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