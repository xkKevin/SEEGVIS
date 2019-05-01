function linechart1() {
    var width=500;
    var height=500;

    var dataset=[
        {
            country:"china",
            gdp:[[2000,11920],[2001,13170],[2002,14550],
                [2003,16500],[2004,19440],[2005,22870],
                [2006,27930],[2007,35040],[2008,45470],
                [2009,51050],[2010,59490],[2011,73140],
                [2012,83860],[2013,103550],]
        },
        {
            country:"japan",
            gdp:[[2000,47310],[2001,41590],[2002,39800],
                [2003,43020],[2004,46550],[2005,45710],
                [2006,43560],[2007,43560],[2008,48490],
                [2009,50350],[2010,54950],[2011,59050],
                [2012,59370],[2013,48980],]
        }
    ];

    var padding={top:70, right:70, bottom: 70, left:70};
    var gdpmax=0;
    for(var i=0;i<dataset.length;i++){
        var currGdp=d3.max(dataset[i].gdp,function(d){
            return d[1];
        });
        if(currGdp>gdpmax)
            gdpmax=currGdp;
    }
    console.log(gdpmax);

    var xScale=d3.scale.linear()
                .domain([2000,2013])
                .range([0,width-padding.left-padding.right]);

    var yScale=d3.scale.linear()
                .domain([0,gdpmax*1.1])
                .range([height-padding.bottom-padding.top,0]);

    var linePath=d3.svg.line()//创建一个直线生成器
                    .x(function(d){
                        return xScale(d[0]);
                    })
                    .y(function(d){
                        return yScale(d[1]);
                    })
                    .interpolate("basis")//插值模式
                    ;

    //定义两个颜色
    var colors=[d3.rgb(0,0,255),d3.rgb(0,255,0)];

    var svg=d3.select("body")
                    .append("svg")
                    .attr("width",width)
                    .attr("height",height);

    svg.selectAll("path")
        .data(dataset)
        .enter()
        .append("path")
        .attr("transform","translate("+padding.left+","+padding.top+")")
        .attr("d",function(d){
            return linePath(d.gdp);
            //返回线段生成器得到的路径
        })
        .attr("fill","none")
        .attr("stroke-width",3)
        .attr("stroke",function(d,i){
            return colors[i];
        });

    var xAxis=d3.svg.axis()
                .scale(xScale)
                .ticks(5)
                .tickFormat(d3.format("d"))
                .orient("bottom");

    var yAxis=d3.svg.axis()
                .scale(yScale)
                .orient("left");

    //添加一个g用于放x轴
    svg.append("g")
        .attr("class","axis")
        .attr("transform","translate("+padding.left+","+(height-padding.top)+")")
        .call(xAxis);

    svg.append("g")
        .attr("class","axis")
        .attr("transform","translate("+padding.left+","+padding.top+")")
        .call(yAxis);
}

function linechart() {
    // 模拟数据
    var dataset = [
      {x: 0, y: 11}, {x: 1, y: 35},
      {x: 2, y: 23}, {x: 3, y: 78},
      {x: 4, y: 55}, {x: 5, y: 18},
      {x: 6, y: 98}, {x: 7, y: 100},
      {x: 8, y: 22}, {x: 9, y: 65}
    ];
    var width = 600, height = 300;
    // SVG画布边缘与图表内容的距离
    var padding = { top: 50, right: 50, bottom: 50, left: 50 };
    // 创建一个分组用来组合要画的图表元素
    var main = d3.select('.container svg').append('g')
          // 给这个分组加上main类
          .classed('main')
          // 设置该分组的transform属性
          .attr('transform', "translate(" + padding.top + ',' + padding.left + ')');

    var xScale = d3.scale.linear()
        .domain(d3.extent(dataset, function(d) {
          return d.x;
        }))
        .range([0, width - padding.left - padding.right]);
    // 创建y轴的比例尺(线性比例尺)
    var yScale = d3.scale.linear()
        .domain([0, d3.max(dataset,function(d) {
          return d.y;
        })])
        .range([height - padding.top - padding.bottom, 0]);
    // 创建x轴
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');
    // 创建y轴
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');
    // 添加SVG元素并与x轴进行“绑定”
    main.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (height - padding.top - padding.bottom) + ')')
        .call(xAxis);
    // 添加SVG元素并与y轴进行“绑定”
    main.append('g')
        .attr('class', 'axis')
        .call(yAxis);
}

function linechart2() {
        // set the dimensions and margins of the graph
    var margin = {top: 10, right: 100, bottom: 30, left: 30},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv", function(data) {

        // List of groups (here I have one group per column)
        var allGroup = ["valueA", "valueB", "valueC"]

        // add the options to the button
        d3.select("#selectButton")
          .selectAll('myOptions')
            .data(allGroup)
          .enter()
            .append('option')
          .text(function (d) { return d; }) // text showed in the menu
          .attr("value", function (d) { return d; }) // corresponding value returned by the button

        // A color scale: one color for each group
        var myColor = d3.scaleOrdinal()
          .domain(allGroup)
          .range(d3.schemeSet2);

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
          .domain([0,10])
          .range([ 0, width ]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
          .domain( [0,20])
          .range([ height, 0 ]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Initialize line with group a
        var line = svg
          .append('g')
          .append("path")
            .datum(data)
            .attr("d", d3.line()
              .x(function(d) { return x(+d.time) })
              .y(function(d) { return y(+d.valueA) })
            )
            .attr("stroke", function(d){ return myColor("valueA") })
            .style("stroke-width", 4)
            .style("fill", "none")

        // A function that update the chart
        function update(selectedGroup) {

          // Create new data with the selection?
          var dataFilter = data.map(function(d){return {time: d.time, value:d[selectedGroup]} })

          // Give these new data to update line
          line
              .datum(dataFilter)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
                .x(function(d) { return x(+d.time) })
                .y(function(d) { return y(+d.value) })
              )
              .attr("stroke", function(d){ return myColor(selectedGroup) })
        }

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
            update(selectedOption)
        })

    })
}
