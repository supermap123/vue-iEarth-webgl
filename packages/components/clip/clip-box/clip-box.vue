<template>
  <n-space vertical>
    <n-radio-group v-model:value="clipMode" name="radiogroup">
      <n-space>
        <n-radio value="clip_behind_all_plane">{{locale.ClipInside}}</n-radio>
        <n-radio value="clip_behind_any_plane">{{locale.ClipOutside}}</n-radio>
      </n-space>
    </n-radio-group>
    <n-space justify="end">
      <n-button @click="BoxClipByEitor">{{locale.Clip}}</n-button>
      <n-button @click="clear">{{locale.Clear}}</n-button>
    </n-space>
  </n-space>
</template>

<script setup>
import { ref, onBeforeUnmount, inject, watch } from "vue";
import {
  NSpace,
  NButton,
  useNotification,
  NRadioGroup,
  NRadio
} from "naive-ui";

let { locale } = inject("storeData");
let storeState = inject("storeState");
const notification = useNotification();

// 初始化数据
let clipMode = ref("clip_behind_all_plane");
let layers, handlerBox, boxEntity, editorBox;

//viewer 初始化完成的监听
watch(storeState.isViewer, val => {
  if (val) init();
});

function init() {
  if (!viewer) return;
  layers = viewer.scene.layers.layerQueue;
  handlerBox = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Box);
}

init();

// 分析
function BoxClipByEitor() {
  clear();
  if (editorBox) return handlerBox.activate();
  notification.create({
    content: () => locale.value.ClipBoxTip,
    duration: 3500
  });
  // 设置裁剪线颜色
  setAllLayersClipColor();

  handlerBox.drawEvt.addEventListener(e => {
    boxEntity = e.object;
    let newDim = boxEntity.box.dimensions.getValue();
    let position = boxEntity.position.getValue(0);
    let boxOption = {
      dimensions: newDim,
      position: position,
      clipMode: clipMode.value,
      heading: 0
    };

    //box编辑
    editorBox = new Cesium.BoxEditor(viewer, boxEntity);
    editorBox.editEvt.addEventListener(e => {
      boxEntity.box.dimensions = e.dimensions;
      boxEntity.position = e.position;
      boxEntity.orientation = e.orientation;
      setClipBox();
    });
    editorBox.activate();
    setAllLayersClipOptions(boxOption);
    handlerBox.clear();
    handlerBox.deactivate();
  });
  handlerBox.activate();
}
// 更新
function setClipBox() {
  if (typeof boxEntity == "undefined") return;
  let newDim = boxEntity.box.dimensions.getValue();
  let position = boxEntity.position.getValue(0);

  let heading = 0;
  if (typeof boxEntity.orientation != "undefined") {
    let rotationM3 = Cesium.Matrix3.fromQuaternion(
      boxEntity.orientation._value,
      new Cesium.Matrix3()
    );
    let localFrame = Cesium.Matrix4.fromRotationTranslation(
      rotationM3,
      Cesium.Cartesian3.ZERO,
      new Cesium.Matrix4()
    );
    let inverse = Cesium.Matrix4.inverse(
      Cesium.Transforms.eastNorthUpToFixedFrame(position),
      new Cesium.Matrix4()
    );
    let hprm = Cesium.Matrix4.multiply(
      inverse,
      localFrame,
      new Cesium.Matrix4()
    );
    let rotation = Cesium.Matrix4.getMatrix3(hprm, new Cesium.Matrix3());
    let hpr = Cesium.HeadingPitchRoll.fromQuaternion(
      Cesium.Quaternion.fromRotationMatrix(rotation)
    );
    heading = hpr.heading;
  }
  let boxOptions = {
    dimensions: newDim,
    position: position,
    clipMode: clipMode.value,
    heading: heading
  };
  setAllLayersClipOptions(boxOptions);
}
//设置图层裁剪
function setAllLayersClipOptions(boxOptions) {
  for (let i = 0, j = layers.length; i < j; i++) {
    layers[i].setCustomClipBox(boxOptions);
  }
}
//设置线颜色
function setAllLayersClipColor() {
  for (let i = 0, j = layers.length; i < j; i++) {
    layers[i].selectEnabled = false;
    layers[i].clipLineColor = new Cesium.Color(1, 1, 1, 0);
  }
}
// 清除
function clear() {
  if (handlerBox) handlerBox.deactivate();
  if (!boxEntity) return;
  for (let layer of layers) {
    layer.clearCustomClipBox();
  }
  boxEntity = undefined;
  editorBox.deactivate();
  // viewer.entities.removeAll();
  handlerBox.clear();
}

// 监听
watch(clipMode, val => {
  if (boxEntity) setClipBox();
});

onBeforeUnmount(() => {
  clear();
  if (editorBox) editorBox.destroy();
  editorBox = undefined;
  layers = undefined;
  handlerBox = undefined;
  boxEntity = undefined;
});
</script>

<style lang="scss">
@import "../../../assets/style/common.scss";
</style>

<style lang="scss" scoped>
</style>





