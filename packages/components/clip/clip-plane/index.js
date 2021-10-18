import plane from './clip-plane.vue';

plane.install = function (app) {
    app.component('SmClipPlane', plane);
};

export default plane;
