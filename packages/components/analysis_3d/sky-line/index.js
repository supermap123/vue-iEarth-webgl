import sky from './sky-line.vue';

sky.install = function (app) {
    app.component(sky.name, sky);
};

export default sky;
