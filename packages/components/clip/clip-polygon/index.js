import polygon from './clip-polygon.vue';

polygon.install = function (app) {
    app.component('SmClipPolygon', polygon);
};

export default polygon;
