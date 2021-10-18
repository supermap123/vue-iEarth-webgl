<template>
  <n-space vertical>
    <div class="sm-box">
      <n-ellipsis>{{locale.DirectionAngle}}</n-ellipsis>
      <n-slider v-model:value="state.direction" :step="1" :min="0" :max="360" :format-tooltip="value => `${value}°`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.PitchAngle}}</n-ellipsis>
      <n-slider v-model:value="state.pitch" :step="1" :min="-90" :max="90" :format-tooltip="value => `${value}°`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.VerticalFov}}</n-ellipsis>
      <n-slider v-model:value="state.verticalFov" :step="1" :min="1" :max="179" :format-tooltip="value => `${value}°`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis>{{locale.HorizontalFov}}</n-ellipsis>
      <n-slider v-model:value="state.horizontalFov" :step="1" :min="1" :max="179" :format-tooltip="value => `${value}°`"/>
    </div>
    <div class="sm-box">
      <n-ellipsis style="line-height: 28px;">{{locale.VisibleAreaColor}}</n-ellipsis>
      <n-color-picker v-model:value="state.visibleAreaColor" size="small" :actions="['confirm']" />
    </div>
    <div class="sm-box">
      <n-ellipsis style="line-height: 28px;">{{locale.HiddenAreaColor}}</n-ellipsis>
      <n-color-picker v-model:value="state.hiddenAreaColor" size="small" :actions="['confirm']" />
    </div>
    <n-checkbox v-model:checked="state.visibleBody">{{locale.DisplayVisualsBody}}</n-checkbox>
    <n-checkbox v-model:checked="state.invisibleBody">{{locale.DisplayInvisibleBody}}</n-checkbox>
    <n-checkbox v-model:checked="state.viewshedAnimation">{{locale.ViewshedAnimation}}</n-checkbox>
    <n-space justify="end">
      <n-button @click="analysis">{{locale.Analyze}}</n-button>
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
  NEllipsis,
  NSlider,
  NCheckbox,
  useMessage,
  useNotification
} from "naive-ui";
import tool from "packages/js/api/tool";
import initHandler from "packages/js/api/drawHandler";

let { locale } = inject("storeData");
let storeState = inject("storeState");
const message = useMessage();
const notification = useNotification();

// 设置默认值数据
let state = reactive({
  viewshedSpatialUrl:
    "http://www.supermapol.com/realspace/services/spatialAnalysis-data_all/restjsr/spatialanalyst/geometry/3d/viewshedbody.json",
  observerInformation: null, //观察者信息
  direction: 0.0, //方向
  pitch: 0.0, //俯仰角度
  addheight: 1.8, //附加高度
  distance: 200, //距离
  verticalFov: 60, //  垂直视角
  horizontalFov: 90, //水平视角
  hintLineColor: "rgb(212,202,45)", //提示线颜色
  visibleAreaColor: "rgba(9,199,112,0.5)", //可视区域颜色
  hiddenAreaColor: "rgba(238,114,22,0.5)", //不可视区域颜色
  visibleBody: false, //显示可视域体
  invisibleBody: false, //显示不可视域体
  viewshedAnimation: false, //动画演示
  DynamicLine: [], //路线点
  DynamicSpeed: 10 //动态分析行进速度
});

let props = defineProps({
  viewshedSpatialUrl: String,
  addheight: Number,
  distance: Number,
  visibleAreaColor: String,
  hiddenAreaColor: String,
  moldeUrl: String
});

// 传入props改变默认值
for (let key in props) {
  if (state.hasOwnProperty(key)) {
    if (props[key] != undefined) state[key] = props[key];
  }
}

// 初始化数据
let viewshed3D, s3mInstanceColc, scene, startPosition, hint, handlerPolyline;
let Carurls = props.moldeUrl
    ? [props.moldeUrl]
    : ["packages/assets/model/car1.s3m"],
  timers,
  dynamicLayer3D;

//viewer 初始化完成的监听
watch(storeState.isViewer, val => {
  if (val) init();
});

function init() {
  if (!viewer) return;
  scene = viewer.scene;
  viewshed3D = new Cesium.ViewShed3D(scene);
  viewshed3D.hintLineColor = Cesium.Color.fromCssColorString(
    state.hintLineColor
  );
  viewshed3D.visibleAreaColor = Cesium.Color.fromCssColorString(
    state.visibleAreaColor
  );
  viewshed3D.hiddenAreaColor = Cesium.Color.fromCssColorString(
    state.hiddenAreaColor
  );
  s3mInstanceColc = new Cesium.S3MInstanceCollection(scene._context);
  viewer.scene.primitives.add(s3mInstanceColc);
  dynamicLayer3D = new Cesium.DynamicLayer3D(scene.context, Carurls);
  dynamicLayer3D.updateInterval = 100;
  dynamicLayer3D.setCullEnabled(Carurls[0], Cesium.CullFace.BACK);
  dynamicLayer3D.maxVisibleAltitude = 2000;
  dynamicLayer3D.minVisibleAltitude = 0;
  scene.primitives.add(dynamicLayer3D);
}

init();

/*
 ***分析模块***
 */

//分析

function analysis() {
  clearViewshed();
  if (state.viewshedAnimation) {
    if (timers) {
      clear();
      state.viewshedAnimation = true;
      document.body.classList.add("drawCur");
    }
    drawPolyline();
    return;
  }
  viewer.enableCursorStyle = false;
  viewer._element.style.cursor = "";
  document.body.classList.add("measureCur");
  //鼠标左键事件监听
  viewer.eventManager.addEventListener("CLICK", LEFT_CLICK, true);
}

//   点击左键确认观察者点
function LEFT_CLICK(e) {
  //获取点击位置笛卡尔坐标
  let position = scene.pickPosition(e.message.position);
  startPosition = position; //记录分析观察者笛卡尔坐标
  let p = tool.CartesiantoDegrees(position); // 将获取的点的位置转化成经纬度
  p[2] += Number(state.addheight); //添加附加高度
  viewshed3D.viewPosition = p;
  viewshed3D.build();
  // 观察者信息记录
  state.observerInformation = p;
  // 添加观察者点
  let p2 = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]);
  addPoint(p2);
  viewshed3D.visibleAreaColor = Cesium.Color.fromCssColorString(
    state.visibleAreaColor
  );
  viewshed3D.hiddenAreaColor = Cesium.Color.fromCssColorString(
    state.hiddenAreaColor
  );
  document.body.classList.remove("measureCur");
  viewer.eventManager.removeEventListener("CLICK", LEFT_CLICK);
  viewer.eventManager.addEventListener("MOUSE_MOVE", MOUSE_MOVE, true);
  viewer.eventManager.addEventListener("RIGHT_CLICK", RIGHT_CLICK, true);
}

function addPoint(p) {
  viewer.entities.removeById("viewshedPoint");
  viewer.entities.add(
    new Cesium.Entity({
      id: "viewshedPoint",
      point: new Cesium.PointGraphics({
        color: colorUpdate(state.hiddenAreaColor),
        pixelSize: 8
      }),
      position: p
    })
  );
}

// 鼠标移动实时分析
function MOUSE_MOVE(e) {
  //获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
  let position = e.message.endPosition;
  let endPosition = scene.pickPosition(position);
  //计算该点与视口位置点坐标的距离
  let distance = Cesium.Cartesian3.distance(startPosition, endPosition);
  if (distance > 0) {
    let p2 = tool.CartesiantoDegrees(endPosition); // 将获取的点的位置转化成经纬度
    // 通过该点设置可视域分析对象的距离及方向
    viewshed3D.setDistDirByPoint(p2);
  }
}

// //鼠标右键确认分析距离和方向，不再执行鼠标移动事件中对可视域的操作
function RIGHT_CLICK(e) {
  state.direction = viewshed3D.direction;
  state.pitch = viewshed3D.pitch;
  state.distance = viewshed3D.distance;
  state.horizontalFov = viewshed3D.horizontalFov;
  state.verticalFov = viewshed3D.verticalFov;
  if (state.visibleBody) {
    getVisibleResult();
  }
  if (state.invisibleBody) {
    getInVisibleResult();
  }
  viewer.eventManager.removeEventListener("MOUSE_MOVE", MOUSE_MOVE);
  viewer.eventManager.removeEventListener("RIGHT_CLICK", RIGHT_CLICK);
}

// 可视域体走数据服务
function getVisibleResult() {
  let color = Cesium.Color.fromCssColorString(state.visibleAreaColor);
  requestModel("VISIBLEBODY", color);
}

function getInVisibleResult() {
  let color = Cesium.Color.fromCssColorString(state.hiddenAreaColor);
  requestModel("HIDDENBODY", color);
}

function requestModel(viewShedType, color) {
  let obj = viewshed3D.getViewshedParameter();
  let geometryViewShedBodyvisibleParameter = {
    viewerPoint: obj.viewPosition,
    point3DsList: obj.point3DList,
    radius: obj.distance,
    lonlat: true,
    viewShedType: viewShedType
  };
  let queryData = JSON.stringify(geometryViewShedBodyvisibleParameter);
  //先发送POST请求
  axios
    .post(state.viewshedSpatialUrl, queryData)
    .then(function(response) {
      //再发送一次GET请求  获取到运算结果
      axios
        .get(response.data.newResourceLocation + ".json")
        .then(function(response) {
          let data = response.data;
          if (data.geometry == null) return message.error("get geometry fail");
          //将二进制流构建arrayBuffer 添加至S3MInstanceCollection
          let u8 = new Uint8Array(data.geometry.model);
          let ab = u8.buffer;
          //注意  若添加多个模型 请保证各个名称唯一  否则可能引起显示错乱问题
          s3mInstanceColc.add(
            viewShedType,
            {
              id: 1,
              position: Cesium.Cartesian3.fromDegrees(
                data.geometry.position.x,
                data.geometry.position.y,
                data.geometry.position.z
              ),
              hpr: new Cesium.HeadingPitchRoll(0, 0, 0),
              color: color
            },
            ab,
            false
          );
          data.geometry.model = [4, 0, 0, 0].concat(data.geometry.model);
          // 分析区域颜色和可视域体颜色会影响，所以先透明
          viewshed3D.visibleAreaColor = Cesium.Color.fromCssColorString(
            "rgba(0,0,0,0)"
          );
          viewshed3D.hiddenAreaColor = Cesium.Color.fromCssColorString(
            "rgba(0,0,0,0)"
          );
        })
        .catch(function(error) {
          console.log(error);
        });
    })
    .catch(function(error) {
      console.log(error);
    });
}

// 清除
function clear() {
  clearViewshed();
  dynamicLayer3D.clearState(Carurls[0], [1]);
  clearInterval(timers);
  timers = null;
  state.viewshedAnimation = false;
  if(handlerPolyline) handlerPolyline.clearHandler();
}
function clearViewshed() {
  s3mInstanceColc.removeCollection("VISIBLEBODY");
  s3mInstanceColc.removeCollection("HIDDENBODY");
  viewer.entities.removeById("viewshedPoint");
  document.body.classList.remove("measureCur");
  viewshed3D.distance = 0.00001;
  viewshed3D.viewPosition = [0, 0, 0];
  state.observerInformation = null;
}

/*
    动态可视域模块
    */
//绘制路线
function drawPolyline() {
  if (!handlerPolyline) {
    handlerPolyline = initHandler("Polyline");
  }
  if (props.DynamicLine) {
    setCarState(); //如果传入路线,就不需要绘制路线了
    return;
  }
  handlerPolyline.handlerDrawing().then(
    res => {
      state.DynamicLine = res.object._positions;
      if (state.DynamicLine.length < 2) return;
      setCarState();
    },
    err => {
      console.log(err);
    }
  );
  handlerPolyline.activate();
}

// 添加动态可视域动画模型
function setCarState() {
  viewshed3D.distance = state.distance;
  viewshed3D.build();
  let points = state.DynamicLine;
  let points2 = [];
  for (let i = 1, j = points.length; i < j; i++) {
    let startPoint = points[i - 1];
    let endPoint = points[i];
    let d = Cesium.Cartesian3.distance(startPoint, endPoint);
    let count = parseInt(d / (state.DynamicSpeed * 0.05)) + 1;
    for (let i = 1, j = count; i <= j; i++) {
      points2.push(
        Cesium.Cartesian3.lerp(
          startPoint,
          endPoint,
          i / count,
          new Cesium.Cartesian3()
        )
      );
    }
  }
  let positions = tool.CartesiantoDegreesObjs(points2);
  let CarState = new Cesium.DynamicObjectState({
    id: 1,
    longitude: positions[0].longitude,
    latitude: positions[0].latitude,
    altitude: positions[0].height,
    scale: new Cesium.Cartesian3(1, 1, 1)
  });
  dynamicLayer3D.updateObjectWithModel(Carurls[0], [CarState]);
  let index = 1;
  timers = setInterval(() => {
    if (index >= positions.length) {
      clearInterval(timers);
      return;
    }
    CarState.longitude = positions[index].longitude;
    CarState.latitude = positions[index].latitude;
    CarState.altitude = positions[index].height;
    dynamicLayer3D.updateObjectWithModel(Carurls[0], [CarState]);
    let getAngleAndRadian = tool.getAngleAndRadian(
      points2[index - 1],
      points2[index]
    );
    viewshed3D.direction = getAngleAndRadian.angle;
    viewshed3D.viewPosition = [
      CarState.longitude,
      CarState.latitude,
      CarState.altitude + Number(state.addheight)
    ];
    index += 1;
  }, 50);
}

// 监听
watch(
  () => state.visibleBody,
  val => {
    if (val && state.observerInformation) {
      getVisibleResult();
    } else {
      s3mInstanceColc.removeCollection("VISIBLEBODY");
      if (!state.invisibleBody) {
        viewshed3D.visibleAreaColor = Cesium.Color.fromCssColorString(
          state.visibleAreaColor
        );
        viewshed3D.hiddenAreaColor = Cesium.Color.fromCssColorString(
          state.hiddenAreaColor
        );
      }
    }
  }
);
watch(
  () => state.invisibleBody,
  val => {
    if (val && state.observerInformation) {
      getInVisibleResult();
    } else {
      s3mInstanceColc.removeCollection("HIDDENBODY");
      if (!state.visibleBody) {
        viewshed3D.visibleAreaColor = Cesium.Color.fromCssColorString(
          state.visibleAreaColor
        );
        viewshed3D.hiddenAreaColor = Cesium.Color.fromCssColorString(
          state.hiddenAreaColor
        );
      }
    }
  }
);
watch(
  () => state.addheight,
  val => {
    if (val === "" || val < 0) {
      // 避免删除导致崩溃
      val = 0;
    }
    if (state.observerInformation) {
      state.observerInformation[2] += parseFloat(val);
      viewshed3D.viewPosition = state.observerInformation;
    }
  }
);
watch(
  () => state.pitch,
  val => {
    viewshed3D.pitch = parseFloat(val);
  }
);
watch(
  () => state.direction,
  val => {
    if (val === "" || val < 0) {
      // 避免删除导致崩溃
      val = 0;
    }
    viewshed3D.direction = parseFloat(val);
  }
);
watch(
  () => state.distance,
  val => {
    if (val === "" || val < 0) {
      // 避免删除导致崩溃
      val = 0;
    }
    viewshed3D.distance = parseFloat(val);
  }
);
watch(
  () => state.verticalFov,
  val => {
    viewshed3D.verticalFov = parseFloat(val);
  }
);
watch(
  () => state.horizontalFov,
  val => {
    viewshed3D.horizontalFov = parseFloat(val);
  }
);
watch(
  () => state.hintLineColor,
  val => {
    viewshed3D.hintLineColor = colorUpdate(val);
  }
);
watch(
  () => state.visibleAreaColor,
  val => {
    viewshed3D.visibleAreaColor = colorUpdate(val);
    if (state.visibleBody)
      s3mInstanceColc
        .getInstance("VISIBLEBODY", 1)
        .updateColor(colorUpdate(val));
  }
);

watch(
  () => state.hiddenAreaColor,
  val => {
    viewshed3D.hiddenAreaColor = colorUpdate(val);
    if (state.invisibleBody)
      s3mInstanceColc
        .getInstance("HIDDENBODY", 1)
        .updateColor(colorUpdate(val));
  }
);

watch(
  () => state.viewshedAnimation,
  val => {
    if (val) {
      clearViewshed();
      hint = notification.create({
        content: () => locale.value.ViewshedTip,
        duration: 3500
      });
    } else clear();
  }
);

function colorUpdate(val) {
  if (val == "") return;
  return Cesium.Color.fromCssColorString(val);
}
// 销毁
onBeforeUnmount(() => {
  clear();
  // viewshed3D.destroy();
  // dynamicLayer3D.
  if(handlerPolyline) handlerPolyline.destroy();
  viewshed3D = undefined;
  s3mInstanceColc = undefined;
});
</script>

<style lang="scss">
@import "../../../assets/style/common.scss";
</style>



