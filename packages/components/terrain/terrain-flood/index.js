import flood from './terrain-flood.vue';

flood.install = function (app) {
    app.component('SmTerrainFlood', flood);
};

export default flood;
