<template>
   <n-space>
      <n-button text @click="MeasureDistance" class="iconfont iconVue-measure-distance" title="测距"></n-button>
      <n-button text @click="MeasureHeight" class="iconfont iconVue-measure-height" title="测高"></n-button>
      <n-button text @click="MeasureArea" class="iconfont  iconVue-measure-area" title="测面"></n-button>
      <n-button text @click="MeasureHorizontalDistance" class="iconfont  iconVue-measure" title="水平测距"></n-button>
      <n-button text @click="clear" class="iconfont iconVue-measure-clear" title="清除"></n-button>
    </n-space>
    <!-- <n-space>
      <n-input-number :show-button="false"  size="small"  v-model:value="dTotalDis" />
    </n-space> -->
</template>

<script setup>
import { ref } from "vue";

let dCurrentDis = ref(0);
let dTotalDis = ref(0);

function MeasureDistance() {
  let ac = new SuperMap.Web.UI.Action3Ds.MeasureDistance(sceneControl); 
  sceneControl.set_sceneAction(ac);
  // sceneControl.removeEvent("measureDistance", disHandler);
  // sceneControl.removeEvent("measureDistanceFinished", disFinishedHandler);
  // sceneControl.addEvent("measureDistance", disHandler);
  // sceneControl.addEvent("measureDistanceFinished", disFinishedHandler);
}

function MeasureHeight() {
  let ac = new SuperMap.Web.UI.Action3Ds.MeasureHeight(sceneControl); 
  sceneControl.set_sceneAction(ac);
}

function MeasureArea() {
  let ac = new SuperMap.Web.UI.Action3Ds.MeasureArea(sceneControl); 
  sceneControl.set_sceneAction(ac);
}

function MeasureHorizontalDistance() {
  let ac = new SuperMap.Web.UI.Action3Ds.MeasureHorizontalDistance(sceneControl); 
  sceneControl.set_sceneAction(ac);
}


function clear() {
  scene.get_trackingLayer3D().removeAll();
}

// function disHandler(currentDis) {
//   dCurrentDis.value = currentDis;
//   console.log("距离量算中:" + currentDis);
// }

function disFinishedHandler(totalDis) {
  if(totalDis) dTotalDis.value = totalDis.toFixed(2);
  console.log("距离量算完成:" + totalDis);
}
</script>

<style lang="scss" scoped>
 button {
    padding: 6px;
    font-size: 24px;
  }
</style>



