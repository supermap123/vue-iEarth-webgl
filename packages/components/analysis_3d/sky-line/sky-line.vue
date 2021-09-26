<template>
  <n-space justify="end">
    <n-button text @click="startSkyline" class="iconfont iconVue-Skyline" title="天际线分析"></n-button>
    <n-button text @click="clear" class="iconfont iconVue-measure-clear" title="清除"></n-button>
  </n-space>
</template>

<script setup>
let skyline;
function startSkyline() {
  if (!sceneControl) return;
  if (!skyline) skyline = new SuperMap.Web.Realspace.Skyline(sceneControl);
  skyline.build();
}

function clear() {
  if(skyline) skyline.clear();
}
</script>

<style lang="scss" scoped>
button {
  padding: 6px;
  font-size: 24px;
}
</style>



