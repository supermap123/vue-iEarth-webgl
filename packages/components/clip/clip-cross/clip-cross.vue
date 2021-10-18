<template>
  <n-space vertical>
    <div class="sm-box">
      <n-ellipsis>{{locale.ClipWidth}}</n-ellipsis>
      <n-slider v-model:value="state.clipWidth" :step="1" :min="1" :max="100" :format-tooltip="value => `${value}米`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.ClipHeight}}</n-ellipsis>
      <n-slider v-model:value="state.clipHeight" :step="1" :min="1" :max="100" :format-tooltip="value => `${value}米`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.Xrotation}}</n-ellipsis>
      <n-slider v-model:value="state.heading" :step="1" :min="0" :max="360" :format-tooltip="value => `${value}°`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.Yrotation}}</n-ellipsis>
      <n-slider v-model:value="state.pitch" :step="1" :min="0" :max="360" :format-tooltip="value => `${value}°`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.Zrotation}}</n-ellipsis>
      <n-slider v-model:value="state.roll" :step="1" :min="0" :max="360" :format-tooltip="value => `${value}°`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.StretchingHeight}}</n-ellipsis>
      <n-slider v-model:value="state.extrude" :step="1" :min="1" :max="100" :format-tooltip="value => `${value}米`"/>
    </div>
    <n-space justify="end">
      <n-button @click="clipCross">{{locale.Analyze}}</n-button>
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
// 设置默认值数据
let state = reactive({
  clipWidth: 5,
  clipHeight: 5,
  heading: 0,
  pitch: 0,
  roll: 0,
  extrude: 1
});
let layers;
let screenSpaceEventHandler;
let startClip, //裁剪标志
  box,
  boxPosition,
  dim, //entity
  position; //裁剪区域

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
function clipCross() {
  if (box) clearCross();
  start();
  startClip = true;
  box.show = true;
}

function start() {
  for (let layer of layers) {
    layer.selectEnabled = false;
  }
  // 添加盒子
  boxPosition = Cesium.Cartesian3.fromDegrees(0, 0, 0);
  dim = new Cesium.Cartesian3(state.clipWidth, state.clipHeight, 0.1);
  box = viewer.entities.add({
    // 标识盒
    id: "cross-clip-identify-box",
    position: boxPosition,
    show: false,
    box: {
      dimensions: dim,
      fill: false,
      outline: true,
      outlineColor: Cesium.Color.AQUA,
      outlineWidth: 5.0
    }
  });

  //鼠标左键事件监听
  viewer.eventManager.addEventListener("CLICK", left_click, true);
  viewer.eventManager.addEventListener("MOUSE_MOVE", mouse_move, true);
}

function mouse_move(e) {
  let hpr;
  if (!startClip || !boxPosition) return;
  boxPosition = viewer.scene.pickPosition(e.message.endPosition);
  box.position = boxPosition;
  if (!hpr) {
    hpr = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(state.heading),
      Cesium.Math.toRadians(state.pitch),
      Cesium.Math.toRadians(state.roll)
    );
  }
  let orientation = Cesium.Transforms.headingPitchRollQuaternion(
    boxPosition,
    hpr
  );
  box.orientation = orientation;
}

function left_click(e) {
  if (startClip) {
    position = viewer.scene.pickPosition(e.message.position);
    if (!position) {
      return;
    }
    updateClip();
    startClip = false;
    box.show = false;
  }
  viewer.eventManager.removeEventListener("MOUSE_MOVE", mouse_move);
  viewer.eventManager.removeEventListener("RIGHT_CLICK", left_click);
}
// 更新
function updateClip() {
  for (let layer of layers) {
    layer.setCustomClipCross({
      position: position,
      dimensions: dim,
      heading: state.heading,
      pitch: state.pitch,
      roll: state.roll,
      extrudeDistance: Number(state.extrude)
    });
  }
}

// 清除
function clear() {
  if (!layers) return;
  box && viewer.entities.removeById("cross-clip-identify-box");
  for (let layer of layers) {
    layer.clearCustomClipBox();
  }
  startClip = false;
  box = undefined;
  layers = undefined;
}

// 监听
watch(
  () => state.clipWidth,
  val => {
    let temp_width = Number(val);
    if (temp_width <= 0 || !box) {
      return;
    }
    box.box.dimensions = new Cesium.Cartesian3(
      state.clipWidth,
      state.clipHeight,
      0.1
    );
    dim = new Cesium.Cartesian3(temp_width, state.clipHeight, state.extrude);
    updateClip();
  }
);
watch(
  () => state.clipHeight,
  val => {
    let temp_height = Number(val);
    if (temp_height <= 0 || !box) {
      return;
    }
    box.box.dimensions = new Cesium.Cartesian3(
      state.clipWidth,
      state.clipHeight,
      0.1
    );
    dim = new Cesium.Cartesian3(state.clipWidth, temp_height, state.extrude);
    updateClip();
  }
);
watch(
  () => state.pitch,
  val => {
    if (val === "" || !box) {
      return;
    }
    let pitch = Number(val);
    let hpr = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(state.heading),
      Cesium.Math.toRadians(pitch),
      Cesium.Math.toRadians(state.roll)
    );
    let orientation = Cesium.Transforms.headingPitchRollQuaternion(
      boxPosition,
      hpr
    );
    box.orientation = orientation;
    updateClip();
  }
);
watch(
  () => state.roll,
  val => {
    if (val === "" || !box) {
      return;
    }
    let roll = Number(val);
    let hpr = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(state.heading),
      Cesium.Math.toRadians(state.pitch),
      Cesium.Math.toRadians(roll)
    );
    let orientation = Cesium.Transforms.headingPitchRollQuaternion(
      boxPosition,
      hpr
    );
    box.orientation = orientation;
    updateClip();
  }
);
watch(
  () => state.heading,
  val => {
    if (val === "" || !box) {
      return;
    }
    let heading = Number(val);
    let hpr = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(heading),
      Cesium.Math.toRadians(state.pitch),
      Cesium.Math.toRadians(state.roll)
    );
    let orientation = Cesium.Transforms.headingPitchRollQuaternion(
      boxPosition,
      hpr
    );
    box.orientation = orientation;
    updateClip();
  }
);
watch(
  () => state.extrude,
  val => {
    let temp_extrudeDistance = Number(val);
    if (temp_extrudeDistance <= 0 || !box) {
      return;
    }
    updateClip();
  }
);

// 销毁
onBeforeUnmount(() => {
  clear();
  layers = undefined;
  box = undefined;
  dim = undefined;
});


</script>

<style lang="scss">
@import "../../../assets/style/common.scss";
</style>