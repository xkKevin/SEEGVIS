//注意：d3.median和d3.mean可以接受字符串数组，但d3.max和d3.min不行（只能是number类型的数组）！

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
        tooltip: {
             // {a}（系列名称），{b}（数据名称），{c}（数值数组）
             formatter: function (params) {
                 return "<div style='font-size: larger;'>"+params.seriesName+"</div>" +  // params.value[3]+" : "+
                     "x : "+params.value[0]+"<br>"+"y : "+params.value[1]+"<br>"+"z : "+params.value[2];
             }
        },
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
            data:['EZ','PZ',"NIZ","UNKNOWN"]
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
        {
            type: 'scatter3D',
            name:"UNKNOWN",
            dimensions: ['x', 'y', 'z','electrode'],//显示框信息
            data: co_data.unknown,
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
                color: "black"
            }
        }
        ],
        backgroundColor: "#fff"
    });
}

function linechart(data,signal,lens,nwd,wd,twoElectCo,statistic) {

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 100, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
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
    var ticks = x.ticks(5),
        tickFormat = x.tickFormat(5, "+%");
    ticks.map(tickFormat); // ["-100%", "-50%", "+0%", "+50%", "+100%"]

    svg.append("g")
        .attr("class","axis_line")
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

    var dataFilter_lag = data.map(function(d){return Math.abs(d.lag) });
    var y_lag = d3.scaleLinear()
        .domain([0, d3.max(dataFilter_lag)])
        //.range([height, 0]);
        .range([3, 16]);
    /*
    svg.append("g")
        .attr("transform", "translate("+width+",0)")
        .call(d3.axisRight(y_lag));
    */
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
        .attr("r", function (d) {
            return y_lag(Math.abs(d.lag));
        })
        .attr("fill", function (d) {
            if (d.lag > 0) return "red";
            if (d.lag == 0) return "black";
            if (d.lag < 0) return "green";
        })
        .attr("cx", function (d) {
            return x(d.time);
        })
        .attr("cy", function (d) {
            return y(d.h2);
        })
        .on("mouseover", function (d) {
            div1.transition()
                .duration(200)
                .style("opacity", .9);
            div1.html(d.time+"<br/>h2 : "+formatNum(d.h2)+"<br/>lag : "+d.lag)
                .style("left", (d3.event.pageX - 45) + "px")
                .style("top", (d3.event.pageY - 53) + "px");
        })
        .on("mouseout", function (d) {
            div1.transition()
                .duration(500)
                .style("opacity", 0);
        });
    /*
    var line_zero = svg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.line()
            .x(function (d) {
                //alert(d.time)
                return x(d.time)
            })
            .y(y_lag(0))
        )
        .attr("stroke", function (d) {
            //return myColor(signal[0])
            return "grey"
        })
        .style("stroke-width", 1)
        .style("fill", "none");

    var line_lag = svg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.line()
            .x(function (d) {
                //alert(d.time)
                return x(d.time)
            })
            .y(function (d) {
                return y_lag(d.lag)
            })
        )
        .attr("stroke", function (d) {
            //return myColor(signal[0])
            return "blue"
        })
        .style("stroke-width", 3)
        .style("fill", "none");

    svg.selectAll("rect")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function (d) {
            return x(d.time);
        })
        .attr("cy", function (d) {
            return y_lag(d.lag);
        })
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.time+' : '+d.lag.toFixed(4))
                .style("left", (d3.event.pageX - 45) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    */

    dataviz.select("table").remove();
    var table = dataviz.append("table");
    table.attr("id", "line_tab");
    table.attr("class", "table tab1 table-bordered");
    table.append("caption").text(signal[0]+" -- "+signal[1]);
    var table_data = [["加权方向性",wd],["非加权方向性",nwd],["中值（总、正、负）",statistic.median],["均值（总、正、负）",statistic.mean],["最大值（总、正、负）",statistic.max],
    ["最小值（总、正、负）",statistic.min],[signal[0]+" 空间坐标",twoElectCo[0]],[signal[1]+" 空间坐标",twoElectCo[1]],["空间几何距离",distance(twoElectCo[0],twoElectCo[1])]];
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
                return formatNum(d[1]);
            }else if(d[1]){
                return [formatNum(d[1][0]),formatNum(d[1][1]),formatNum(d[1][2])];
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


function violinBwt() {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 60, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    d3.select("#violinRight").selectAll("*").remove();
    var violin = d3.select("#violinLeft");
    violin.selectAll("*").remove(); //清空所有子元素
    violin.append("h3")
        .html("区域内与区域间 FC 小提琴总图")
        .style("width","1000px")
        .attr("align","center");
    var svg = violin
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    var outData=[];
    // Read the data and compute summary statistics for each specie
    d3.csv("/static/data/fc_result.csv", function(data) {
        //console.log(data);
        outData=data;
        //console.log(d3.median(data[0].h2.slice(1,-1).split(",")));
      // Build and Show the Y scale
     var dataFilter = data.map(function(d){return d3.median(d.h2.slice(1,-1).split(",")) });
    var max_h2 = d3.max(dataFilter) * 1.2;
    var max_y = max_h2 > 1 ? 1 : max_h2;
      var y = d3.scaleLinear()
        .domain([0, max_y])          // Note that here the Y scale is set manually
        .range([height, 0]);
      svg.append("g").call( d3.axisLeft(y) );

      // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(["ez", "pz", "niz","ez_pz","ez_niz","pz_niz"])
        .padding(0.05); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
      svg.append("g")
          .attr("class","axis_violin")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Features of the histogram
      var histogram = d3.histogram()
            .domain(y.domain())
            .thresholds(y.ticks(10))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d);

      // Compute the binning for each group of the dataset
      var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor:分层地分组数组元素。
        .key(function(d) { return d.zone;})
        .rollup(function(d) {   // For each key..
          input = d.map(function(g) { return d3.median(g.h2.slice(1,-1).split(","));});    // Keep the variable called Sepal_Length
          bins = histogram(input);   // And compute the binning on it.
          return(bins)
        })
        .entries(data); //返回一组键-值元组（其实就是一个字典）
      // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
      var maxNum = 0;
      for (i in sumstat ){
        allBins = sumstat[i].value;
        lengths = allBins.map(function(a){return a.length;});
        longuest = d3.max(lengths);
        if (longuest > maxNum) { maxNum = longuest }
      }
      // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
      var xNum = d3.scaleLinear()
        .range([0, x.bandwidth()])
        .domain([-maxNum,maxNum]);

      // Color scale for dots
      var myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0,1]);

      var myColorViolin = d3.scaleOrdinal()
        .domain(d3.range(0,6))  //  x.domain()获取x定义域的值
        .range(d3.schemeSet2);
      var count=0;
      // Add the shape to this svg!
      databyType = {};
      svg.selectAll("myViolin")
        .data(sumstat)
        .enter()        // So now we are working group per group
        .append("g")
          .attr("transform", function(d){
              var pdata = [];
              for (var i=0;i<d.value.length;i++){
                  for (var j=0;j<d.value[i].length;j++){
                      pdata.push(d.value[i][j]);
                  }
              }
              databyType[d.key] = statisticExceptZero(pdata);
              return("translate(" + x(d.key) +" ,0)")
          } ) // Translation on the right to be at the group position
          .on("mouseover", function (d) {
              //sessionStorage.setItem("dvalue",d.value);
            div2.transition()
                .duration(300)
                .style("opacity", .9);
            div2.html("中值："+formatNum(databyType[d.key][0])+
                "<br>均值："+formatNum(databyType[d.key][1])+
                "<br>最大值："+formatNum(databyType[d.key][2])+
                "<br>最小值："+formatNum(databyType[d.key][3])+
                "<br>点数量："+formatNum(databyType[d.key][4]))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div2.transition()
                .duration(500)
                .style("opacity", 0);
        }).append("path")
            .datum(function(d){ return d.value})     // So now we are working bin per bin
            .style("stroke", "none")
            .style("fill",function (d) {
                return myColorViolin(count++%6);
            })
            .attr("d", d3.area()   // 这里的x0表示底，x1表示高，y表示宽
                .x0( xNum(0) )
                .x1(function(d){ return(xNum(d.length)) } )
                .y(function(d){ return(y((d.x0+d.x1)/2)) } )
                .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            );
    //console.log(databyType);
      // Add individual points with jitter
      var jitterWidth = 40;
      svg
        .selectAll("indPoints")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d){return(x(d.zone) + x.bandwidth()/2 - Math.random()*jitterWidth )})
          .attr("cy", function(d){return(y(d3.median(d.h2.slice(1,-1).split(","))))})
          .attr("r", 4)
          .style("fill", function(d){ return(myColor(d3.median(d.h2.slice(1,-1).split(","))))})
          .attr("stroke", "white")
          .on("mouseover", function (d) {
              //sessionStorage.setItem("dvalue",d.value);
            div3.transition()
                .duration(300)
                .style("opacity", .9);
            div3.html(formatNum(d3.median(d.h2.slice(1,-1).split(","))))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
          .on("mouseout", function (d) {
            div3.transition()
                .duration(500)
                .style("opacity", 0);
            })
          .on("click",function (d) {
              var sub_h2 = d.h2.slice(1,-1).split(',');
              var subdata = [];
              for (i of sub_h2){
                  subdata.push({"electrodes":d.electrodes,"h2":i})
              }
              subviolinFC(subdata,d.zone,d.electrodes)
          })

    });

    var chartButton = violin.append("div").attr("id","chartButton")
        .style("margin-top","10px");
    violin.append("div").attr("id","directionality");
    chartButton.append("button")
        .attr("class","btn btn-primary")
        .attr("title","显示加权方向性小提琴图")
        .style("margin-left","-15px")
        .html("加权方向性")
        .on("click",function () {
            directionality(outData,"wd")
        });
        //.on("click",directionality(outData,"wd"));

    chartButton.append("button")
        .attr("class","btn btn-primary")
        .attr("title","显示非加权方向性小提琴图")
        .style("margin-left","15px")
        .html("非加权方向性")
        .on("click",function () {
            directionality(outData,"nwd")
        });
    chartButton.append("button")
        .attr("class","btn btn-warning")
        .attr("title","取消视图")
        .style("margin-left","15px")
        .html("取消")
        .on("click",function () {
            d3.select("#directionality").selectAll("*").remove();
        });
}

function directionality(data,type) {
    /*
       outData=data;
     */
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 60, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    var direction = d3.select("#directionality");
    direction.selectAll("*").remove();
    var title = "加权方向性小提琴图";
    if (type === "nwd"){
        title = "非加权方向性小提琴图";
    }
    direction.append("h3")
        .html(title)
        .style("width","1000px")
        .attr("align","center");
    var svg = direction
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

      var y = d3.scaleLinear()
        .domain([-1, 1])          // Note that here the Y scale is set manually
        .range([height, 0]);
      svg.append("g").call( d3.axisLeft(y) );

      // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(["ez", "pz", "niz","ez_pz","ez_niz","pz_niz"])
        .padding(0.05); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
      svg.append("g")
          .attr("class","axis_violin")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Features of the histogram
      var histogram = d3.histogram()
            .domain(y.domain())
            .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d);

      // Compute the binning for each group of the dataset
      var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor:分层地分组数组元素。
        .key(function(d) { return d.zone;})
        .rollup(function(d) {   // For each key..
          input = d.map(function(g) { return g[type];});    // Keep the variable called Sepal_Length
          bins = histogram(input);   // And compute the binning on it.
          return(bins)
        })
        .entries(data); //返回一组键-值元组（其实就是一个字典）
      // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
      var maxNum = 0;
      for (i in sumstat ){
        allBins = sumstat[i].value;
        lengths = allBins.map(function(a){return a.length;});
        longuest = d3.max(lengths);
        if (longuest > maxNum) { maxNum = longuest }
      }
      // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
      var xNum = d3.scaleLinear()
        .range([0, x.bandwidth()])
        .domain([-maxNum,maxNum]);

      // Color scale for dots
      var myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([-1,1]);
      var myColorViolin = d3.scaleOrdinal()
        .domain(d3.range(0,6))  //  x.domain()获取x定义域的值
        .range(d3.schemeSet2);
      var count=0;
        var datebyType={};
      svg
        .selectAll("myViolinDirection")
        .data(sumstat)
        .enter()        // So now we are working group per group
        .append("g")
          .attr("transform", function(d){
              var pdata = [];
              for (var i=0;i<d.value.length;i++){
                  for (var j=0;j<d.value[i].length;j++){
                      pdata.push(d.value[i][j]);
                  }
              }
              datebyType[d.key] = pdata;
              return("translate(" + x(d.key) +" ,0)")
          } ) // Translation on the right to be at the group position
          .on("mouseover", function (d) {
              //sessionStorage.setItem("dvalue",d.value);
            div2.transition()
                .duration(300)
                .style("opacity", .9);
            div2.html("中值："+Math.round(d3.median(datebyType[d.key])*10000)/10000+
                "<br>均值："+Math.round(d3.mean(datebyType[d.key])*10000)/10000+
                "<br>最大值："+Math.round(d3.max(datebyType[d.key])*10000)/10000+
                "<br>最小值："+Math.round(d3.min(datebyType[d.key])*10000)/10000)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div2.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .append("path")
            .datum(function(d){ return(d.value)})     // So now we are working bin per bin
            .style("stroke", "none")
            .style("fill",function (d) {
                return myColorViolin(count++%6);
            })
            .attr("d", d3.area()
                .x0( xNum(0) )
                .x1(function(d){ return(xNum(d.length)) } )
                .y(function(d){ return(y((d.x0+d.x1)/2)) } )
                .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            );

      // Add individual points with jitter
      var jitterWidth = 40;
      svg
        .selectAll("indPoints")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d){return(x(d.zone) + x.bandwidth()/2 - Math.random()*jitterWidth )})
          .attr("cy", function(d){return(y(d[type]))})
          .attr("r", 4)
          .style("fill", function(d){ return(myColor(d[type]))})
          .attr("stroke", "white")
          .on("mouseover", function (d) {
            div3.transition()
                .duration(300)
                .style("opacity", .9);
            div3.html(formatNum(d[type]))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
          .on("mouseout", function (d) {
            div3.transition()
                .duration(500)
                .style("opacity", 0);
            });
}

function subviolinFC(data,zone,electrodes) {
    /*

     */
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 50, bottom: 30, left: 50},
        width = 300 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    var sub_violin = d3.select("#violinRight");
    sub_violin.selectAll("*").remove();
    var title = zone.toUpperCase()+"："+electrodes+" FC 小提琴图";
    sub_violin.append("h5")
        .html(title)
        .style("margin-top","30px")
        .style("width","300px")
        .attr("align","center");
    var svg = sub_violin
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    var dataFilter = data.map(function(d){return parseFloat(d.h2) });
    var max_h2 = d3.max(dataFilter) * 1.2;
    var max_y = max_h2 > 1 ? 1 : max_h2;
      var y = d3.scaleLinear()
        .domain([0, max_y])          // Note that here the Y scale is set manually
        .range([height, 0]);
      svg.append("g").call( d3.axisLeft(y) );

      // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain([electrodes])
        .padding(0.05); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
      svg.append("g")
          .attr("class","axis_violin")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Features of the histogram
      var histogram = d3.histogram()
            .domain(y.domain())
            .thresholds(y.ticks(10))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d);

      // Compute the binning for each group of the dataset
      var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor:分层地分组数组元素。
        .key(function(d) { return d.electrodes;})
        .rollup(function(d) {   // For each key..
          input = d.map(function(g) { return g.h2;});    // Keep the variable called Sepal_Length
          bins = histogram(input);   // And compute the binning on it.
          return(bins)
        })
        .entries(data); //返回一组键-值元组（其实就是一个字典）
      // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
      var maxNum = 0;
      for (i in sumstat ){
        allBins = sumstat[i].value;
        lengths = allBins.map(function(a){return a.length;});
        longuest = d3.max(lengths);
        if (longuest > maxNum) { maxNum = longuest }
      }
      // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
      var xNum = d3.scaleLinear()
        .range([0, x.bandwidth()])
        .domain([-maxNum,maxNum]);

      // Color scale for dots
      var myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0,1]);

      var myColorViolin = d3.scaleOrdinal()
        .domain(d3.range(0,6))  //  x.domain()获取x定义域的值
        .range(d3.schemeSet2);
      var count=0;
      // Add the shape to this svg!
        var datebyType={};
      svg.selectAll("myViolin")
        .data(sumstat)
        .enter()        // So now we are working group per group
        .append("g")
          .attr("transform", function(d){
              return("translate(" + x(d.key) +" ,0)")
          } ) // Translation on the right to be at the group position
          .on("mouseover", function (d) {
            div2.transition()
                .duration(300)
                .style("opacity", .9);
            div2.html("中值："+formatNum(d3.median(dataFilter))+
                "<br>均值："+formatNum(d3.mean(dataFilter))+
                "<br>最大值："+formatNum(d3.max(dataFilter))+
                "<br>最小值："+formatNum(d3.min(dataFilter)))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div2.transition()
                .duration(500)
                .style("opacity", 0);
        }).append("path")
            .datum(function(d){ return d.value})     // So now we are working bin per bin
            .style("stroke", "none")
            .style("fill",function (d) {
                switch (zone) {
                    case "ez": return myColorViolin(0);
                    case "pz": return myColorViolin(1);
                    case "niz": return myColorViolin(2);
                    case "ez_pz": return myColorViolin(3);
                    case "ez_niz": return myColorViolin(4);
                    case "pz_niz": return myColorViolin(5);
                }
            })
            .attr("d", d3.area()   // 这里的x0表示底，x1表示高，y表示宽
                .x0( xNum(0) )
                .x1(function(d){ return(xNum(d.length)) } )
                .y(function(d){ return(y((d.x0+d.x1)/2)) } )
                .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            );

      // Add individual points with jitter
      var jitterWidth = 40;
      svg
        .selectAll("indPoints")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d){return(x(d.electrodes) + x.bandwidth()/2 - Math.random()*jitterWidth )})
          .attr("cy", function(d){return(y(d.h2))})
          .attr("r", 4)
          .style("fill", function(d){ return(myColor(d.h2))})
          .attr("stroke", "white")
          .on("mouseover", function (d) {
            div3.transition()
                .duration(300)
                .style("opacity", .9);
            // div.html(parseFloat(d.h2).toFixed(4))
            div3.html(formatNum(d.h2))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
          .on("mouseout", function (d) {
            div3.transition()
                .duration(500)
                .style("opacity", 0);
            });
}

function stream_out_in(data,electrode_names,time,step) {
    /*
    console.log(links)
    var margin = {top: 10, right: 100, bottom: 30, left: 50},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var out_in = d3.select("#out_in");
    out_in.select("svg").remove();
    var svg = out_in
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    var x = d3.scaleLinear()
        .domain([start, start+links[0].length])
        .range([0, width]);
    svg.append("g")
        .attr("class","axis_line")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    */
    var dom = document.getElementById("out_in_river");
    var myChart = echarts.init(dom);
    var option = {
        /*
        title: {
            text: type,
            top: 'bottom',
            left: 'center'
        },
        */
        tooltip: {
            position: function (point, params, dom, rect, size) {
                // point[0] 表示x轴，从左往右；point[1] 表示y轴，从上往下
                //size: 包括 dom（即tooltip) 的尺寸和 echarts 容器的当前尺寸，例如：{contentSize: [width, height], viewSize: [width, height]}。
                // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                // var obj = {top: 70};
                //obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = size.viewSize[0]/2 - 150;
                let obj = {};
                if (point[0] + size.contentSize[0] < size.viewSize[0]){
                    obj['left'] = point[0];
                } else{
                    obj['left'] = point[0] - size.contentSize[0];
                }
                if(point[1] + size.contentSize[1] / 2 < size.viewSize[1]){
                    obj['top'] = point[1] - size.contentSize[1] / 2;
                    if (obj['top'] < 0){
                        obj['top'] = 0;
                    }
                } else{
                    obj['top'] = size.viewSize[1] - size.contentSize[1];
                }
                return obj;
            },
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: 'rgba(0,0,0,0.2)',
                    width: 1,
                    type: 'solid'
                }
            }
        },
        legend: {
            data: electrode_names
        },
        singleAxis: {
            top: 50,
            bottom: 50,
            axisTick: {},
            axisLabel: {},
            type: 'value',
            min: time[0],
            max: time[1],
            name: 'time',
            nameLocation: 'end',
            interval:step,
            axisPointer: {
                animation: true,
                label: {
                    show: true
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dashed',
                    opacity: 0.2
                }
            }
        },
        series: [
            {
                type: 'themeRiver',
                itemStyle: {
                    emphasis: {
                        shadowBlur: 20,
                        shadowColor: 'rgba(0, 0, 0, 0.8)'
                    }
                },
                data: data
            }
        ]
    };
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}

function heat_out_in(data,min,max,electrode_names,time) {
    var dom = document.getElementById("out_in_heat");
    var myChart = echarts.init(dom);

    var option = {
        tooltip: {
            position: 'top',
            formatter: function(params){
                return electrode_names[params.data[1]]+"<br>"+params.name+" : "+params.data[2];
            }
        },
        animation: false,
        grid: {
            height: 'auto',
            y: '2%'
        },
        xAxis: {
            type: 'category',
            data: time,
            splitArea: {
                show: true
            }
        },
        yAxis: {
            type: 'category',
            data: electrode_names,
            splitArea: {
                show: true
            },
            axisLabel:{
                interval:0
            }
        },
        visualMap: {
            min: min,
            max: max,
            calculable: true,
            orient: 'vertical',
            left: '92%',
            bottom: '50%'
        },
        series: [{
            type: 'heatmap',
            data: data,
            label: {
                normal: {
                    show: false  // 设置每个item上是否显示值
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}