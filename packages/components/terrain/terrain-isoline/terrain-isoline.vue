<template>
  <n-space vertical>
    <div class="sm-box">
      <n-ellipsis>{{locale.MaxVisibleHeight}}</n-ellipsis>
      <n-input-number v-model:value="state.fillMaxHeight" size="small" style="width:100%"></n-input-number>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.MinVisibleHeight}}</n-ellipsis>
      <n-input-number v-model:value="state.fillMinHeight" size="small" style="width:100%"></n-input-number>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.Equidistance}}</n-ellipsis>
      <n-input-number v-model:value="state.equivalentIsoline" size="small" style="width:100%"></n-input-number>
    </div>
    <div class="sm-box">
      <n-ellipsis style="line-height: 28px;">{{locale.LineColor}}</n-ellipsis>
      <n-color-picker v-model:value="state.lineColor" size="small" :actions="['confirm']" />
    </div>
    <div class="sm-box">
      <n-ellipsis style="line-height: 28px;">{{locale.DisplayMode}}</n-ellipsis>
      <n-select size="small" v-model:value="state.fillOptionsSelected" :options="state.options" />
    </div>
    <n-checkbox v-model:checked="state.isEdit">{{locale.EditAnalysisArea}}</n-checkbox>
    <n-space justify="end">
      <n-button @click="isoLineAnalysis">{{locale.Analyze}}</n-button>
      <n-button @click="clear">{{locale.Clear}}</n-button>
    </n-space>
  </n-space>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, inject, watch } from "vue";
import axios from "axios";
import {
  NSpace,
  NButton,
  NInputNumber,
  NEllipsis,
  NColorPicker,
  NSelect,
  NCheckbox,
  useMessage,
  useNotification
} from "naive-ui";
import tool from "packages/js/api/tool";
import initHandler from "packages/js/api/drawHandler";

let { locale } = inject("storeData");
const message = useMessage();
const notification = useNotification();

// 设置默认值数据
let state = reactive({
  fillMaxHeight: 9000, //最大可见高程
  fillMinHeight: 0, //最小可见高程
  equivalentIsoline: 100, //等值距
  fillOptionsSelected: "Line", //当前选择模式
  lineColor: "rgba(255,128,64,1)", //颜色
  isEdit: false, //是否编辑
  options: [
    {
      label: () => locale.value.IsolineFill,
      value: "Line"
    },
    {
      label: () => locale.value.IsosurfaceFill,
      value: "Region"
    },
    {
      label: () => locale.value.IsolineSurfaceFill,
      value: "Line_Region"
    },
    {
      label: () => locale.value.NoColorTable,
      value: "None"
    }
  ]
});

// 初始化数据
let handlerPolygon,editHandler, isolinePosition;
let hyp = new Cesium.HypsometricSetting();
let colorTable = new Cesium.ColorTable(); //建立颜色表
colorTableInit(colorTable);
hyp.DisplayMode = Cesium.HypsometricSettingEnum.DisplayMode.LINE; //显示模式
hyp._lineColor = Cesium.Color.fromCssColorString(state.lineColor);
hyp.LineInterval = parseFloat(state.equivalentIsoline);
hyp.MaxVisibleValue = parseFloat(state.fillMaxHeight);
hyp.MinVisibleValue = parseFloat(state.fillMinHeight);
hyp.ColorTableMinKey = 2736.88110351563;
hyp.ColorTableMaxKey = 5597.06640625;
hyp.ColorTable = colorTable;
// hyp.Opacity = 0.4;

function isoLineAnalysis() {
  if (!handlerPolygon) {
    handlerPolygon = initHandler("Polygon");
  }
  handlerPolygon.handlerDrawing().then(
    res => {
      let positions = tool.CartesiantoDegrees(res.object.positions);
      isolineUpdate(positions);
      isolinePosition = positions;
      console.log(handlerPolygon.polygon)
      if (state.isEdit) setEditHandler(handlerPolygon.polygon,isolineUpdate);
    },
    err => {
      console.log(err);
    }
  );
  handlerPolygon.activate();
}
// 更新
function isolineUpdate(p) {
  if (!p || p.length == 0) return;
  hyp.CoverageArea = p;
  viewer.scene.globe.HypsometricSetting = {
    hypsometricSetting: hyp,
    analysisMode: Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_REGION
  };
}

function setEditHandler (entity,callback){
  handlerPolygon.polygon.show = true;
    if(!editHandler) {
        editHandler = new Cesium.EditHandler(viewer, entity);
        editHandler.activate();
        // editHandler.changedEvt.addEventListener(() => {
        //     callback(editHandler._positions);
        // })
    }
    else{
        // editHandler.deactivate();
        editHandler.setEditObject(entity);
    }
}


// 清除
function clear() {
  console.log(viewer.selectedEntity)
  // if (handlerPolygon) handlerPolygon.clearHandler();
  // viewer.scene.globe.HypsometricSetting = undefined;
  // hyp && (hyp.MaxVisibleValue = -1000);
  // hyp && (hyp.MinVisibleValue = -1000);
  // isolinePosition = undefined;
  //   clearEditHandler("Polygon");
}
//监听
watch(
  () => state.fillMaxHeight,
  val => {
    hyp.MaxVisibleValue = parseFloat(val);
    if (isolinePosition) isolineUpdate(isolinePosition);
  }
);
watch(
  () => state.fillMinHeight,
  val => {
    hyp.MinVisibleValue = parseFloat(val);
    if (isolinePosition) isolineUpdate(isolinePosition);
  }
);

watch(
  () => state.equivalentIsoline,
  val => {
    hyp.LineInterval = parseFloat(val);
    if (isolinePosition) isolineUpdate(isolinePosition);
  }
);
watch(
  () => state.lineColor,
  val => {
    let color = Cesium.Color.fromCssColorString(val);
    if (color) hyp._lineColor = color;
    if (isolinePosition) isolineUpdate(isolinePosition);
  }
);
watch(
  () => state.fillOptionsSelected,
  val => {
    switch (val) {
      case "None":
        {
          hyp.DisplayMode = undefined;
        }
        break;
      case "Line":
        {
          hyp.DisplayMode = Cesium.HypsometricSettingEnum.DisplayMode.LINE;
          hyp.Opacity = 1;
        }
        break;
      case "Region":
        {
          hyp.DisplayMode = Cesium.HypsometricSettingEnum.DisplayMode.FACE;
          hyp.Opacity = 0.5;
        }
        break;
      case "Line_Region":
        {
          hyp.DisplayMode =
            Cesium.HypsometricSettingEnum.DisplayMode.FACE_AND_LINE;
          hyp.Opacity = 0.5;
        }
        break;
      default:
        break;
    }
    if (isolinePosition) isolineUpdate(isolinePosition);
  }
);
watch(
  () => state.isEdit,
  val => {
    if (val) {
      if(handlerPolygon && handlerPolygon.polygon)
      setEditHandler(handlerPolygon.polygon,isolineUpdate);
    } else if(editHandler) editHandler.clear();
  }
);
// 销毁
onBeforeUnmount(() => {
  hyp.destroy();
  colorTable.destroy();
  hyp = undefined;
  colorTable = undefined;
});

function colorTableInit(colorTable) {
  colorTable.insert(5597.06640625, new Cesium.Color(0, 0, 255 / 255));
  colorTable.insert(
    5406.3873860677086,
    new Cesium.Color(0, 51 / 255, 255 / 255)
  );
  colorTable.insert(
    5215.7083658854172,
    new Cesium.Color(0, 102 / 255, 255 / 255)
  );
  colorTable.insert(
    5025.0293457031257,
    new Cesium.Color(0, 153 / 255, 255 / 255)
  );
  colorTable.insert(
    4834.3503255208343,
    new Cesium.Color(0, 204 / 255, 255 / 255)
  );
  colorTable.insert(
    4643.6713053385429,
    new Cesium.Color(0, 255 / 255, 255 / 255)
  );
  colorTable.insert(
    4452.9922851562524,
    new Cesium.Color(51 / 255, 255 / 255, 204 / 255)
  );
  colorTable.insert(
    4262.3132649739609,
    new Cesium.Color(102 / 255, 255 / 255, 153 / 255)
  );
  colorTable.insert(
    4071.6342447916695,
    new Cesium.Color(153 / 255, 255 / 255, 102 / 255)
  );
  colorTable.insert(
    3880.9552246093781,
    new Cesium.Color(204 / 255, 255 / 255, 51 / 255)
  );
  colorTable.insert(
    3690.2762044270867,
    new Cesium.Color(255 / 255, 255 / 255, 0)
  );
  colorTable.insert(
    3499.5971842447952,
    new Cesium.Color(255 / 255, 204 / 255, 0)
  );
  colorTable.insert(
    3308.9181640625038,
    new Cesium.Color(255 / 255, 153 / 255, 0)
  );
  colorTable.insert(
    3118.2391438802129,
    new Cesium.Color(255 / 255, 102 / 255, 0)
  );
  colorTable.insert(
    2927.5601236979214,
    new Cesium.Color(255 / 255, 51 / 255, 0)
  );
  colorTable.insert(2736.88110351563, new Cesium.Color(255 / 255, 0, 0));
}

// 获取rgba里的数值(rgba:传入的rgba格式颜色值，index:想要获取第几位，有0、1、2、3)
function rgbaNum(rgba, index) {
  let val = rgba.match(/(\d(\.\d+)?)+/g);
  return val[index];
}
</script>