
// iearth的ui组件
import loading from './loading.vue'      
import measure from './measure.vue'
import layerTree from './layer-tree.vue'
import analysis from './analysis.vue'
import addLayer from './add-layer.vue'
import clip from './clip.vue'
import draw from './draw.vue'
import terrain from './terrain.vue'

const components = [
    loading,
    measure,
    layerTree,
    analysis,
    addLayer,
    clip,
    draw,
    terrain
];

const names = [
    'loading',
    'measure',
    'layerTree',
    'analysis',
    'addLayer',
    'clip',
    'draw',
    'terrain',
]

const install = (app, options) => {
    if (install.installed) return;
    install.installed = true;
    components.forEach((component,i) => {
        app.component(names[i], component);
    });
};


export default {
    install,
    components,
};






