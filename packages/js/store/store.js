
// 创建一个store状态管理

import { ref, shallowRef, shallowReactive} from "vue";
import zhCN from "../locales/zhCN"
import layerManage from '../api/layer-manage'

// 全局状态管理
const storeState = {
    isViewer: ref(false),       //初始化完成viewer置为true
    layerChanges : ref(0),      //图层改变监听的值，只关心变化
    deleteLayerName:'',         //删除图层名称，用于图层树交互
};

// 全局数据
const storeData = {
    locale : shallowRef(zhCN),  //全局语言
    theme  : shallowRef(null),  //全局主题，默认null为light类型
};

//全局方法
const storeActions = {
    setIsViewer(value) {
        storeState.isViewer.value = true;
    },
    setLayerChanges(value) {
        storeState.layerChanges.value += 1;
    },
    setLocale(value) {
        if(value) storeData.locale.value = value;
        else storeData.locale.value = zhCN;
    },
    setTheme(value) {
        if(value) storeData.theme.value = value;
        else storeData.theme.value = null;
    },
};

Object.assign(storeActions,layerManage);


function createStore(store) {
    return {
        install: (app, options) => {
            if(options && options.locale) storeActions.setLocale(options.locale)
            for (let key in store) {
                if (store.hasOwnProperty(key)) {
                    app.provide(key, store[key])
                }
            }
        }
    }
}

export default createStore({
    storeState,
    storeActions,
    storeData
})








