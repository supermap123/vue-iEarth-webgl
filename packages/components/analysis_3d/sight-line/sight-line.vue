<template>
  <n-space justify="end">
    <n-button text @click="startSightline" class="iconfont iconVue-sightline" title="通视分析"></n-button>
    <n-button text @click="clear" class="iconfont iconVue-measure-clear" title="清除"></n-button>
  </n-space>
</template>

<script setup>
let sightline;
function startSightline() {
  if (!sceneControl) return;
  if (!sightline) sightline = new SuperMap.Web.Realspace.Sightline(sceneControl);
  sightline.build();
}

function clear() {
  if (sightline) sightline.clear();
}
</script>

<style lang="scss" scoped>
button {
  padding: 6px;
  font-size: 24px;
}
</style>



