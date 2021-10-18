<template>
  <n-card closable @close="closePanel"  content-style="padding: 0 20px 15px 20px;">
    <n-tabs type="line" size="large" justify-content="space-between" tab-style='padding-right:10px'>
      <n-tab-pane name="TerrainOperation" display-directive="show" :tab='resource.TerrainOperation'> TerrainOperation</n-tab-pane>
      <n-tab-pane name="TerrainSlope" display-directive="show" :tab='resource.TerrainSlope'>  TerrainSlope  </n-tab-pane>
      <n-tab-pane name="TerrainFlood"   display-directive="show" :tab='resource.TerrainFlood'> TerrainFlood </n-tab-pane>
      <n-tab-pane name="TerrainIsoline" display-directive="show" :tab='resource.TerrainIsoline'> <sm-terrain-isoline/> </n-tab-pane>
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