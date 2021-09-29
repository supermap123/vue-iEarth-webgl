<template>
  <n-card closable @close="closePanel">
    <n-tabs type="line" size="large" justify-content="space-evenly">
      <n-tab-pane name="PublicService" display-directive="show" :tab="resource.PublicService">
        <sm-public-service @add-callback="addCallback" :service-options="options" />
      </n-tab-pane>
      <n-tab-pane name="CustomService" display-directive="show" :tab="resource.CustomService">
        <sm-custom-service @add-callback="addCallback" />
      </n-tab-pane>
      <n-tab-pane name="LocalData" display-directive="show" :tab="resource.LocalData">本地数据</n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import options from "@/js/public-service-config";
import { inject } from "vue";
let { resource, seletcedComponent } = inject("state");

// 添加公共服务时回调，返回添加的图层和点击对象
function addCallback(layers, data) {
  // 白膜添加线框
  if (data && data.style && data.style.fillStyle) {
    layers[0].style3D.lineColor = Cesium.Color.fromCssColorString(
      "rgb(67,67,67)"
    );
    layers[0].style3D.fillStyle = Cesium.FillStyle[data.style.fillStyle];
  }
  //优化性能，设置最大可见距离(目前只有s3m图层有效)
  layers.forEach(layer => {
    if (!layer.visibleDistanceMax || layer.visibleDistanceMax > 12000) {
      layer.visibleDistanceMax = 12000; //设置模型最可见距离
    }
  });
  closePanel();
}

//关闭界面
function closePanel() {
  seletcedComponent.value = null;
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