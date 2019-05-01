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
        dataset:{

        },
        series: [{
            type: 'scatter3D',
            name:"EZ",
            dimensions: ['x', 'y', 'z','electrode'],//显示框信息

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
            dimensions: ['x', 'y', 'z','electrode'],//显示框信息
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
                color: "Gold"
            }
        },
        {
            type: 'scatter3D',
            name:"NIZ",
            dimensions: ['x', 'y', 'z','electrode'],//显示框信息
            data: co_data.niz,
            symbolSize: 4,//点的大小
            // symbol: 'triangle',
            itemStyle: {
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.8)'//边框样式
            },
            emphasis: {
                itemStyle: {
                    color: '#ccc',//高亮,
                    symbolSize:10
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

function linechart(data,signal,lens,nwd,wd,twoElectCo) {
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 100, bottom: 30, left: 50},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var dataviz = d3.select("#my_dataviz");
    dataviz.select("svg").remove();
    var svg = dataviz
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // List of groups (here I have one group per column)
    // var allGroup = ['C4-C5', 'C6-C7', 'C7-C8', 'C81-C82']

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
        .domain(signal)
        .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
    // .domain([0,10])
        .domain([data[0].time, data[lens - 1].time])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var dataFilter = data.map(function(d){return d.h2 });
    var max_h2 = d3.max(dataFilter) * 1.1;
    var max_y = max_h2 > 1 ? 1 : max_h2;
    var y = d3.scaleLinear()
        .domain([0, max_y])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Initialize line with group a
    var line = svg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.line()
            .x(function (d) {
                //alert(d.time)
                return x(d.time)
            })
            .y(function (d) {
                return y(d.h2)
            })
        )
        .attr("stroke", function (d) {
            //return myColor(signal[0])
            return "yellow"
        })
        .style("stroke-width", 3)
        .style("fill", "none");
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function (d) {
            return x(d.time);
        })
        .attr("cy", function (d) {
            return y(d.h2);
        })
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.h2.toFixed(4))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    dataviz.select("table").remove();
    var table = dataviz.append("table");
    table.attr("id", "line_tab");
    table.attr("class", "table tab1 table-bordered");
    table.append("caption").text(signal[0]+" -- "+signal[1]);
    var table_data = [["加权方向性",wd],["非加权方向性",nwd],["中值",d3.median(dataFilter)],["均值",d3.mean(dataFilter)],["最大值",d3.max(dataFilter)],["最小值",d3.min(dataFilter)],
    [signal[0]+"空间坐标",twoElectCo[0]],[signal[1]+"空间坐标",twoElectCo[1]],["空间几何距离",distance(twoElectCo[0],twoElectCo[1])]];
    var my_tr = table.append("tbody")
        .selectAll("mytr")
        .data(table_data)
        .enter()
        .append("tr");
    var td1 = my_tr.append("td")
        .style("font-size","28px;")
        .text(function (d) {
            return d[0]
        });
    var td2 = my_tr.append("td")
        .text(function (d) {
            if(typeof(d[1]) === "number"){
                return d[1].toFixed(4);
            }else if(d[1]){
                return [d[1][0].toFixed(4),d[1][1].toFixed(4),d[1][2].toFixed(4)];
            }else{
                return "坐标未定义！";
            }
        });
    /*
    d3.select("#my_dataviz")
    .insert("div","svg")
    .text("折线图")
    .style("font-size",30)
    .style("width","460px")
    .attr("align","center")
    .style("fill","magenta");
    */
    function distance(co1,co2) {
        if (!(co1&&co2)){
            return null;
        }
        var sum = 0;
        for (var i=0;i<co1.length;i++){
            sum += Math.pow(co1[i]-co2[i],2)
        }
        return Math.sqrt((sum))
    }
}