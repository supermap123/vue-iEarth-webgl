<template>
      <div id="toolbar" class="toolbar">
        <n-card content-style="padding:6px;" :class="{'disable':disableToolbar}">
          <n-space>
            <n-button text @click="showLayerTree=!showLayerTree" class="iconfont icontuceng" :title="resource.LayerManage"></n-button>
            <n-space v-show="isExtendToolbar">
              <n-button text @click="setSeletcedComponent('addLayer')" class="iconfont iconiEarth-tianjia" :title="resource.AddLayer"></n-button>
              <n-button text @click="setSeletcedComponent('analysis')" class="iconfont icontoolbar-analysis" :title="resource.Analysis"></n-button>
              <n-button text @click="setSeletcedComponent('measure')" class="iconfont iconliangsuan" :title="resource.Measure"></n-button>
            </n-space>
            <n-button text @click="isExtendToolbar=!isExtendToolbar" :class="isExtendToolbar? 'iconfont iconiEarth-R8-xiugai_shouqi' : 'iconfont iconiEarth-R8-xiugai_zhankai'" ></n-button>
          </n-space>
        </n-card>
      </div>

    <!-- 后面要开的其他功能
    <n-button text class="iconfont iconditushezhi"></n-button>
    <n-button text class="iconfont iconchangjingshezhi"></n-button>
    <n-button text class="iconfont iconcaijian1"></n-button>
    <n-button text class="iconfont icondixing"></n-button>
    <n-button text class="iconfont iconzaixianbianji" ></n-button> -->

</template>

<script setup>
import { ref, watch,inject } from "vue";

let {isViewer} = inject("storeState");
let {resource,showComponent,seletcedComponent,showLayerTree}= inject("state");

let isExtendToolbar = ref(true);

function setSeletcedComponent(name){
  if(seletcedComponent === name)
    showComponent.value = !showComponent.value;
  else {
    seletcedComponent.value = name;
    showComponent.value = true;
  }
}

//初始化地球完成前不能点击toolbar
let disableToolbar = ref(true);
watch(isViewer, val =>  disableToolbar.value = false);

</script>

<style lang="scss" scoped>
.toolbar {
  width: auto;
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 999;
  .n-space{
    button {
    padding: 6px;
    font-size: 24px;
   }
  }
}
</style>