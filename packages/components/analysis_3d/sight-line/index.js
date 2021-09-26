import sight from './sight-line.vue';

sight.install = function (app) {
    app.component(sight.name, sight);
};

export default sight;
