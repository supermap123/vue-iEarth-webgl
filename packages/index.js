/***
 * 完整组件
 * 统一打包组件库
 * */
import store from './js/store/store';
export { default as store } from './js/store/store';
export { default as enUS } from './js/locales/enUS';
export { default as darkTheme } from './js/theme/darkTheme';


import SmConfigProvider from './components/_config/config-provider/index';
import SmViewer from './components/viewer/index';
export { default as SmConfigProvider } from './components/_config/config-provider/index';
export { default as SmViewer } from './components/viewer/index';

import SmCustomService from './components/add-service/custom-service/index';
import SmPublicService from './components/add-service/public-service/index';

// 引入组件
const components = [
    SmConfigProvider,
    SmViewer,
    SmCustomService,
    SmPublicService,

];

const install = (app, options) => {
    if (install.installed) return;
    install.installed = true;
    app.use(store, options);
    components.forEach(component => {
        app.use(component);
    });
};


/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
    let app = Vue.createApp({});
    install(app);
  }

export default {
    install,
    components,
};






