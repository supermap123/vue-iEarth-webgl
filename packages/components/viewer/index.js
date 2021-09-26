import viewer from './viewer.vue';
import name from '../../js/comps-name-config'

viewer.install = function (app) {
    app.component(name.viewer, viewer);
};

export default viewer;
