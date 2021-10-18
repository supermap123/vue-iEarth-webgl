<template>
  <n-space vertical>
    <div class="sm-box">
      <n-ellipsis>{{locale.PlaneDirection}}</n-ellipsis>
      <n-select v-model:value="state.planeDirection" size="small" :options="state.options1" />
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.PlaneDirection}}</n-ellipsis>
      <n-select v-model:value="state.clipMode" size="small" :options="state.options2" />
    </div>
    <n-space justify="end">
      <n-button @click="clipPlaneStart">{{locale.Clip}}</n-button>
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
let state = reactive({
  options1: [
    {
      label: () => locale.value.Vertically,
      value: "vertical"
    },
    {
      label: () => locale.value.Horizontal,
      value: "horizontal"
    }
  ],
  options2: [
    {
      label: () => locale.value.ClipInside,
      value: 0
    },
    {
      label: () => locale.value.ClipOutside,
      value: 1
    }
  ],
  clipMode: 0, //裁剪模式
  planeDirection: "vertical" //裁剪方向
});
let layers;
let planePositionObj;
let editEntity, s3mInstanceColc, planeSurface, handlerPolyline;
let modelUrl = "packages/assets/model/box.s3m";
let modelEditor;
//viewer 初始化完成的监听
watch(storeState.isViewer, val => {
  if (val) init();
});

function init() {
  if (!viewer) return;
  layers = viewer.scene.layers.layerQueue;
  s3mInstanceColc = new Cesium.S3MInstanceCollection(viewer.scene._context);
  viewer.scene.primitives.add(s3mInstanceColc);
}

init();

// 分析
function clipPlaneStart() {
  for (let layer of layers) {
    layer.selectEnabled = false;
    // 设置被裁剪对象的颜色
    layer.clipLineColor = new Cesium.Color(1, 1, 1, 0);
  }
  if (planeSurface) clear();
  notification.create({
    content: () => locale.value.ClipPlaneTip,
    duration: 3500
  });
  if (!handlerPolyline) {
    handlerPolyline = initHandler("Polyline");
  }

  handlerPolyline.handlerDrawing().then(
    res => {
      setPlanePositions(res.object.positions);
      handlerPolyline.polylineTransparent.show = false;
    },
    err => {
      console.log(err);
    }
  );
  handlerPolyline.activate();
}

// 垂直地面裁剪面设置
function verticalGroundPlane(linePositions, carPos, width) {
  let point1 = linePositions.slice(0, 3);
  let point2 = linePositions.slice(3, 6);
  let point3 = point2.slice(0, 2).concat(point2[2] + width);
  let point4 = point1.slice(0, 2).concat(point1[2] + width);
  let catPoints = [].concat(carPos);
  catPoints.push(
    Cesium.Cartesian3.fromDegrees(point3[0], point3[1], point3[2])
  );
  catPoints.push(
    Cesium.Cartesian3.fromDegrees(point4[0], point4[1], point4[2])
  );
  return catPoints;
}

// 平行地面的裁剪面
function parallelGroundPlane(carPos, width) {
  let Vab = new Cesium.Cartesian3(0, 0, 0);
  let Vbc = new Cesium.Cartesian3(0, 0, 0);
  let py = new Cesium.Cartesian3(0, 0, 0);
  let point3 = new Cesium.Cartesian3(0, 0, 0);
  let point4 = new Cesium.Cartesian3(0, 0, 0);
  Cesium.Cartesian3.subtract(carPos[0], carPos[1], Vab);
  Cesium.Cartesian3.cross(Vab, carPos[0], Vbc);
  Cesium.Cartesian3.normalize(Vbc, Vbc);
  Cesium.Cartesian3.multiplyComponents(
    Vbc,
    new Cesium.Cartesian3(width, width, width),
    py
  );
  Cesium.Cartesian3.add(carPos[0], py, point4);
  Cesium.Cartesian3.add(carPos[1], py, point3);
  let catPoints = [carPos[0], carPos[1], point3, point4];
  return catPoints;
}

// 设置裁剪面位置
function setPlanePositions(carPos) {
  let linePositions = tool.CartesiantoDegrees(carPos);
  let cartPositions;
  let width = Cesium.Cartesian3.distance(carPos[0], carPos[1]);
  width = Cesium.defaultValue(width, 100);
  if (state.planeDirection === "vertical")
    cartPositions = verticalGroundPlane(linePositions, carPos, width);
  else cartPositions = parallelGroundPlane(carPos, width);
  let centerP = Cesium.BoundingSphere.fromPoints(cartPositions).center;
  planePositionObj = {
    cartPositions: cartPositions,
    centerPositions: centerP
  };
  addsurface();
  clipPlaneUpdate();
}

// 添加裁剪面entity
function addsurface() {
  planeSurface = viewer.entities.add({
    id: "clip-plane",
    polygon: {
      hierarchy: new Cesium.CallbackProperty(() => {
        return {
          positions: planePositionObj.cartPositions,
          holes: []
        };
      }, false),
      material: Cesium.Color.GOLD.withAlpha(0.2),
      outline: true,
      outlineColor: Cesium.Color.GOLD,
      perPositionHeight: true
    }
  });
  addModel();
}

// 添加编辑器模型
function addModel() {
  let getAngleAndRadian = tool.getAngleAndRadian(
    planePositionObj.cartPositions[0],
    planePositionObj.cartPositions[1]
  );
  let heading = getAngleAndRadian.radian;
  let id = "clip-model";
  s3mInstanceColc.add(modelUrl, {
    id: id,
    position: planePositionObj.centerPositions,
    hpr: new Cesium.HeadingPitchRoll(heading, 0, 0),
    // color:Cesium.Color.RED,
    scale: new Cesium.Cartesian3(0.1, 0.1, 0.1)
  });
  editEntity = s3mInstanceColc.getInstance(modelUrl, id);
  if (!modelEditor) addModelEditor(editEntity);
  else {
    modelEditor.setEditObject(editEntity);
    modelEditor.activate();
  }
}

// 添加模型编辑器
function addModelEditor(model) {
  modelEditor = new Cesium.ModelEditor({
    model: model,
    scene: viewer.scene,
    axesShow: {
      translation: true,
      rotation: false,
      scale: false
    }
  });
  modelEditor.activate();
  modelEditor.changedEvt.addEventListener(param => {
    let Cartesian3 = new Cesium.Cartesian3();
    Cesium.Matrix4.getTranslation(param.modelMatrix, Cartesian3);
    if (Cartesian3) {
      let subx = Cartesian3.x - planePositionObj.centerPositions.x;
      let suby = Cartesian3.y - planePositionObj.centerPositions.y;
      let subz = Cartesian3.z - planePositionObj.centerPositions.z;
      for (let i = 0; i < 4; i++) {
        planePositionObj.cartPositions[i].x += subx;
        planePositionObj.cartPositions[i].y += suby;
        planePositionObj.cartPositions[i].z += subz;
      }
      planePositionObj.centerPositions = Cartesian3;
      clipPlaneUpdate();
    }
  });
}

// 更新
function clipPlaneUpdate() {
  if (!planePositionObj.cartPositions) return;
  for (let layer of layers) {
    layer.setCustomClipPlane(
      planePositionObj.cartPositions[0],
      planePositionObj.cartPositions[1],
      planePositionObj.cartPositions[2]
    );
  }
}

// 清除
function clear() {
  if (handlerPolyline) handlerPolyline.clearHandler();
  if (!layers) return;
  for (let layer of layers) {
    layer.clearCustomClipBox();
  }
  if (planeSurface) {
    viewer.entities.remove(planeSurface);
    modelEditor.deactivate();
    s3mInstanceColc.removeCollection(modelUrl);
    planeSurface = null;
    planePositionObj = null;
  }
}

// 监听
watch(
  () => state.clipMode,
  val => {
    if (planePositionObj) {
      let pos = [...planePositionObj.cartPositions];
      let newPos = [pos[1], pos[0], pos[3], pos[2]];
      planePositionObj.cartPositions = newPos;
      clipPlaneUpdate();
    }
  }
);

onBeforeUnmount(() => {
  clear();
  if (handlerPolyline) handlerPolyline.destroy();
  layers = undefined;
  if (modelEditor) modelEditor.destroy();
});
</script>

<style lang="scss">
@import "../../../assets/style/common.scss";
</style>

<style lang="scss" scoped>
</style>





