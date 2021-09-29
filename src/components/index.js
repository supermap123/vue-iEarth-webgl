
// iearth的ui组件
import loading from './loading.vue'      
// import measure from './measure.vue'
// import layerTree from './layer-tree.vue'
// import analysis from './analysis.vue'
import addLayer from './add-layer.vue'

const components = [
    loading,
    // measure,
    // layerTree,
    // analysis,
    addLayer,
];

const names = [
    'loading',
    // 'measure',
    // 'layerTree',
    // 'analysis',
    'addLayer'
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






