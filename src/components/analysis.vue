<template>
  <n-card closable @close="showComponent = false" v-show="show" content-style="padding: 0 20px 15px 20px;">
    <n-tabs type="line" size="large" >
      <n-tab-pane name="Sightline"   display-directive="show" :tab='resource.Sightline'> <sm-sightline/> </n-tab-pane>
      <n-tab-pane name="Viewshed" display-directive="show" :tab='resource.Viewshed'> <sm-viewshed/>   </n-tab-pane>
      <n-tab-pane name="Skyline" display-directive="show" :tab='resource.Skyline'> <sm-skyline/>   </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import {inject} from 'vue'

let showComponent= inject("showComponent");
let resource = inject("resource");

defineProps({
  show: Boolean
});

</script>

<style lang="scss" scoped>
.n-card {
  max-width: 600px;
  width: auto;
  position: absolute;
  right: 6%;
  top: 6%;
  z-index: 999;
}
</style>