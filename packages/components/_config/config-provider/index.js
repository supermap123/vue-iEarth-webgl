import provider from './config-provider.vue';

provider.install = function (app) {
    app.component("sm-config-provider", provider);
};

export default provider;
