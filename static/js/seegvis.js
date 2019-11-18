// 外部的 js 文件可以使用html中 js 定义的变量、函数等，不同js文件中的函数也可以相互调用！
var formatNum = (float) => parseFloat(parseFloat(float).toFixed(4));
var out_height_fun = (n) => n <= 25 ? 24 * n + 200 : 10*(n - 25) + 800; // (n) => 20*n + 250;
$("#nav-1 a").on("click", function() {
    var position = $(this)
        .parent()
        .position();
    var width = $(this)
        .parent()
        .width();
    $("#nav-1 .slide1").css({ opacity: 1, left: +position.left, width: width });
    $(".system_module").css({display: "none"}).eq($(this)[0].name).css({display: "block"});
});

$("#nav-1 a").on("mouseover", function() {
    var position = $(this)
        .parent()
        .position();
    var width = $(this)
        .parent()
        .width();
    $("#nav-1 .slide2")
        .css({
            opacity: 1,
            left: +position.left,
            width: width
        })
        .addClass("squeeze");
});

$("#nav-1 a").on("mouseout", function() {
    $("#nav-1 .slide2")
        .css({ opacity: 0 })
        .removeClass("squeeze");
});

var currentWidth = $("#nav-1 .system_nav")
    .find(".active")
    .parent("li")
    .width();
var current = $(".system_nav .active").position();
$("#nav-1 .slide1").css({ left: +current.left, width: currentWidth });

function distanceChartbyType(e, type) { // type：2, 3, 4
    $(e).siblings().removeClass("btn-warning").addClass("btn-default");
    $(e).removeClass("btn-default").addClass("btn-warning");
    let distance_vis = d3.select("#distance_vis");
    distance_vis.selectAll("*").remove();
    distance_group_static = {};

    Object.keys(distance_group).forEach(function(key){
        let distance_vis_div = distance_vis.append("div").attr("class","distance_vis_div");
        distanceViolin(distance_vis_div,type,parseInt(key),distance_interval);
    });
}

function cal_distance_in(signals, zone) {
    let result = [];
    for (let si=0; si<signals.length-1;si++){
        for (let sj=si+1; sj<signals.length;sj++){
            let sum = 0;
            for (let i=0;i<3;i++){
                sum += Math.pow(two_elect_co[signals[si]][i]-two_elect_co[signals[sj]][i],2);
            }
            let distance = Math.sqrt((sum));
            result.push([zone,[signals[si],signals[sj]],distance]);
        }
    }
    return result;
}

function cal_distance_bwt(s1,s2,zone) {
    let result = [];
    for (let si=0; si<s1.length;si++){
        for (let sj=0; sj<s2.length;sj++){
            let sum = 0;
            for (let i=0;i<3;i++){
                sum += Math.pow(two_elect_co[s1[si]][i]-two_elect_co[s2[sj]][i],2);
            }
            let distance = Math.sqrt((sum));
            result.push([zone,[s1[si],s2[sj]],distance]);
        }
    }
    return result;
}

function statisticExceptZero(data) {
    /**
     * 计算除去0后数组的中值、均值、最大值、最小值、数组长度、Q1、Q3
     */
    let dataExcept0 = [];
    for(let i = 0; i < data.length; i++){
        if (data[i] > 0) {
            dataExcept0.push(data[i])
        }
    }
    let len_e0 = dataExcept0.length;
    if (len_e0){
        dataExcept0.sort();
        // return [d3.median(dataExcept0),d3.mean(dataExcept0),d3.max(dataExcept0),d3.min(dataExcept0),dataExcept0.length];
        return [d3.quantile(dataExcept0,0.5),d3.mean(dataExcept0),dataExcept0[len_e0 - 1],dataExcept0[0],len_e0,d3.quantile(dataExcept0,0.25),d3.quantile(dataExcept0,0.75)];
    }
    return [0,0,0,0,0,0,0];
}
function operateMarks() {
        if ($("#operate_type").text() == "新增"){
            addMarks($("#add_name").val(),$("#add_start").val(),$("#add_end").val(),$("#add_desc").val());
        } else{
            modifyMarks();
        }
        cancel();
    }
function cancel() {
    $("#add_name").val("");
    $("#add_start").val("");
    $("#add_end").val("");
    $("#add_desc").val("");
}
function addMarks(name,start,end,desc){
    let tr = document.createElement("tr");
    let td_name = document.createElement("td");
    td_name.innerText = name;
    let td_start = document.createElement("td");
    td_start.innerText = start;
    let td_end = document.createElement("td");
    td_end.innerText = end;
    let td_desc = document.createElement("td");
    td_desc.innerText = desc;
    let td_apply = document.createElement("td");
    let apply_button = document.createElement("button");
    apply_button.innerText = "应用";
    apply_button.setAttribute("class","btn btn-warning apply");
    let modify_button = document.createElement("button");
    modify_button.innerText = "修改";
    modify_button.setAttribute("class","btn btn-warning modify");
    modify_button.setAttribute("data-toggle","modal");
    modify_button.setAttribute("data-target","#myModal");

    let delete_button = document.createElement("button");
    delete_button.innerText = "删除";
    delete_button.setAttribute("class","btn btn-warning delete");

    td_apply.appendChild(modify_button);
    td_apply.appendChild(delete_button);
    td_apply.appendChild(apply_button);
    tr.appendChild(td_name);
    tr.appendChild(td_start);
    tr.appendChild(td_end);
    tr.appendChild(td_desc);
    tr.appendChild(td_apply);
    $("#time_marks").append(tr);
    // $("#modify_button").on("onclick", modifyMarks(td_name.innerText,td_start.innerText,td_end.innerText,td_desc.innerText));
}
function modifyMarks() {
    mark_select.siblings()[0].innerText = $("#add_name").val();
    mark_select.siblings()[1].innerText = $("#add_start").val();
    mark_select.siblings()[2].innerText = $("#add_end").val();
    mark_select.siblings()[3].innerText = $("#add_desc").val();
}
function saveMarks() {
    //alert("此功能暂未实现！") [0].childNodes[1].innerText
    let all_marks = $("#time_marks").children();
    if (all_marks.length == 0){
        alert("当前没有任何标记！");
        return;
    }
    /*
    marks_list = all_marks.map(function (mark) {
        return [mark.childNodes[0].innerText,mark.childNodes[1].innerText,mark.childNodes[2].innerText,mark.childNodes[3].innerText];
    });
    */
    let marks_list = [['Name','Start','End','Description']];
    for (let i=0;i<all_marks.length; i++){
        marks_list.push([all_marks[i].childNodes[0].innerText,all_marks[i].childNodes[1].innerText,all_marks[i].childNodes[2].innerText,all_marks[i].childNodes[3].innerText])
    }
    // console.log(marks_list);
    exportToCsv('time_marks.csv', marks_list);
}
function readToArray(data) {
    for (let i=1; i<data.length;i++){
        addMarks(data[i][0],data[i][1],data[i][2],data[i][3]);
    }
}

function showCoordinate(obj) {
    let files = obj.files;
    // console.log(files,files[0].name);
    $("#coordinate_file_name").text("当前坐标文件为：" + files[0].name);
    if (files[0]) {
        var reader = new FileReader();
        reader.readAsText(files[0]);
        /*
        reader.onload = function () {
            globaldata = this.result;
        }
        reader.onloadend = function (evt) {
            if(evt.target.readyState == FileReader.DONE){
                globaldata.push(csv2array(reader.result.toString()));
            }
        };
        */
        let electrode_names = fc_info['electrode_names'];
        reader.onload = function (f) {
            //var result = document.getElementById("result");
            //显示文件
            one_elect.clear();
            for(var i=0;i<electrode_names.length;i++){
                var two_e = electrode_names[i].split("-");
                one_elect.add(two_e[0]);
                one_elect.add(two_e[1]);
            }
            var co_data={"ez":[],"pz":[],"niz":[], "unknown":[]};
            var relArr = null;
            if (this.result.includes("\r\n")){
                relArr= this.result.split("\r\n"); // windows 是 回车换行
            }else if(this.result.includes("\n")){
                relArr= this.result.split("\n"); // linux 和 mac 是换行
            }else if(this.result.includes("\r")){
                relArr= this.result.split("\r"); // 有些 mac 是回车 CR
            }
            //var regp = new RegExp(".*,\".*,.*\"$");
            var regp = /[^\w\s,.-]/;
            if (!$.isEmptyObject(relArr) && relArr.length > 1) {
                for (var cokey in one_elect_co){
                    //delete one_elect_co.cokey; 清空字典，只能使用下面的方法
                    delete one_elect_co[cokey];
                }
                // var title_key = relArr[0].split(" ");
                for (var key = 1, len = relArr.length; key < len; key++) {
                    var values = relArr[key];
                    if (regp.test(values)) {
                        alert("文件中第" + (key+1) + "行内容含有非法符号，请修改后再上传！\n" + values);
                        return;
                    }
                    if (!$.isEmptyObject(values)) {
                        var objArr = null;  // electrode x y z type (type可以为空)
                        if (values.includes(",")) {
                            objArr = values.split(",");
                        }else{
                            // objArr = values.split(" ");
                            objArr = values.split(/[ ]+/);
                        }
                        /*
                        for (var j=1;j<objArr.length;j++){
                            obj.push(objArr[j].replace(/\s/ig,'')); //过滤空白字符
                        }
                        */
                        if (objArr.length >= 5){
                            if (objArr[4].toUpperCase() === "EZ"){
                                co_data.ez.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                            } else if (objArr[4].toUpperCase() === "PZ"){
                                co_data.pz.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                            }else if (objArr[4].toUpperCase() === "NIZ"){
                                co_data.niz.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                            } else{
                                co_data.unknown.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                            }
                        }else if(objArr.length === 4){
                            co_data.unknown.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                        }else{
                            alert("文件中第" + (key+1) + "行内容信息不全，请补全后再上传！\n" + values);
                            return;
                        }
                        if (isInSet(objArr[0],one_elect)){
                            one_elect_co[objArr[0]] = [parseFloat(objArr[1]),parseFloat(objArr[2]),parseFloat(objArr[3])];
                        }
                    }
                }
            }
            $("#codination").remove();
            var newM = $("<div id='codination' style='width: 85%;height:500px;' align='center'></div>");
            newM.appendTo($("#electrodes"));
            // console.log(co_data);
            scatter3D(co_data,'codination');
            /*
            var s1 = $("#s1").val();
            var s2 = $("#s2").val();
            if (typeof(s1)==="number"&&typeof(s2)==="number"){
            }
            */
            ez_p.length = 0;
            pz_p.length = 0;
            niz_p.length = 0;
            //console.log(co_data)
            two_elect_co.length = 0;
            for(var ii=0;ii<electrode_names.length;ii++){
                let [one_e,second_e] = electrode_names[ii].split("-");
                two_elect_co.push(centerPoint(one_elect_co[one_e],one_elect_co[second_e]));

                var flag = true;
                for (let jj=0;jj<co_data["ez"].length;jj++){
                    if (co_data["ez"][jj][3].includes(one_e)){
                        ez_p.push(ii);
                        flag = false;
                        break;
                    }
                }
                if (flag){
                    for (let jj=0;jj<co_data["pz"].length;jj++){
                        if (co_data["pz"][jj][3].includes(one_e)){
                            pz_p.push(ii);
                            flag = false;
                            break;
                        }
                    }
                }
                if (flag){
                    for (let jj=0;jj<co_data["niz"].length;jj++){
                        if (co_data["niz"][jj][3].includes(one_e)){
                            niz_p.push(ii);
                            //flag = false;
                            break;
                        }
                    }
                }
            }
            //console.log(ez_p,pz_p,niz_p)
        };
    }
    obj.value = '';
}
function assignZone() {
    if (one_elect.size === 0){
        alert("您未上传空间坐标文件,\n无法默认取值！");
        return;
    }
    if (ez_p.length+pz_p.length+niz_p.length === 0){
        alert("您上传的空间坐标文件与基本信息中的电极不符,\n无法默认取值！");
        return;
    }
    var ez_s="";
    var pz_s="";
    var niz_s="";
    for (i of ez_p){
        ez_s += ", "+i;
    }
    for (i of pz_p){
        pz_s += ", "+i;
    }
    for (i of niz_p){
        niz_s += ", "+i;
    }
    if (ez_s.length){
        $("#EZ").val(ez_s.slice(1))
    }
    if (pz_s.length){
        $("#PZ").val(pz_s.slice(1))
    }
    if (niz_s.length){
        $("#NIZ").val(niz_s.slice(1))
    }
}
function isInSet(item,set) {
    for (var si of set){
        if (item === si){
            return true;
        }
    }
    return false;
}
function strArr2floatArr(strArr) {
    var floatArr = [];
    for (var sai of strArr){
        floatArr.push(parseFloat(sai));
    }
    return floatArr;
}
/*
function twoElectCO(signal,co) {
     // 返回电极对的中心坐标
     // signal的格式例如： ['C4-C5', 'C6-C7']
    var s1 = signal[0].split('-');
    var s2 = signal[1].split('-');
    return [centerPoint(co[s1[0]],co[s1[1]]),centerPoint(co[s2[0]],co[s2[1]])]
}
*/
function centerPoint(co1,co2) {
    if (!(co1&&co2)){
        return null;
    }
    return [(co1[0]+co2[0])/2,(co1[1]+co2[1])/2,(co1[2]+co2[2])/2]
}

function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            }
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=UTF-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
function readFromCsv(file_e, callback) {
    // var file = document.getElementById(file_name).files[0];
    var file = file_e.files[0];
    var reader = new FileReader();
    reader.readAsText(file,'UTF-8');
    //读取完文件之后，执行下面这个回调函数：
    reader.onload = function (evt) {
        let data = csv2array(reader.result.toString());
        // console.log(data);
        callback && callback(data);
    }
}
function csv2array(data, delimeter) {
    // Retrieve the delimeter
    if (delimeter == undefined)
        delimeter = ',';
    if (delimeter && delimeter.length > 1)
        delimeter = ',';

    // initialize variables
    var newline = '\n';
    var eof = '';
    var i = 0;
    var c = data.charAt(i);
    var row = 0;
    var col = 0;
    var array = new Array();

    while (c != eof) {
        // skip whitespaces
        while (c == ' ' || c == '\t' || c == '\r') {
            c = data.charAt(++i); // read next char
        }

        // get value
        var value = "";
        if (c == '\"') {
            // value enclosed by double-quotes
            c = data.charAt(++i);

            do {
                if (c != '\"') {
                    // read a regular character and go to the next character
                    value += c;
                    c = data.charAt(++i);
                }

                if (c == '\"') {
                    // check for escaped double-quote
                    var cnext = data.charAt(i+1);
                    if (cnext == '\"') {
                        // this is an escaped double-quote.
                        // Add a double-quote to the value, and move two characters ahead.
                        value += '\"';
                        i += 2;
                        c = data.charAt(i);
                    }
                }
            }
            while (c != eof && c != '\"');

            if (c == eof) {
                throw "Unexpected end of data, double-quote expected";
            }

            c = data.charAt(++i);
        }
        else {
            // value without quotes
            while (c != eof && c != delimeter && c!= newline) {
                value += c;
                c = data.charAt(++i);
            }
        }

        // add the value to the array
        if (array.length <= row)
            array.push(new Array());
        array[row].push(value);

        // skip whitespaces
        while (c == ' ' || c == '\t' || c == '\r') {
            c = data.charAt(++i);
        }

        // go to the next row or column
        if (c == delimeter) {
            // to the next column
            col++;
        }
        else if (c == newline) {
            // to the next row
            col = 0;
            row++;
        }
        else if (c != eof) {
            // unexpected character
           throw "Delimiter expected after character " + i;
        }

        // go to the next character
        c = data.charAt(++i);
    }

    return array;
}

function downloadFCResult() {
    let rows = [["zone", "electrodes", "h2", "nwd", "wd"]];
    exportToCsv("FC_Result.csv",rows.concat(download_FC_data));
}

function downloadDistanceResult() {
    let rows = [["distance interval","zone", "electrodes", "h2", "nwd", "wd", "distance"]];
    Object.keys(distance_group).forEach(function(key){
        let dis_i = parseInt(key);
        let str_di = distance_interval.toString();
        let times = str_di.length - str_di.indexOf(".");
        let di_str = parseFloat((distance_interval * dis_i).toFixed(times)) + " - " + parseFloat((distance_interval * (dis_i + 1)).toFixed(times)) + " mm";
        rows = rows.concat([di_str].concat(distance_group[key]));
    });
    exportToCsv("Distance_Result.csv",rows);
}

function downloadDistanceStatistic() {
    // distance_group_static {0: {"EZ": [中值、均值、最大值、最小值、数组长度、Q1、Q3]}}
    let rows=[["distance interval","zone","median","mean","max","min","num", "Q1", "Q2"]];
    Object.keys(distance_group_static).forEach(function(key){
        let dis_i = parseInt(key);
        let str_di = distance_interval.toString();
        let times = str_di.length - str_di.indexOf(".");
        let di_str = parseFloat((distance_interval * dis_i).toFixed(times)) + " - " + parseFloat((distance_interval * (dis_i + 1)).toFixed(times)) + " mm";
        if (distance_group_static[key].EZ) rows.push([di_str,"ez"].concat(distance_group_static[key].EZ));
        if (distance_group_static[key].PZ) rows.push([di_str,"pz"].concat(distance_group_static[key].PZ));
        if (distance_group_static[key].NIZ) rows.push([di_str,"niz"].concat(distance_group_static[key].NIZ));
        if (distance_group_static[key].EZ_PZ) rows.push([di_str,"ez_pz"].concat(distance_group_static[key].EZ_PZ));
        if (distance_group_static[key].EZ_NIZ) rows.push([di_str,"ez_niz"].concat(distance_group_static[key].EZ_NIZ));
        if (distance_group_static[key].PZ_NIZ) rows.push([di_str,"pz_niz"].concat(distance_group_static[key].PZ_NIZ));
    });
    exportToCsv("DistanceStatisticResult.csv",rows);
}

function downloadFCStatistic() {
    let rows=[["type","zone","median","mean","max","min","num", "Q1", "Q2"]]; // 中值、均值、最大值、最小值、数组长度、Q1、Q3
    if (databyType.ez) rows.push(["h2","ez"].concat(databyType.ez));
    if (databyType.pz) rows.push(["h2","pz"].concat(databyType.pz));
    if (databyType.niz) rows.push(["h2","niz"].concat(databyType.niz));
    if (databyType.ez_pz) rows.push(["h2","ez_pz"].concat(databyType.ez_pz));
    if (databyType.ez_niz) rows.push(["h2","ez_niz"].concat(databyType.ez_niz));
    if (databyType.pz_niz) rows.push(["h2","pz_niz"].concat(databyType.pz_niz));
    // show_type_direction : 3 表示 "nwd" 4 表示 "wd"
    if (show_type_direction){
        let direct_type =  show_type_direction === 3 ? "nwd" : "wd";
        if (directionByType.ez) rows.push([direct_type,"ez"].concat(directionByType.ez));
        if (directionByType.pz) rows.push([direct_type,"pz"].concat(directionByType.pz));
        if (directionByType.niz) rows.push([direct_type,"niz"].concat(directionByType.niz));
        if (directionByType.ez_pz) rows.push([direct_type,"ez_pz"].concat(directionByType.ez_pz));
        if (directionByType.ez_niz) rows.push([direct_type,"ez_niz"].concat(directionByType.ez_niz));
        if (directionByType.pz_niz) rows.push([direct_type,"pz_niz"].concat(directionByType.pz_niz));
    }
    exportToCsv("FCStatisticResult.csv",rows);
}

function downloadOUTStatistic() {
    let rows=[["","",type_note,"",""],["TIME","EZ","PZ","NIZ","UNKNOWN"]];
    exportToCsv("OUTStatisticResult.csv",rows.concat(download_zone_data));
}

function to_list(str_num) {
     /*
    :param str_num: 字符串："4-8,10,15-17"
    :return: 整数列表：[4, 5, 6, 7, 8, 10, 15, 16, 17]
    */
    str_num = str_num.replace(/\s*/g,"");  // 去除字符串所有空格
    if (!str_num){  // 为空
        return [];
    }
    let re = /^\d+(-\d+)?(,\d+(-\d+)?)*$/;
    if (!re.test(str_num)) {
        // "格式不正确！\n正确格式应如：1-3,6"
        return "区域输入格式有误！正确格式应如：1-3,6";
    }
    result = [];
    for (let i of str_num.split(",")){
        let tmp = i.split("-");
        let int_start =  parseInt(tmp[0]);
        if (tmp.length == 2){  // dd3.range("2","6","2")  ==> [2,4]  d3.range 可接收字符串
            let int_end =  parseInt(tmp[1]);
            if (int_start >= int_end) return " "+i+" 输入有误！后面的数应大于前面的数！";
            result = result.concat(d3.range(int_start, int_end + 1));
        }else{
            result.push(int_start)
        }
    }
    return distinct_sort(result);  // 列表去重，并且从小到大排序
}

function distinct_sort(arr) {
    let i,obj = {},result = [];
    for(i = 0; i< arr.length; i++){
        if(!obj[arr[i]]){ //如果能查找到，证明数组元素重复了
            obj[arr[i]] = 1;
            result.push(arr[i]);
        }
    }
    return result.sort((a,b)=>a-b);
}

function referZone() {
    ez_u = to_list(ez.val());
    pz_u = to_list(pz.val());
    niz_u = to_list(niz.val());

    if (typeof(ez_u) === "string"){
        alert("参考区域失败！\nEZ" + ez_u);
        ez_u = [];
        return;
    } else{
        if (ez_u.length && ez_u[ez_u.length-1] >= elen){
            alert("参考区域失败！\nEZ" + zone_elen_warn);
            ez_u = [];
            return;
        }
    }
    if (typeof(pz_u) === "string"){
        alert("参考区域失败！\nPZ" + pz_u);
        pz_u = [];
        return;
    }else{
        if (pz_u.length && pz_u[pz_u.length-1] >= elen){
            alert("参考区域失败！\nPZ" + zone_elen_warn);
            pz_u = [];
            return;
        }
    }
    if (typeof(niz_u) === "string"){
        alert("参考区域失败！\nNIZ" + niz_u);
        niz_u = [];
        return;
    }else{
        if (niz_u.length && niz_u[niz_u.length-1] >= elen){
            alert("参考区域失败！\nNIZ" + zone_elen_warn);
            niz_u = [];
            return;
        }
    }
    if (!(ez_u.length + pz_u.length + niz_u.length)){
        alert("请先确定区域！(EZ、PZ、NIZ不一定要全部输入）\n请用数字表示，格式应如：0-2,4");
        return;
    }
    select_channels.selectpicker("val",ez_u.concat(pz_u).concat(niz_u));
    $("#electrodes_num").text(select_channels.val().length);
}