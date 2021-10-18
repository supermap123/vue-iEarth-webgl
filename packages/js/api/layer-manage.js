
// 添加s3m
function addS3mLayers(scps) {  //scps:[{ url, name]}  
    let promiseArray = [];
    try {
        if (scps) {
            scps.forEach(scp => {
                promiseArray.push(
                    viewer.scene.addS3MTilesLayerByScp(scp.url, { name: scps.name })
                );
            });
        }
        return new Promise((resolve, reject) => {
            Cesium.when.all(promiseArray, (layers) =>  resolve(layers) , (e) => reject(e))
        })
    } catch (e) {
        let widget = viewer.cesiumWidget;
        if (widget._showRenderLoopErrors) {
            let title = "An error occurred during rendering and rendering has stopped";
            widget.showErrorPanel(title, undefined, e);
        }
    }
};


// 添加场景
function addScene(url, isAutoSetView) {
    // 自动定位
    let flag = true;
    if (isAutoSetView !== undefined) flag = isAutoSetView;
    if (checkURL(url)) {
        try {
            let promise = viewer.scene.open(url, undefined, { 'autoSetView': flag });
            return new Promise((resolve, reject) => {
                Cesium.when(promise,(layers)=> resolve(layers),(e) => reject(e));
            })
        } catch (e) {
          
        }
    }
};

// 添加地形
function addTerrainLayer(LayerURL, isSct) {
    let sct = isSct === undefined ? true : isSct;
    try {
        viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
            url: LayerURL,
            isSct: sct, //地形服务源自SuperMap iServer发布时需设置isSct为true
        }).readyPromise.then(() => {
            return new Promise((resolve, reject) => {
                resolve(viewer.terrainProvider)
            })
        })
    } catch (e) {
        let widget = viewer.cesiumWidget;
        if (widget._showRenderLoopErrors) {
            let title = "An error occurred during rendering and rendering has stopped";
            widget.showErrorPanel(title, undefined, e);
        }
    }
};

// 添加影像
function addImageLayer(LayerURL) {    // 返回img图层layer
    try {
        return new Promise((resolve, reject) => {
            let layer = viewer.imageryLayers.addImageryProvider(
                new Cesium.SuperMapImageryProvider({
                    url: LayerURL,
                })
            );
            resolve(layer);
        })
    } catch (e) {
        let widget = viewer.cesiumWidget;
        if (widget._showRenderLoopErrors) {
            let title = "An error occurred during rendering and rendering has stopped";
            widget.showErrorPanel(title, undefined, e);
        }
    }

};

// 添加mvt
function addMvtLayer(LayerURL, name) {    // 返回img图层layer
    try {
        let mvtMap = viewer.scene.addVectorTilesMap({
            url: LayerURL,
            canvasWidth: 512,
            name: name || 'mvt',
            viewer: viewer
        });
        Cesium.when(mvtMap.readyPromise, function (data) {
            var bounds = mvtMap.rectangle;
            viewer.scene.camera.flyTo({
                destination: new Cesium.Cartesian3.fromRadians(
                    (bounds.east + bounds.west) * 0.5,
                    (bounds.north + bounds.south) * 0.5,
                    10000
                ),
                duration: 0,
                orientation: {
                    heading: 0,
                    roll: 0
                }
            });
            return new Promise((resolve, reject) => {
                resolve(mvtMap)
            })
        });
    } catch (e) {
        let widget = viewer.cesiumWidget;
        if (widget._showRenderLoopErrors) {
            let title = "渲染时发生错误，已停止渲染。";
            widget.showErrorPanel(title, undefined, e);
        }
    }

};

// 加载s3m和场景函数
function setPromise(promiseArray) {
    Cesium.when.all(promiseArray, (layers) => {
        return layers
    },
        function (e) {
            let widget = viewer.cesiumWidget;
            if (widget._showRenderLoopErrors) {
                let title = 'Please check if the url address is correct？';
                widget.showErrorPanel(title, undefined, e);
            }
        }
    );
};

//   检验url地址
function checkURL(url) {
    if (url === null || url === "") {
        return false;
    }
    if (url.charAt(0) == '"' || url.charAt(0) == "'") {
        let reg = /^['|"](.*)['|"]$/;
        url = url.replace(reg, "$1");
    }
    return true
};

//   删除图层
function layersDelete(type, name) {
    switch (type) {
        case "S3M":
            viewer.scene.layers.remove(name);
            break;
        case "IMG":
            let img_layers = viewer.imageryLayers._layers
            for (let i = 0, j = img_layers.length; i < j; i++) {
                if (img_layers[i].imageryProvider.tablename && img_layers[i].imageryProvider.tablename === name) {
                    viewer.imageryLayers.remove(img_layers[i]);
                }
            };
            break;
        case "TERRAIN":
            viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
            break;
        case "MVT":
            viewer.scene.removeVectorTilesMap(name);
            break;
        default:
            null;
    }
}


export default {
    addS3mLayers,
    addScene,
    addTerrainLayer,
    addImageLayer,
    layersDelete,
    addMvtLayer,
};
