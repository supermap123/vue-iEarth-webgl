<template>
  <n-card closable @close="closePanel"  content-style="padding: 0 20px 15px 20px;">
    <n-tabs type="line" size="large" justify-content="space-between" tab-style='padding-right:10px'>
      <n-tab-pane name="Viewshed" display-directive="show" :tab='resource.Viewshed'> <sm-viewshed/>   </n-tab-pane>
      <n-tab-pane name="Sightline"   display-directive="show" :tab='resource.Sightline'> sightline </n-tab-pane>
      <n-tab-pane name="Skyline" display-directive="show" :tab='resource.Skyline'> skyline  </n-tab-pane>
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
  max-width: 360px;
  position: absolute;
  right: 6%;
  top: 10%;
  z-index: 999;
}
</style>