<template>
  <n-space vertical>
    <n-radio-group v-model:value="clipMode" name="radiogroup">
      <n-space>
        <n-radio :value="0">{{locale.ClipInside}}</n-radio>
        <n-radio :value="1">{{locale.ClipOutside}}</n-radio>
      </n-space>
    </n-radio-group>
    <n-space justify="end">
      <n-button @click="clipPolygon">{{locale.Clip}}</n-button>
      <n-button @click="clear">{{locale.Clear}}</n-button>
    </n-space>
  </n-space>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, inject, watch } from "vue";
import {
  NSpace,
  NButton,
  useNotification,
  NRadioGroup,
  NRadio
} from "naive-ui";
import initHandler from "packages/js/api/drawHandler";
import tool from "packages/js/api/tool";

let { locale } = inject("storeData");
let storeState = inject("storeState");
const notification = useNotification();

// 初始化数据
let clipMode = ref(0);  //裁剪模式值 外部: Cesium.ModifyRegionMode.CLIP_OUTSIDE (内部：CLIP_INSIDE);

let layers, handlerPolygon, polygonPosition;

//viewer 初始化完成的监听
watch(storeState.isViewer, val => {
  if (val) init();
});

function init() {
  if (!viewer) return;
  layers = viewer.scene.layers.layerQueue;
}

init();

// 分析
function clipPolygon() {
  for (let layer of layers) {
    layer.selectEnabled = false;
    // 设置被裁剪对象的颜色
    layer.clipLineColor = new Cesium.Color(1, 1, 1, 0);
  }
  if (!handlerPolygon) {
    handlerPolygon = initHandler("Polygon");
  }

  handlerPolygon.handlerDrawing().then(
    res => {
      let positions = tool.CartesiantoDegrees(res.object.positions);
      clipPolygonUpdate(positions);
    },
    err => {
      console.log(err);
    }
  );
  handlerPolygon.activate();
}
// 更新
function clipPolygonUpdate(p) {
  polygonPosition = p;
  for (let layer of layers) {
    layer.setModifyRegions([p], clipMode.value);
  }
}

// 清除
function clear() {
  if (handlerPolygon) handlerPolygon.clearHandler();
  if (!layers) return;
  for (let layer of layers) {
    layer.clearModifyRegions();
  }
  polygonPosition = null;
}

// 监听
watch(clipMode, val => {
  if (polygonPosition) clipPolygonUpdate(polygonPosition);
});

onBeforeUnmount(() => {
  clear();
  if (handlerPolygon) handlerPolygon.destroy();
  layers = undefined;
});
</script>

<style lang="scss">
@import "../../../assets/style/common.scss";
</style>

<style lang="scss" scoped>
</style>





