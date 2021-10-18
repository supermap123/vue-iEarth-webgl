<template>
  <n-tree
    block-node
    cascade
    checkable
    virtual-scroll
    :data="data"
    :default-expanded-keys="defaultExpandedKeys"
    :default-checked-keys="defaultCheckedKeys"
    @update:checked-keys="getCheckedKeys"
    @update:selected-keys="getSelectedKeys"
    style="max-height: 500px"
  />
</template>

<script setup>
import { h, ref, watch, shallowRef, inject } from "vue";
import { NButton, NPopconfirm, useMessage, NTree } from "naive-ui";

const message = useMessage();
let storeState = inject("storeState");
let { setDeleteLayerName, layersDelete, getScene, setLayerChanges } = inject(
  "storeActions"
);
let { locale } = inject("storeData");
let layers, imgLayers, terrainLayers, mvtLayers, terrainProvider;

// 触发更新
let props = defineProps({
  isUpdate: {
    type: Boolean,
    default: true
  }
});
watch(
  () => props.isUpdate,
  val => {
    if (val) setTimeout(() => updateLayers(), 500);
  }
);

//监听图层改变
watch(storeState.layerChanges, val => {
  if (props.isUpdate) updateLayers();
});

// 定义数据
let data = shallowRef([
  { label: () => locale.value.NoLayer, key: 0, disabled: true }
]);
let defaultExpandedKeys = ref(["root--s3m"]); //默认展开
let defaultCheckedKeys = ref(["root--s3m", "root--img", "root--terrain"]); //默认选中

// 创建节点函数
function creatNode(label, key, children, type, is_suffix) {
  return {
    label: label,
    key: key,
    children: children,
    type: type,
    suffix: is_suffix ? () => renderSuffix(type, label) : undefined
  };
}

let s3mRootNode = creatNode(
  () => locale.value.S3mLayer,
  "root--s3m",
  [],
  "ROOT--S3M",
  false
);
let imgRootNode = creatNode(
  () => locale.value.ImageLayer,
  "root--img",
  [],
  "ROOT--IMG",
  false
);
let mvtRootNode = creatNode(
  () => locale.value.ImageLayer,
  "root--mvt",
  [],
  "ROOT--MVT",
  false
);

let terrainRootNode = creatNode(
  () => locale.value.TerrainLayer,
  "root--terrain",
  [],
  "ROOT--TERRAIN",
  false
);

// update图层
function updateLayers() {
  s3mRootNode.children.length = 0;
  imgRootNode.children.length = 0;
  mvtRootNode.children.length = 0;
  terrainRootNode.children.length = 0;

  // 获取所有图层
  layers = viewer.scene.layers.layerQueue;
  imgLayers = viewer.imageryLayers._layers;
  mvtLayers = viewer.scene._vectorTileMaps._layerQueue;
  terrainLayers = viewer.terrainProvider;
  updataS3MLayer();
  updataImgLayers();
  updataMvtLayers();
  updataTerrainLayers();
  let newData = [];

  if (s3mRootNode.children.length > 0) {
    newData[0] = s3mRootNode;
  }
  if (imgRootNode.children.length > 0) {
    newData[1] = imgRootNode;
  }
  if (mvtRootNode.children.length > 0) {
    newData[2] = mvtRootNode;
  }
  if (terrainRootNode.children.length > 0) {
    newData[3] = terrainRootNode;
  }
  if (newData.length === 0) {
    data.value = [
      { label: () => locale.value.NoLayer, key: 0, checkboxDisabled: true }
    ];
    return;
  }
  data.value = newData;
}

// updatS3M图层
function updataS3MLayer() {
  if (!layers || layers.length < 1) return;
  layers.forEach((layer, index) => {
    let name = layer._name;
    s3mRootNode.children.push(
      creatNode(name, `S3M--${name}--${index}`, undefined, "S3M", true)
    );
  });
}
//updatImg
function updataImgLayers() {
  if (!imgLayers || imgLayers.length < 1) return;
  imgLayers.forEach((layer, index) => {
    let isMvt = layer._imageryProvider instanceof Cesium.MvtProviderGL;
    if (index === 0 || isMvt) return true;
    let name = layer._imageryProvider.tablename || "img";
    imgRootNode.children.unshift(
      creatNode(name, `IMG--${name}--${index}`, undefined, "IMG", true)
    );
  });
}
//updatMVT
function updataMvtLayers() {
  mvtLayers.forEach((layer, index) => {
    let name = layer.name || "mvt";
    mvtRootNode.children.unshift(
      creatNode(name, `IMG--${name}--${index}`, undefined, "MVT", true)
    );
  });
}
//updatTerrain
function updataTerrainLayers() {
  let name = terrainLayers.tablename;
  if (name) {
    terrainRootNode.children[0] = creatNode(
      name,
      `TERRAIN--${name}--0`,
      undefined,
      "TERRAIN",
      true
    );
  } else terrainLayers = undefined;
}

// 勾选节点显隐
function getCheckedKeys(params) {
  set_layer_visible(s3mRootNode.children, params);
  set_layer_visible(imgRootNode.children, params);
  set_layer_visible(mvtRootNode.children, params);
  set_layer_visible(terrainRootNode.children, params);
}
function set_layer_visible(arr, checkedKeys) {
  if (!arr instanceof Array || arr.length === 0) return;
  arr.forEach(layerObj => {
    let keys = layerObj.key.split("--");
    let index = keys[2];
    index = Number(index);
    if (index === NaN) return;
    let checked = checkedKeys.includes(layerObj.key);
    setVisible(keys[0], index, checked);
  });
}
//设置图层显隐
function setVisible(type, index, checked) {
  switch (type) {
    case "S3M":
      layers[index].visible = checked;
      break;
    case "IMG":
      imgLayers[index].show = checked;
      break;
    case "MVT":
      mvtLayers[index].show = checked;
      break;
    case "TERRAIN":
      if (!checked) {
        terrainProvider = viewer.terrainProvider;
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      } else if (terrainProvider) {
        viewer.terrainProvider = terrainProvider;
      }
      break;
    default:
      null;
  }
}

// 点击节点定位
let selectedKey;
function getSelectedKeys(params) {
  selectedKey = params[0] ? params[0] : selectedKey;
  let infos = selectedKey ? selectedKey.split("--") : [];
  let index = infos[2] ? infos[2] : undefined;
  let layerType = infos[0] ? infos[0] : undefined;
  flytoLayer(layerType, index);
}

function flytoLayer(type, index) {
  if (index === undefined) return;
  let layer;
  switch (type) {
    case "S3M":
      layer = layers[index];
      break;
    case "IMG":
      layer = imgLayers[index];
      break;
    case "MVT":
      layer = mvtLayers[index];
      break;
    case "TERRAIN":
      terrainLayers.readyPromise.then(() => {
        let bounds = terrainLayers._bounds;
        let destination = new Cesium.Rectangle.fromDegrees(
          bounds.west,
          bounds.south,
          bounds.east,
          bounds.north
        );
        viewer.scene.camera.flyTo({ destination });
      });
      break;
    default:
      null;
  }
  if (layer) viewer.flyTo(layer);
}

// 删除图层
function renderSuffix(type, name) {
  return h(
    NPopconfirm,
    {
      placement: "left-start",
      onPositiveClick: () => {
        deletLayer(type, name);
      }
    },
    {
      trigger: () =>
        h(NButton, {
          text: true,
          onClick: e => {
            e.stopPropagation();
          },
          class: "iconfont iconshanchu"
        }),
      default: () => locale.value.DeleteLayerTip
    }
  );
}


function deletLayer(layerType, layerName) {
  if (!layerType || !layerName)
    return message.error(locale.value.DeleteLayerFail);
  layersDelete(layerType, layerName);
  updateLayers();
  setDeleteLayerName(layerName); //提供给添加图层组件设置状态
  setLayerChanges(); // 触发图层管理树更新
  message.success(locale.value.DeleteLayerSuccess);
}
</script>

