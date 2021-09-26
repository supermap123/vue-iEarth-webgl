<template>
  <n-card closable @close="showComponent = false" v-show="show" content-style="padding:6px;">
      <sm-measure/>
  </n-card>
</template>

<script setup>
// import measure from "ucomps/measure/index.js";
// import {NCard} from "naive-ui";
import {inject} from 'vue'

let showComponent= inject("showComponent");


defineProps({
  show: Boolean
});

</script>

<style lang="scss" scoped>
.n-card {
  width: auto;
  position: absolute;
  right: 6%;
  top: 6%;
  z-index: 999;
}
</style>