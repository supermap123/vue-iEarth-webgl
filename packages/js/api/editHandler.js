import tool from '../tool/tool.js';

/**
 * 编辑功能
 * EditPositions：编辑前的区域，用于编辑后的比较变化（array）
 * isEditZ：是否编辑z轴
 * callback：编辑后触发的回调函数
 * 注意：为了更好的性能，编辑功能是全局的唯一的，所以只能进行当前操作的编辑
 */
const initEditHandler = () => {
    let _entity = viewer.entities.add({
        id: "init-edit-polyline",
        polyline: {
            positions: [{ x: -1687926.0627172682, y: 5025270.532458924, z: 3546569.623704422 },
            { x: -1684478.2309053878, y: 5036133.455578336, z: 3532773.9256899045 }],
            show: false
        },
    });
    let editHandler = new Cesium.EditHandler(viewer, _entity);
    editHandler.deactivate();

    editHandler.handlerDrawing = function (editObject) {
        editHandler.deactivate();
        editHandler.setEditObject(editObject);
    }

    editHandler.changedEvt.addEventListener(() => {
        editHandler._positions;
    })

    return editHandler;
};

function setEditHandler (entity,callback){
    if(!editHandler) {
        editHandler = new Cesium.EditHandler(viewer, entity);
        editHandler.changedEvt.addEventListener(() => {
            callback(editHandler._positions);
        })
    }
    else{
        editHandler.deactivate();
        editHandler.setEditObject(editObject);
    }
}

export default setEditHandler;