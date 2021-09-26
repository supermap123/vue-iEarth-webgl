
/* *
*公共服务场景图层配置
*/
export default  [
            {
                type: "REALSPACE",
                name: "CBD",
                nameEN: "CBD",
                imgUrl: "public/img/webServeImg/CBD.png",
                layerUrl: 'https://www.supermapol.com/realspace/services/3D-CBD/rest/realspace',
                layers: [{ type: 'S3M', layerName: 'Building@CBD' }, { type: 'S3M', layerName: 'Tree@CBD' }, { type: 'S3M', layerName: 'Xiaopin@CBD' },{ type: 'S3M', layerName: 'Lake@CBD' }, { type: 'S3M', layerName: 'Ground@CBD' }, { type: 'S3M', layerName: 'Ground2@CBD' }, { type: 'S3M', layerName: 'Bridge@CBD' }],
                state: 0
            },
            {
                type: "REALSPACE",
                name: "倾斜摄影模型",
                nameEN: "Oblique photography model",
                imgUrl: "public/img/webServeImg/铁岭.png",
                layerUrl: "https://www.supermapol.com/realspace/services/3D-QingXieSheYingMoXing/rest/realspace",
                layers: [{ type: 'S3M', layerName: 'qingxie' }],
                state: 0
            },
            {
                type: "REALSPACE",
                name: "白模",
                nameEN: "White mold",
                imgUrl: "public/img/webServeImg/白模.png",
                layerUrl: 'https://www.supermapol.com/realspace/services/3D-CQmodel_wireframe_2000/rest/realspace',
                layers: [{ type: 'S3M', layerName: 'CQmodel' }],
                style: { fillStyle: 'Fill_And_WireFrame' },  
                state: 0
            },
            {
                type: "REALSPACE",
                name: "BIM建筑",
                nameEN: "BIM building",
                imgUrl: "public/img/webServeImg/BIM.png",
                layerUrl: "https://www.supermapol.com/realspace/services/3D-wireFrame/rest/realspace",
                layers: [{ type: 'S3M', layerName: "wireFrame" }],
                state: 0
            },
       
            {
                type: "REALSPACE",
                name: "珠峰地形影像",
                nameEN: "Topographic image of Mount Everest",
                imgUrl: "public/img/webServeImg/珠峰.png",
                layerUrl: "https://www.supermapol.com/realspace/services/3D-ZF_normal/rest/realspace",
                layers: [{ type: 'IMG', layerName: 'image' }, { type: 'TERRAIN', layerName: 'srtm_54_07%40zhufeng' }],
                state: 0
            },
            {
                type: "REALSPACE",
                name: "点云",
                nameEN: "Point cloud",
                imgUrl: "public/img/webServeImg/点云.png",
                layerUrl: "https://www.supermapol.com/realspace/services/3D-cloud/rest/realspace",
                layers: [{ type: 'S3M', layerName: 'POINTCLOUD23' }],
                state: 0
            },
            {
                type: "MVT",
                name: "京津地区MVT",
                nameEN: "MVT",
                imgUrl: "public/img/webServeImg/MVT.jpg",
                layerUrl: "https://www.supermapol.com/realspace/services/map-mvt-JingJinDiQuDiTu/restjsr/v1/vectortile/maps/%E4%BA%AC%E6%B4%A5%E5%9C%B0%E5%8C%BA%E5%9C%B0%E5%9B%BE",
                layers: [{ type: 'MVT', layerName: '京津地区MVT' }],
                state: 0
            },
        ]
   





