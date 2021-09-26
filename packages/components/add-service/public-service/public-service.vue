<template>
  <n-space>
    <div
      class="n-tabs-img-item"
      v-for="(data,index) in options"
      :key="index"
      @click="addService(data)"
    >
      <img src="../../../assets/imgs/cross.png" alt class="cross" v-show="data.state != 0" />
      <span
        class="btn-close-service"
        v-show="data.state != 0"
        @click.stop="deletService(data)"
      >&times;</span>
      <img :src="data.imgUrl" />
      <span>{{isZH?data.name:data.nameEN}}</span>
    </div>
  </n-space>
</template>

<script setup>
import { watch, inject, ref, computed } from "vue";
import { useMessage, NSpace } from "naive-ui";
const message = useMessage();

let props = defineProps({
  serviceOptions: {
    type: Object,
    required: true
  },
  imgWidth: String,
  imgHeight: String
});

let options = ref(props.serviceOptions);
let storeState = inject("storeState");
let storeActions = inject("storeActions");
let { locale } = inject("storeData");

//根据当前语言环境判断配置语言
let isZH = computed(() => {
  return locale.value.Type === "zh" ? true : false;
});

//监听删除图层,恢复可加状态
watch(storeState.deleteLayerName, val => {
  options.value.forEach(data => {
    data.layers.forEach(layer => {
      if (layer.layerName === val) data.state = 0;
    });
  });
});

// 添加场景后自定义事件
const emit = defineEmits(["clickCallback"]);

// 添加公共服务
function addService(data) {
  if (data.state === 1) {
    // 提示已经存在
    return message.warning(locale.value.SceneAlreadyExists);
  }
  storeActions
    .addScene(data.layerUrl)
    .then(layers => {
      message.success(locale.value.AddLayerSuccess);
      storeActions.setLayerChanges(); // 触发图层管理树更新
      closeAddLayer(); // 关闭操作面弹窗
      data.state = 1;
      emit("clickCallback", data, layers); //自定义事件
    })
    .catch(err => {
      message.error(locale.value.AddLayerSuccess + ":" + err);
    });
}

// 删除公共服务
function deletService(data) {
  data.layers.forEach(layer => {
    storeActions.layersDelete(layer.type, layer.layerName);
  });
  data.state = 0;
  storeActions.setLayerChanges(); // 触发图层管理树更新
}

// 设置图片展示盒子宽高
let imgWidth = ref("120px");
let imgHeight = ref("120px");
if (props.imgHeight) imgHeight.value = props.imgHeight;
if (props.imgWidth) imgWidth.value = props.imgWidth;
</script>

<style lang="scss" scoped>
.n-tabs-img-item {
  position: relative;
  width: v-bind(imgWidth);
  height: v-bind(imgHeight);
  display: inline-block;
  text-align: center;
  img {
    width: 100%;
    height: 80%;
    box-sizing: border-box;
    border-radius: 4px;
    &:hover {
      border: 2px solid var(--bar-color);
    }
  }
  .cross {
    width: 25px;
    height: 25px;
    position: absolute;
    top: 0;
    left: 0;
  }
  .btn-close-service {
    line-height: 20px;
    position: absolute;
    font-size: 24px;
    right: 2px;
    top: 2px;
    width: 20px;
    height: 20px;
    display: inline-block;
    text-align: center;
    &:hover {
      background-color: rgb(163, 161, 161);
      cursor: pointer;
    }
  }
}
</style>