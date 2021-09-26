<template>
  <n-card closable @close="closePanel" v-show="show">
    <n-tabs type="line" size="large" justify-content="space-evenly">
      <n-tab-pane name="PublicService" display-directive="show" :tab="resource.PublicService">
        <sm-public-service @click-callback="clickCallback" :service-options="options" />
      </n-tab-pane>
      <n-tab-pane name="CustomService" display-directive="show" :tab="resource.CustomService">
        <sm-custom-service @closeEmit="closePanel" />
      </n-tab-pane>
      <n-tab-pane name="LocalData" display-directive="show" :tab="resource.LocalData">本地数据</n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import options from "js/public-service-config";
import { inject } from "vue";

// 添加公共服务点击时回调，返回点击对象和添加的图层
function clickCallback(data, layers) {
  // 白膜添加线框
  if (data.style && data.style.fillStyle) {
    layers[0].style3D.lineColor = Cesium.Color.fromCssColorString(
      "rgb(67,67,67)"
    );
    layers[0].style3D.fillStyle = Cesium.FillStyle[data.style.fillStyle];
  }
}


let props = defineProps({
  show: Boolean
});

let resource = inject("resource");

let showComponent = inject("showComponent");
function closePanel(val) {
  showComponent.value = val;
}
</script>

<style lang="scss" scoped>
.n-card {
  max-width: 600px;
  position: absolute;
  left: 50%;
  margin-left: -300px;
  top: 30%;
  z-index: 999;
}
</style>