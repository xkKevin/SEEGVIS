 function scatter3D(co_data,name) {
    //co_data={"ez":[x,y,z],"pz":[],"niz":[]};
    var myChart = echarts.init(document.getElementById(name));
    /*
    var data1=[
            [1.550549, -3.096932, 7.248825],
            [1.666359, -3.360000, 7.301189],
            [1.873134, -3.690987, 7.311234],
            [1.972259, -3.991350, 7.393227]
        ];
    var data2 = [
            [1.487235, -2.365874, 8.171350],
            [1.518481, -2.674723, 8.355182],
            [1.562389, -3.292745, 8.721689]
        ];
        var data3 = [
            [2.107438, -2.082367, 9.217914],
            [2.282581, -2.339542, 9.378181],
            [2.457725, -2.596717, 9.538449]
        ];
        console.log(data1);
        console.log(data2);
        console.log(data3);
        console.log(co_data.ez);
        console.log(co_data.pz);
        console.log(co_data.niz);
    */
    myChart.setOption({
         title : {
            text: '各电极点在大脑的空间几何位置',
             y:"bottom",
             x:"center"
        },
        tooltip: {},
        xAxis3D: {
            name: "x",
            type: 'value',
//                min: 'dataMin',//获取数据中的最值
//                max: 'dataMax'
        },
        yAxis3D: {
            name: "y",
            type: 'value',
//                min: 'dataMin',
//                max: 'dataMax'
        },
        zAxis3D: {
            name: "z",
            type: 'value',
//                min: 'dataMin',
//                max: 'dataMax'
        },
        grid3D: {
            axisLine: {
                lineStyle: {
                    color: '#000'//轴线颜色
                }
            },
            axisPointer: {
                lineStyle: {
                    color: '#f00'//坐标轴指示线
                },
                show: false//不坐标轴指示线
            },
            viewControl: {
//                     autoRotate: true,//旋转展示
//                     projection: 'orthographic'
                beta: 5
            },
            boxWidth: 180,
            boxHeight: 90,
            boxDepth: 90,
            top: -50
        },
        legend: {
            data:['EZ','PZ',"NIZ"]
        },
        series: [{
            type: 'scatter3D',
            name:"EZ",
            //dimensions: ['x', 'y', 'z'],//显示框信息

            /*
            encode: {
               x: [3, 1, 5],      // 表示维度 3、1、5 映射到 x 轴。
               y: 2,              // 表示维度 2 映射到 y 轴。
               tooltip:['a','c','b'], // 表示维度 3、2、4 会在 tooltip 中显示。
               label: 'a'           // 表示 label 使用维度 3。
           },
           */
            data: co_data.ez,
            symbolSize: 4,//点的大小
            // symbol: 'triangle',
            itemStyle: {
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.8)'//边框样式
            },
            emphasis: {
                itemStyle: {
                    color: '#ccc'//高亮
                }
            },
            itemStyle: {
                //color: "#f00"
                color: "red"
            }
        },
        {
            type: 'scatter3D',
            name:"PZ",
            //dimensions: ['x', 'y', 'z'],//显示框信息

            /*
            encode: {
               x: [3, 1, 5],      // 表示维度 3、1、5 映射到 x 轴。
               y: 2,              // 表示维度 2 映射到 y 轴。
               tooltip:['a','c','b'], // 表示维度 3、2、4 会在 tooltip 中显示。
               label: 'a'           // 表示 label 使用维度 3。
           },
           */
            data: co_data.pz,
            symbolSize: 4,//点的大小
            // symbol: 'triangle',
            itemStyle: {
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.8)'//边框样式
            },
            emphasis: {
                itemStyle: {
                    color: '#ccc'//高亮
                }
            },
            itemStyle: {
                //color: "#f00"
                color: "yellow"
            }
        },
        {
            type: 'scatter3D',
            name:"NIZ",
            //dimensions: ['x', 'y', 'z'],//显示框信息

            /*
            encode: {
               x: [3, 1, 5],      // 表示维度 3、1、5 映射到 x 轴。
               y: 2,              // 表示维度 2 映射到 y 轴。
               tooltip:['a','c','b'], // 表示维度 3、2、4 会在 tooltip 中显示。
               label: 'a'           // 表示 label 使用维度 3。
           },
           */
            data: co_data.niz,
            symbolSize: 4,//点的大小
            // symbol: 'triangle',
            itemStyle: {
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.8)'//边框样式
            },
            emphasis: {
                itemStyle: {
                    color: '#ccc'//高亮,
                }
            },
            itemStyle: {
                //color: "#f00"
                color: "blue"
            }
        },
        ],
        backgroundColor: "#fff"
    });
}