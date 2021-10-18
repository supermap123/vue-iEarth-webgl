import operation from './terrain-operation.vue';

operation.install = function (app) {
    app.component('SmTerrainOperation', operation);
};

export default operation;
