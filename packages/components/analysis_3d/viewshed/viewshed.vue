<template>
  <n-space justify="end">
    <n-button text @click="startViewshed" class="iconfont iconVue-viewshed" title="可视域分析"></n-button>
    <n-button text @click="clear" class="iconfont iconVue-measure-clear" title="清除"></n-button>
  </n-space>
</template>

<script setup>
let viewshed;
function startViewshed() {
  if (!sceneControl) return;
  if (!viewshed) viewshed = new SuperMap.Web.Realspace.ViewShed3D(sceneControl);
  viewshed.build();
}

function clear() {
  if (viewshed) viewshed.clear();
}
</script>

<style lang="scss" scoped>
button {
  padding: 6px;
  font-size: 24px;
}
</style>



