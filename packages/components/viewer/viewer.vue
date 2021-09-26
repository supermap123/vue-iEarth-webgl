<template>
  <div id="cesiumContainer">
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, inject } from "vue";

let storeActions = inject("storeActions");

const props = defineProps({
  addScene: [String, Object], //{url, options} or string 
  addScps: Array, //[{url,name}···]
  addImage: String, //{url}
  addTerrain: String, //{url, true/false}
  openingAnimation: Boolean, //开场动画
  viewerOptions: Object, //初始化viewer配置
  initCallback: Function, //初始化viewer后回调函数
  addLayerCallback: Function //从组件上加载图层的回调函数
});

onMounted(() => initViewer());

//初始化地球
let viewer;
function initViewer() {
  let isPCBroswer = Cesium.FeatureDetection.isPCBroswer();
  let options = {};
  if (props.viewerOptions) Object.assign(options, props.viewerOptions);
  if (isPCBroswer) {
    let options1 = {
      selectionIndicator: false,
      timeline: true,
      baseLayerPicker: false,
      infoBox: false,
      navigation: false
    };
    Object.assign(options, options1);
    viewer = new Cesium.Viewer("cesiumContainer", options);
    // 太阳光默认打开
    viewer.scene.globe.enableLighting = true;
    //隐藏时间线控件
    document.getElementsByClassName(
      "cesium-viewer-timelineContainer"
    )[0].style.visibility = "hidden";
  } else {
    let options2 = {
      selectionIndicator: false,
      infoBox: false,
      skyBox: false,
      navigation: false
    };
    Object.assign(options, options2);
    viewer = new Cesium.Viewer("cesiumContainer", options);
    viewer.scene.globe.enableLighting = false;
    document.documentElement.style.height = window.innerHeight + "px";
    document.addEventListener("touchmove", e => e.preventDefault(), false);
  }

  // 其他设置
  window.viewer = viewer; //绑定到window
  storeActions.setIsViewer(); //初始化viewer标志
  viewer.scene.debugShowFramesPerSecond = true; //帧率
  viewer.scene.globe.baseColor = Cesium.Color.BLACK; // 没有影像图层时地球的底色
  viewer.scene.moon.show = false;
  // viewer.eventManager = new EventManager(viewer); //添加事件管理派发
  let widget = viewer.cesiumWidget;
  if (viewer.geocoder) {
    // 请开发者自行到supermap online官网（http://www.supermapol.com/）申请key
    viewer.geocoder.viewModel.geoKey = "fvV2osxwuZWlY0wJb8FEb2i5";
  }
  if (props.openingAnimation) openingAnimation(); //开场动画
  if (props.initCallback) props.initCallback(viewer); //自定义回调

  //默认加载图层
  try {
    if (props.addScene) {
      let url;
      if (typeof props.addScene === "string") url = props.addScene;
      else {
        url = props.addScene.url;
        options = props.addScene.options;
      }
      storeActions
        .addScene(url, options)
        .then(layer => addLayerCallback(layer));
    }
    if (props.addScps) {
      storeActions
        .addS3mLayers(props.addScps)
        .then(layer => addLayerCallback(layer));
    }
    if (props.addImage) {
      storeActions
        .addImageLayer(props.addImage)
        .then(layer => addLayerCallback(layer));
    }
    if (props.addTerrain) {
      storeActions
        .addTerrainLayer(props.addTerrain)
        .then(layer => addLayerCallback(layer));
    }
  } catch (e) {
    console.log(e);
  }
}

function openingAnimation() {
  viewer.camera.flyTo({
    destination: new Cesium.Cartesian3(
      6788287.844465209,
      -41980756.10214644,
      29619220.04004376
    ),
    duration: 0,
    complete: function() {
      viewer.camera.flyTo({
        destination: new Cesium.Cartesian3.fromDegrees(
          110.60396458865515,
          34.54408834959379,
          30644793.325518917
        ),
        duration: 5
      });
    }
  });
}

// 销毁
onBeforeUnmount(() => {
  viewer.destroy();
});
</script>

<style lang="scss" scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>



