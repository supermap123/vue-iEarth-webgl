<template>
  <n-space vertical>
    <n-select v-model:value="layerType" size="small" :options="options" />
    <n-input v-model:value="layerUrl" size="small" type="text" :placeholder="locale.LayerUrl" />
    <n-input v-model:value="layerName" size="small" type="text" :placeholder="locale.LayerName" v-if="layerType === 'S3M'||layerType === 'MVT'"/>
    <n-input v-model:value="token" size="small" type="text" :placeholder="locale.AddToken" />
    <n-checkbox v-model:checked="isSct" v-if="layerType==='TERRAIN'" size="small">{{locale.ISct}}</n-checkbox>
    <n-space justify="end">
      <n-button @click="addLayer">{{locale.Confirm}}</n-button>
    </n-space>
  </n-space>
</template>

<script setup>
import { reactive, toRefs, inject ,onBeforeUnmount} from "vue";
import { NSelect, NInput, NSpace, NButton, useMessage } from "naive-ui";

const message = useMessage();
let storeActions = inject("storeActions");
let { locale } = inject("storeData");

const emit = defineEmits(["addCallback"]); // 添加后自定义事件
let state = reactive({
  options: [
    {
      label: () => locale.value.Scene,
      value: "SCENE"
    },
    {
      label: () => locale.value.S3mLayer,
      value: "S3M"
    },
    {
      label: () => locale.value.ImageLayer,
      value: "IMG"
    },
    {
      label: () => locale.value.TerrainLayer,
      value: "TERRAIN"
    },
    {
      label: () => locale.value.Mvt,
      value: "MVT"
    }
  ],
  layerType: "SCENE",
  layerUrl: null,
  layerName: null,
  token: null,
  isSct: true
});

const { options, layerType, layerUrl, layerName ,token,isSct} = { ...toRefs(state) };

function checkLayersType(url) {
  // console.log(window.location.protocol,window.location.protocol.split(':')[0])
  let arr = url.split("/");
  let layer_type = arr[arr.length - 1];
  if (layer_type === "realspace" && state.layerType != "SCENE") return false;
  if (layer_type === "config" && state.layerType != "S3M") return false;
  if (layer_type === "image" && state.layerType != "IMG") return false;
  return true;
}

// 添加图层
function addLayer() {
  let url = Trim(state.layerUrl);
  let name = Trim(state.layerName);
  if (!url || url === "") return message.warning(locale.value.LayerAddressTip);
  // if (!name || name === "") return message.warning(locale.value.LayerNameTip);
  if (!checkLayersType(url)) return message.warning(locale.value.CheckLayerTypeError);
  if (state.token && Trim(state.token) !=='') Cesium.Credential.CREDENTIAL = new Cesium.Credential(state.token);
  switch (state.layerType) {
    case "SCENE":
      storeActions
        .addScene(url)
        .then(layers => successAndclose(layers))
        .catch(err => message.error(locale.value.AddLayerFail+':'+err));
      break;
    case "S3M":
      let scps = [{ url: url, options: { name: name }}];
      storeActions
        .addS3mLayers(scps)
        .then(layers => successAndclose(layers))
        .catch(err => message.error(locale.value.AddLayerFail+':'+err));
      break;
    case "IMG":
      storeActions
        .addImageLayer(url)
        .then(layers => successAndclose(layers))
        .catch(err => message.error(locale.value.AddLayerFail+':'+err));
      break;
    case "TERRAIN":
      storeActions
        .addTerrainLayer(url, state.isSct)
        .then(layers => successAndclose(layers))
        .catch(err => message.error(locale.value.AddLayerFail+':'+err));
      break;
    case "MVT":
      storeActions
        .addMvtLayer(url, name)
        .then(layers => successAndclose(layers))
        .catch(err => message.error(locale.value.AddLayerFail+':'+err));
      break;
  }
}

//去除字符串前后所有空
function Trim(str) {
 if(typeof(str) === 'string') return str.replace(/(^\s*)|(\s*$)/g, "");
};

function successAndclose(layers) {
  storeActions.setLayerChanges(); // 触发图层更新标志
  message.success(locale.value.AddLayerSuccess);
  state.layerUrl = null;
  state.layerName = null;
  state.token = null;
  state.isSct = true;
  emit("addCallback", layers);
};

// 销毁
onBeforeUnmount(() => {
});
</script>

<style lang="scss" scoped>
.my-layout {
  height: v-bind(windowHeight);
}
</style>


